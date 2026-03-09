export type LeadStatus = {
  id: string;
  label: string;
  color: string;
  updatedAt?: number;
};

export type Question = {
  id: string;
  text: string;
  order: number;
  updatedAt?: number;
};

export type LeadAnswer = {
  questionId: string;
  answer: string;
};

export interface Lead {
  id: string;
  createdAt: number;
  updatedAt: number;
  nomeRetifica: string;
  responsavel: string;
  uf: string;
  cidade: string;
  telefone: string;
  status: string;
  compraEstimada: number;
  planilhaEnviada: 'Sim' | 'Não';
  liveAgendada: number | null;
  fechou: 'Sim' | 'Não';
  motivoPerda: string;
  observacao: string;
  answers: LeadAnswer[];
}

export interface AppSettings {
  id: string;
  directoryHandle?: FileSystemDirectoryHandle;
  lastSync?: number;
  autoSync: boolean;
  syncInterval?: number; // in minutes
  updatedAt?: number;
}
