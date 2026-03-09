import { Lead, Question, LeadStatus } from './types';

export const DEFAULT_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Como você conheceu nossa empresa?', order: 0, updatedAt: Date.now() },
  { id: 'q2', text: 'Qual o principal desafio que você enfrenta hoje?', order: 1, updatedAt: Date.now() },
  { id: 'q3', text: 'Você já utiliza alguma solução similar?', order: 2, updatedAt: Date.now() },
];

export const INITIAL_STATUSES: LeadStatus[] = [
  { id: 's1', label: 'Não tem interesse', color: '#ef4444', updatedAt: Date.now() },
  { id: 's2', label: 'Tem interesse', color: '#22c55e', updatedAt: Date.now() },
  { id: 's3', label: 'Pendente', color: '#f59e0b', updatedAt: Date.now() },
  { id: 's4', label: 'Ligar mais tarde', color: '#3b82f6', updatedAt: Date.now() },
];
