'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | Array<{ id: string; name: string }>;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function ModernSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  className = '',
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if options are objects or strings
  const isObjectOptions = options.length > 0 && typeof options[0] === 'object';
  const displayOptions = isObjectOptions 
    ? (options as Array<{ id: string; name: string }>)
    : (options as string[]).map(opt => ({ id: opt, name: opt }));

  const getDisplayValue = () => {
    const selected = displayOptions.find(opt => opt.id === value);
    return selected?.name || placeholder;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1 relative z-20 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-bold text-text-muted uppercase block">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-text-primary text-xs font-medium flex items-center justify-between hover:border-accent-primary/50 hover:bg-bg-card transition-all group"
        >
          <span className="capitalize">
            {getDisplayValue()}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted group-hover:text-accent-primary transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border-2 border-accent-primary/30 rounded-lg shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-56 overflow-y-auto">
              {displayOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-3 text-xs font-medium text-left capitalize flex items-center justify-between transition-colors border-b border-border/50 last:border-b-0 whitespace-nowrap ${
                    value === option.id
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'text-text-primary hover:bg-bg-secondary/60'
                  }`}
                >
                  <span className="truncate flex-1">{option.name}</span>
                  {value === option.id && (
                    <Check className="w-4 h-4 text-accent-primary flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
