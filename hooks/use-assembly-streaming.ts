'use client';

import { useState, useRef, useEffect } from 'react';

export function useAssemblyStreaming({ 
  onTranscript 
}: { 
  onTranscript: (text: string, isFinal: boolean) => void 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setError(null);
    setIsRecording(true);

    try {
      // 1. Fetch temp token
      const tokenRes = await fetch('/api/assembly/stream');
      if (!tokenRes.ok) throw new Error("Could not fetch token");
      const { token, mock } = await tokenRes.json();

      if (mock) {
        // Fallback Simulation Mode
        console.warn("No AssemblyAI Key. Starting simulated transcription.");
        const sentences = [
          "This is a demonstration of AssemblyAI speech to text streaming.",
          "As you speak, text is sent through WebSockets and rendered at your editor cursor.",
          "FlowBase provides collaborative, real time pages and smart assistant controls."
        ];
        let index = 0;
        
        mockIntervalRef.current = setInterval(() => {
          if (index < sentences.length) {
            onTranscript(sentences[index] + " ", true);
            index++;
          } else {
            stopRecording();
          }
        }, 3000);
        return;
      }

      // 2. Connect to WebSocket
      const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            // Read as arrayBuffer and convert to raw PCM base64 (omitting the header)
            // AssemblyAI expects raw PCM 16-bit. For absolute simplicity in frontend:
            // Convert to PCM or send webm blobs directly if configured by assembly stream params
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              socket.send(JSON.stringify({ audio_data: base64 }));
            };
            reader.readAsDataURL(e.data);
          }
        };

        // Send recording segments every 250ms
        mediaRecorder.start(250);
      };

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.text) {
          onTranscript(data.text, data.message_type === 'FinalTranscript');
        }
      };

      socket.onerror = (e) => {
        console.error("AssemblyAI Socket error:", e);
        setError("WebSocket error occurred");
      };

      socket.onclose = () => {
        stopRecording();
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start streaming");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording
  };
}
export default useAssemblyStreaming;
