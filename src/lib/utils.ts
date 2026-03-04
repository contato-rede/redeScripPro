import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/\D/g, '');
  return Number(cleaned) / 100;
}

export function formatPhoneNumber(value: string) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Palavras que devem permanecer em minúsculo (exceto se forem a primeira palavra)
const LOWERCASE_WORDS = ['e', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'por', 'com', 'sem'];

/**
 * Converte texto para formato CamelCase (Title Case)
 * - Primeira letra de cada palavra em maiúscula
 * - Palavras como "E", "De", "Da", "Do" permanecem em minúsculo (exceto se forem a primeira palavra)
 * - Preserva caracteres especiais e acentos
 * 
 * Exemplos:
 * - "MECÂNICA E RETÍFICA BORGES" → "Mecânica E Retífica Borges"
 * - "ROBSON SOARES" → "Robson Soares"
 * - "de carvalho" → "De Carvalho"
 */
export function toCamelCase(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      // Se for a primeira palavra ou não estiver na lista de palavras minúsculas, capitalizar
      if (index === 0 || !LOWERCASE_WORDS.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Caso contrário, manter minúsculo
      return word.toLowerCase();
    })
    .join(' ');
}
