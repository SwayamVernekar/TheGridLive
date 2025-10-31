// Naively converted from TypeScript — please review for correctness.
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';



export function DropdownSelect({ label, options, value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <label className="block text-f1light mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-f1gray text-f1light px-4 py-3 rounded-lg flex items-center justify-between border-2 border-transparent focus:border-f1red transition-all"
      >
        <span>{value}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-f1gray rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-f1light hover:bg-f1red/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
