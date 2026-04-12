import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleToggle = useCallback(() => {
    if (!isOpen && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const requiredSpace = 200; // max-h-48 is 192px, add some buffer

        if (spaceBelow < requiredSpace && rect.top > requiredSpace) {
            setPosition('top');
        } else {
            setPosition('bottom');
        }
    }
    setIsOpen(prev => !prev);
  }, [isOpen]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  const optionsClasses = [
    "absolute left-0 right-0 z-10 pixel-panel bg-[var(--pixel-bg-color)] max-h-48 overflow-y-auto",
    position === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
  ].join(' ');

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        onClick={handleToggle}
        className="pixel-button p-2 w-full text-lg flex items-center justify-between"
      >
        <span className="truncate" style={{fontFamily: selectedOption.value}}>{selectedOption.label}</span>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      {isOpen && (
        <div className={optionsClasses}>
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 cursor-pointer hover:bg-[var(--pixel-highlight-color)] truncate ${value === option.value ? 'bg-[var(--pixel-highlight-color)]' : ''}`}
                style={{ fontFamily: option.value }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
