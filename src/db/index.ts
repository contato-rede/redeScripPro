import Dexie, { Table } from 'dexie';
import { Lead, Question, LeadStatus, AppSettings } from '../types';

export class AppDatabase extends Dexie {
  leads!: Table<Lead>;
  questions!: Table<Question>;
  statuses!: Table<LeadStatus>;
  settings!: Table<AppSettings>;

  constructor() {
    super('CallScriptDB');
    this.version(2).stores({
      leads: '++id, createdAt, nomeRetifica, status',
      questions: 'id, order',
      statuses: 'id',
      settings: 'id'
    });
  }
}

export const db = new AppDatabase();
