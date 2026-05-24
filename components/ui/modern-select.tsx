'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
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
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
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
            {value || placeholder}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted group-hover:text-accent-primary transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border rounded-lg shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-56 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-xs font-medium text-left capitalize flex items-center justify-between hover:bg-bg-secondary transition-colors ${
                    value === option
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-primary'
                  }`}
                >
                  <span>{option}</span>
                  {value === option && (
                    <Check className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
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
