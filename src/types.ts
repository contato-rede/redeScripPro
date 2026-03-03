export type LeadStatus = {
  id: string;
  label: string;
  color: string;
};

export type Question = {
  id: string;
  text: string;
  order: number;
};

export type LeadAnswer = {
  questionId: string;
  answer: string;
};

export interface Lead {
  id?: number;
  createdAt: Date;
  nomeRetifica: string;
  responsavel: string;
  uf: string;
  cidade: string;
  telefone: string;
  status: string;
  compraEstimada: number;
  planilhaEnviada: 'Sim' | 'Não';
  liveAgendada: Date | null;
  fechou: 'Sim' | 'Não';
  motivoPerda: string;
  observacao: string;
  answers: LeadAnswer[];
}

export interface AppSettings {
  id: string;
  directoryHandle?: FileSystemDirectoryHandle;
  lastSync?: Date;
  autoSync: boolean;
  syncInterval?: number; // in minutes
}
