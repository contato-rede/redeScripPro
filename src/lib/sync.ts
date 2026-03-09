import * as XLSX from 'xlsx';
import { db } from '../db';
import { Lead, Question, LeadStatus, AppSettings } from '../types';

const FILE_NAME = 'RedeScript_Dados.xlsx';
const SHEET_NAMES = {
  METADATA: 'Metadata',
  LEADS: 'Leads',
  SCRIPT: 'Script',
  STATUSES: 'Status',
  SETTINGS: 'Configuracoes'
};

/**
 * Valida se o diretório está acessível antes da sincronização
 */
async function validateDirectory(directoryHandle: FileSystemDirectoryHandle | undefined): Promise<{ valid: boolean; error?: string }> {
  if (!directoryHandle) {
    return { valid: false, error: 'Nenhuma pasta de trabalho selecionada. Por favor, selecione uma pasta nas configurações.' };
  }

  try {
    const status = await (directoryHandle as any).queryPermission({ mode: 'readwrite' });
    if (status !== 'granted') {
      const newStatus = await (directoryHandle as any).requestPermission({ mode: 'readwrite' });
      if (newStatus !== 'granted') {
        return { valid: false, error: 'Permissões de escrita negada.' };
      }
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Pasta de trabalho não acessível.' };
  }
}

/**
 * Função principal de Sincronização Total (Bidirecional)
 */
export async function syncEverything(directoryHandle: FileSystemDirectoryHandle | undefined) {
  const validation = await validateDirectory(directoryHandle);
  if (!validation.valid) throw new Error(validation.error);

  const handle = directoryHandle as FileSystemDirectoryHandle;
  const now = Date.now();

  try {
    // 1. Carregar dados atuais do IndexedDB
    const localLeads = await db.leads.toArray();
    const localQuestions = await db.questions.toArray();
    const localStatuses = await db.statuses.toArray();
    const localSettings = await db.settings.get('main');

    // 2. Tentar ler dados do arquivo Excel (se existir)
    let excelData: any = {};
    try {
      const fileHandle = await handle.getFileHandle(FILE_NAME);
      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      const sheetToArr = (name: string) => XLSX.utils.sheet_to_json(workbook.Sheets[name] || {});
      excelData = {
        leads: sheetToArr(SHEET_NAMES.LEADS),
        questions: sheetToArr(SHEET_NAMES.SCRIPT),
        statuses: sheetToArr(SHEET_NAMES.STATUSES),
        settings: sheetToArr(SHEET_NAMES.SETTINGS)
      };
    } catch (e) {
      console.log('Arquivo Excel não encontrado ou novo. Criando primeira versão.');
    }

    // 3. Processar Leads (Merge Inteligente)
    const remoteLeads: Lead[] = (excelData.leads || []).map((row: any) => ({
      id: String(row['ID']),
      createdAt: Number(row['CreatedAt'] || row['Data'] || now),
      updatedAt: Number(row['UpdatedAt'] || now),
      nomeRetifica: String(row['Nome Retifica'] || ''),
      responsavel: String(row['Responsavel'] || ''),
      uf: String(row['UF'] || ''),
      cidade: String(row['Cidade'] || ''),
      telefone: String(row['Telefone'] || ''),
      status: String(row['Status'] || 'Pendente'),
      compraEstimada: Number(row['Compra Estimada'] || 0),
      planilhaEnviada: row['Planilha Enviada'] === 'Sim' ? 'Sim' : 'Não',
      liveAgendada: row['Live Agendada'] ? Number(row['Live Agendada']) : null,
      fechou: row['Fechou'] === 'Sim' ? 'Sim' : 'Não',
      motivoPerda: String(row['Motivo Perda'] || ''),
      observacao: String(row['Observacao'] || ''),
      answers: JSON.parse(row['Respostas JSON'] || '[]')
    }));

    const finalLeads = mergeItems(localLeads, remoteLeads);

    // 4. Processar Script e Status
    const remoteQuestions: Question[] = (excelData.questions || []).map((row: any) => ({
      id: String(row['ID']),
      order: Number(row['Ordem'] || 0),
      text: String(row['Pergunta'] || ''),
      updatedAt: Number(row['UpdatedAt'] || now)
    }));
    const finalQuestions = mergeItems(localQuestions, remoteQuestions);

    const remoteStatuses: LeadStatus[] = (excelData.statuses || []).map((row: any) => ({
      id: String(row['ID']),
      label: String(row['Label'] || ''),
      color: String(row['Cor'] || '#6366f1'),
      updatedAt: Number(row['UpdatedAt'] || now)
    }));
    const finalStatuses = mergeItems(localStatuses, remoteStatuses);

    // 5. Atualizar Banco de Dados Local (IndexedDB)
    await db.transaction('rw', [db.leads, db.questions, db.statuses, db.settings], async () => {
      await Promise.all([
        db.leads.bulkPut(finalLeads),
        db.questions.bulkPut(finalQuestions),
        db.statuses.bulkPut(finalStatuses),
        db.settings.update('main', { lastSync: now })
      ]);
    });

    // 6. Gravar novo Excel (Fonte Unificada)
    const wb = XLSX.utils.book_new();

    // Metadata
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      'Versao': '2.0',
      'Data Sincronia': new Date().toISOString(),
      'Sincronizacao': 'Bidirecional'
    }]), SHEET_NAMES.METADATA);

    // Leads
    const exportLeads = finalLeads.map(l => ({
      'ID': l.id,
      'CreatedAt': l.createdAt,
      'UpdatedAt': l.updatedAt,
      'Data': new Date(l.createdAt).toLocaleString(),
      'Nome Retifica': l.nomeRetifica,
      'Responsavel': l.responsavel,
      'UF': l.uf,
      'Cidade': l.cidade,
      'Telefone': l.telefone,
      'Status': l.status,
      'Compra Estimada': l.compraEstimada,
      'Planilha Enviada': l.planilhaEnviada,
      'Live Agendada': l.liveAgendada,
      'Fechou': l.fechou,
      'Motivo Perda': l.motivoPerda,
      'Observacao': l.observacao,
      'Respostas JSON': JSON.stringify(l.answers)
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportLeads), SHEET_NAMES.LEADS);

    // Script & Status
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finalQuestions.map(q => ({
      'ID': q.id, 'Ordem': q.order, 'Pergunta': q.text, 'UpdatedAt': q.updatedAt
    }))), SHEET_NAMES.SCRIPT);

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finalStatuses.map(s => ({
      'ID': s.id, 'Label': s.label, 'Cor': s.color, 'UpdatedAt': s.updatedAt
    }))), SHEET_NAMES.STATUSES);

    // Settings (sem directoryHandle)
    if (localSettings) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
        'ID': localSettings.id,
        'Auto Sync': localSettings.autoSync ? 'Sim' : 'Nao',
        'Intervalo Sync (min)': localSettings.syncInterval || 5,
        'Ultima Sync': now
      }]), SHEET_NAMES.SETTINGS);
    }

    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const fileHandle = await handle.getFileHandle(FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(excelBuffer);
    await writable.close();

    return {
      success: true,
      stats: {
        leads: finalLeads.length,
        questions: finalQuestions.length,
        statuses: finalStatuses.length
      },
      leads: { imported: finalLeads.length, skipped: 0 }, // Para compatibilidade com importFromLocalExcel
      questions: { imported: finalQuestions.length, skipped: 0 },
      statuses: { imported: finalStatuses.length, skipped: 0 },
      settings: { imported: true }
    };
  } catch (error) {
    console.error('Falha na sincronização TOTAL:', error);
    throw error;
  }
}

/**
 * Lógica de Merge: Compara dois arrays de itens pelo ID e updatedAt
 */
function mergeItems<T extends { id: string; updatedAt?: number }>(local: T[], remote: T[]): T[] {
  const mergedMap = new Map<string, T>();

  // Primeiro adiciona todos os locais
  local.forEach(item => mergedMap.set(item.id, item));

  // Compara com remotos
  remote.forEach(remoteItem => {
    const localItem = mergedMap.get(remoteItem.id);

    if (!localItem) {
      // Item novo no Excel, adiciona no local
      mergedMap.set(remoteItem.id, remoteItem);
    } else {
      // Item existe em ambos, o que tiver o maior updatedAt vence
      const localTime = localItem.updatedAt || 0;
      const remoteTime = remoteItem.updatedAt || 0;

      if (remoteTime > localTime) {
        mergedMap.set(remoteItem.id, remoteItem);
      }
    }
  });

  return Array.from(mergedMap.values());
}

// Manter exportações antigas para compatibilidade de nomes se necessário, mapeando para o novo sync
export const syncToLocalExcel = syncEverything;
export const importFromLocalExcel = async (handle: any) => syncEverything(handle);

