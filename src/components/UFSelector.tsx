import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { ESTADOS_BRASIL, getUFs, getEstadoNomeByUF } from '../constants/brazilLocations';

interface UFSelectorProps {
  value: string;
  onChange: (uf: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UFSelector({ value, onChange, error, disabled }: UFSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const ufs = getUFs();
  
  const filteredUFs = ufs.filter(uf => 
    uf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEstadoNomeByUF(uf).toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (uf: string) => {
    onChange(uf);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        UF <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <MapPin className="input-icon" size={18} />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "input-field-icon text-left flex items-center justify-between whitespace-nowrap",
            error && "border-red-500 focus:ring-red-500",
            disabled && "bg-slate-100 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <span className={cn(
            "truncate",
            value ? 'text-slate-900' : 'text-slate-400'
          )}>
            {value ? `${value} - ${getEstadoNomeByUF(value)}` : 'Selecione a UF'}
          </span>
          <ChevronDown 
            size={18} 
            className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="Buscar UF..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredUFs.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500">
                Nenhuma UF encontrada
              </div>
            ) : (
              filteredUFs.map((uf) => (
                <button
                  key={uf}
                  type="button"
                  onClick={() => handleSelect(uf)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition-colors",
                    value === uf && "bg-indigo-50 text-indigo-700"
                  )}
                >
                  <span className="font-semibold">{uf}</span>
                  <span className="text-slate-500 ml-2">
                    - {getEstadoNomeByUF(uf)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
