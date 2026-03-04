import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCidadesByUF, searchCidades, isValidCidadeForUF } from '../constants/brazilLocations';

interface CidadeSelectorProps {
  value: string;
  uf: string;
  onChange: (cidade: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CidadeSelector({ value, uf, onChange, error, disabled }: CidadeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cidades = uf ? getCidadesByUF(uf) : [];
  
  const filteredCidades = searchTerm
    ? cidades.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    : cidades;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search when UF changes
  useEffect(() => {
    setSearchTerm('');
    setIsOpen(false);
  }, [uf]);

  const handleSelect = (cidade: string) => {
    onChange(cidade);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    
    // Se o usuário está digitando, abre o dropdown
    if (!isOpen && newValue.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (uf && !disabled) {
      setIsOpen(true);
    }
  };

  // Verifica se o valor atual é uma cidade válida
  const isValidValue = value && uf ? isValidCidadeForUF(value, uf) : true;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Cidade <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Building2 className="input-icon" size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder={uf ? 'Digite ou selecione a cidade' : 'Selecione a UF primeiro'}
          className={cn(
            "input-field-icon",
            error && "border-red-500 focus:ring-red-500",
            disabled && "bg-slate-100 cursor-not-allowed",
            value && !isValidValue && "border-yellow-400 focus:ring-yellow-400"
          )}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled || !uf}
        />
        {uf && (
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            disabled={disabled}
          >
            <ChevronDown 
              size={18} 
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </button>
        )}
      </div>

      {value && !isValidValue && (
        <p className="text-yellow-600 text-xs mt-1">
          Cidade não encontrada na lista oficial. Verifique a grafia.
        </p>
      )}

      {isOpen && uf && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="Buscar cidade..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredCidades.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500">
                {searchTerm ? 'Nenhuma cidade encontrada' : 'Digite para buscar'}
              </div>
            ) : (
              <>
                {filteredCidades.slice(0, 50).map((cidade) => (
                  <button
                    key={cidade}
                    type="button"
                    onClick={() => handleSelect(cidade)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-slate-100 transition-colors",
                      value === cidade && "bg-indigo-50 text-indigo-700"
                    )}
                  >
                    {cidade}
                  </button>
                ))}
                {filteredCidades.length > 50 && (
                  <div className="px-4 py-2 text-xs text-slate-400 text-center">
                    ... e mais {filteredCidades.length - 50} cidades
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
