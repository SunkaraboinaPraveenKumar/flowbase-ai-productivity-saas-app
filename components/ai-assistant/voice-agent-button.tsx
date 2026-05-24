'use client';

import { Mic, MicOff } from 'lucide-react';

interface VoiceAgentButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export default function VoiceAgentButton({ isActive, onClick }: VoiceAgentButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3.5 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg ${
        isActive 
          ? 'bg-accent-rose border-accent-rose text-white animate-pulse' 
          : 'bg-accent-primary border-accent-primary/20 text-white hover:bg-accent-primary/95 shadow-glow'
      }`}
      title={isActive ? "Mute Voice Agent session" : "Start conversational AI Voice Session"}
    >
      {isActive ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      
      {isActive && (
        <span className="absolute -inset-1 rounded-full border border-accent-rose/50 animate-ping opacity-60 pointer-events-none" />
      )}
    </button>
  );
}
export { VoiceAgentButton };
