'use client';

import { Mic, MicOff } from 'lucide-react';

interface SpeakButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export default function SpeakButton({ isRecording, onClick }: SpeakButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold ${
        isRecording 
          ? 'bg-accent-rose/10 border-accent-rose text-accent-rose animate-pulse' 
          : 'bg-accent-primary/10 border-accent-primary/30 hover:border-accent-primary text-accent-primary'
      }`}
      title={isRecording ? "Stop voice recording" : "Transcribe audio stream live"}
    >
      {isRecording ? (
        <>
          <MicOff className="w-4 h-4" />
          <span className="hidden sm:inline">Recording...</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline">Speak to Note</span>
        </>
      )}
    </button>
  );
}
