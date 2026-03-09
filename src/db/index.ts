import Dexie, { Table } from 'dexie';
import { Lead, Question, LeadStatus, AppSettings } from '../types';

export class AppDatabase extends Dexie {
  leads!: Table<Lead>;
  questions!: Table<Question>;
  statuses!: Table<LeadStatus>;
  settings!: Table<AppSettings>;

  constructor() {
    super('RedeScriptDB_V2');
    this.version(1).stores({
      leads: 'id, createdAt, updatedAt, nomeRetifica, status',
      questions: 'id, order, updatedAt',
      statuses: 'id, updatedAt',
      settings: 'id, updatedAt'
    });
  }
}

export const db = new AppDatabase();
