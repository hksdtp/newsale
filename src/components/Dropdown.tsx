import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
  icon?: React.ComponentType<any>;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  label,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-white font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-left hover:border-gray-500 transition-colors focus:border-blue-500 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedOption ? (
              <>
                {selectedOption.color && (
                  <div className={`w-3 h-3 rounded-full ${selectedOption.color}`}></div>
                )}
                {selectedOption.icon && (
                  <selectedOption.icon className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-white">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="py-2 max-h-60 overflow-y-auto modal-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3
                  ${value === option.value ? 'bg-gray-700' : ''}
                `}
              >
                <div className="flex items-center gap-2 flex-1">
                  {option.color && (
                    <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                  )}
                  {option.icon && (
                    <option.icon className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-white">{option.label}</span>
                </div>
                {value === option.value && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
