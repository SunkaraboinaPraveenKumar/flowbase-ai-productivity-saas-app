'use client';

import { useState, useRef, useEffect } from 'react';

export function useAssemblyStreaming({
  onTranscript,
}: {
  onTranscript: (text: string, isFinal: boolean) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert Float32 PCM samples → Int16 PCM buffer (what AssemblyAI v3 expects)
  const float32ToInt16 = (float32Array: Float32Array): ArrayBuffer => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array.buffer;
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }

    // Stop audio pipeline
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Close WebSocket
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  };

  const startRecording = async () => {
    setError(null);

    try {
      // 1. Fetch temp token from our backend
      const tokenRes = await fetch('/api/assembly/stream');
      if (!tokenRes.ok) throw new Error('Could not fetch token');
      const { token, mock } = await tokenRes.json();

      // ── Simulation / mock mode (no API key configured) ──────────────────
      if (mock) {
        console.warn('No AssemblyAI key — starting simulated transcription.');
        setIsRecording(true);
        const sentences = [
          'This is a demonstration of AssemblyAI speech to text streaming.',
          'As you speak, text is sent through WebSockets and rendered at your editor cursor.',
          'FlowBase provides collaborative, real-time pages and smart assistant controls.',
        ];
        let index = 0;
        mockIntervalRef.current = setInterval(() => {
          if (index < sentences.length) {
            onTranscript(sentences[index] + ' ', true);
            index++;
          } else {
            stopRecording();
          }
        }, 3000);
        return;
      }

      // ── Real AssemblyAI v3 streaming ─────────────────────────────────────
      // 2. Request mic access first (better UX — fail fast before WebSocket)
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;

      // 3. Connect to AssemblyAI v3 WebSocket
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${token}&encoding=pcm_s16le`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsRecording(true);

        // 4. Set up Web Audio pipeline to capture raw PCM-16 at 16kHz
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(micStream);
        // ScriptProcessorNode buffer of 4096 frames @ 16kHz ≈ 256ms chunks
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (socket.readyState !== WebSocket.OPEN) return;
          const float32 = e.inputBuffer.getChannelData(0);
          const pcm16 = float32ToInt16(float32);
          socket.send(pcm16);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      // 5. Handle incoming transcript messages
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // v3 message types: 'PartialTranscript' | 'FinalTranscript' | 'SessionBegins' | 'SessionTerminated' | 'SessionInformation'
          if (data.message_type === 'PartialTranscript' && data.text) {
            onTranscript(data.text, false);
          } else if (data.message_type === 'FinalTranscript' && data.text) {
            onTranscript(data.text, true);
          } else if (data.error) {
            console.error('AssemblyAI error message:', data.error);
            setError(data.error);
            stopRecording();
          }
        } catch (parseErr) {
          console.error('Failed to parse AssemblyAI message:', parseErr);
        }
      };

      socket.onerror = (e) => {
        console.error('AssemblyAI WebSocket error:', e);
        setError('Connection error — check your API key and network.');
        stopRecording();
      };

      socket.onclose = (e) => {
        if (e.code !== 1000) {
          console.warn('AssemblyAI socket closed unexpectedly:', e.code, e.reason);
        }
        stopRecording();
      };
    } catch (err: any) {
      console.error('startRecording error:', err);
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
      // Clean up any partial state
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isRecording, error, startRecording, stopRecording };
}

export default useAssemblyStreaming;
