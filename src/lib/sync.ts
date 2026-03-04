import * as XLSX from 'xlsx';
import { db } from '../db';
import { format, parse } from 'date-fns';
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
    // Verificar permissões de escrita
    const status = await (directoryHandle as any).queryPermission({ mode: 'readwrite' });
    if (status !== 'granted') {
      // Tentar solicitar permissão
      const newStatus = await (directoryHandle as any).requestPermission({ mode: 'readwrite' });
      if (newStatus !== 'granted') {
        return { valid: false, error: 'Permissão de escrita negada. Por favor, selecione a pasta novamente.' };
      }
    }

    // Tentar acessar o diretório para confirmar que está disponível
    // Verificamos tentando obter um handle de arquivo de teste
    try {
      await (directoryHandle as any).getFileHandle('.test', { create: false });
    } catch (e) {
      // Arquivo não existe é esperado, mas se der erro de permissão, vai cair no catch externo
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Erro ao validar diretório:', error);
    return { valid: false, error: 'Pasta de trabalho não está mais acessível. Por favor, selecione uma nova pasta nas configurações.' };
  }
}

/**
 * Exporta todos os dados do sistema para Excel com múltiplas abas
 */
export async function syncToLocalExcel(directoryHandle: FileSystemDirectoryHandle | undefined) {
  // Validação obrigatória do diretório
  const validation = await validateDirectory(directoryHandle);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Garantir que directoryHandle não é undefined após validação
  const handle = directoryHandle as FileSystemDirectoryHandle;

  try {
    // 1. Buscar todos os dados do sistema
    const [leads, questions, statuses, settings] = await Promise.all([
      db.leads.toArray(),
      db.questions.orderBy('order').toArray(),
      db.statuses.toArray(),
      db.settings.get('main')
    ]);

    // 2. Criar workbook
    const wb = XLSX.utils.book_new();

    // 2.1 Aba Metadata (informações do sistema)
    const metadataData = [{
      'Versao': '1.0',
      'Data Exportacao': format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
      'Total Leads': leads.length,
      'Total Perguntas': questions.length,
      'Total Status': statuses.length
    }];
    const wsMetadata = XLSX.utils.json_to_sheet(metadataData);
    XLSX.utils.book_append_sheet(wb, wsMetadata, SHEET_NAMES.METADATA);

    // 2.2 Aba Leads
    const leadsData = leads.map(l => ({
      'ID': l.id,
      'Data': format(new Date(l.createdAt), 'dd/MM/yyyy HH:mm'),
      'Nome Retifica': l.nomeRetifica,
      'Responsavel': l.responsavel,
      'UF': l.uf,
      'Cidade': l.cidade,
      'Telefone': l.telefone,
      'Status': l.status,
      'Compra Estimada': l.compraEstimada,
      'Planilha Enviada': l.planilhaEnviada,
      'Live Agendada': l.liveAgendada ? format(new Date(l.liveAgendada), 'dd/MM/yyyy HH:mm') : null,
      'Fechou': l.fechou,
      'Motivo Perda': l.motivoPerda,
      'Observacao': l.observacao,
      'Respostas JSON': JSON.stringify(l.answers || [])
    }));
    const wsLeads = XLSX.utils.json_to_sheet(leadsData);
    XLSX.utils.book_append_sheet(wb, wsLeads, SHEET_NAMES.LEADS);

    // 2.3 Aba Script (Perguntas)
    const scriptData = questions.map(q => ({
      'ID': q.id,
      'Ordem': q.order,
      'Pergunta': q.text
    }));
    const wsScript = XLSX.utils.json_to_sheet(scriptData);
    XLSX.utils.book_append_sheet(wb, wsScript, SHEET_NAMES.SCRIPT);

    // 2.4 Aba Status
    const statusData = statuses.map(s => ({
      'ID': s.id,
      'Label': s.label,
      'Cor': s.color
    }));
    const wsStatus = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, wsStatus, SHEET_NAMES.STATUSES);

    // 2.5 Aba Configuracoes (sem directoryHandle que não é serializável)
    const settingsData = settings ? [{
      'ID': settings.id,
      'Auto Sync': settings.autoSync ? 'Sim' : 'Nao',
      'Intervalo Sync (min)': settings.syncInterval || 5,
      'Ultima Sync': settings.lastSync ? format(new Date(settings.lastSync), 'dd/MM/yyyy HH:mm:ss') : null
    }] : [];
    const wsSettings = XLSX.utils.json_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(wb, wsSettings, SHEET_NAMES.SETTINGS);

    // 3. Generate Buffer
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    
    // 4. Save to Local File System
    const fileHandle = await handle.getFileHandle(FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(excelBuffer);
    await writable.close();
    
    // 5. Update last sync
    await db.settings.update('main', { lastSync: new Date() });
    
    return {
      success: true,
      stats: {
        leads: leads.length,
        questions: questions.length,
        statuses: statuses.length
      }
    };
  } catch (error) {
    console.error('Erro na sincronização local:', error);
    throw error;
  }
}

/**
 * Importa todos os dados do sistema a partir do Excel
 * Retorna estatísticas sobre o que foi importado
 */
export async function importFromLocalExcel(
  directoryHandle: FileSystemDirectoryHandle | undefined,
  options: { 
    mergeStrategy?: 'replace' | 'merge' | 'skip';
    importLeads?: boolean;
    importScript?: boolean;
    importStatuses?: boolean;
    importSettings?: boolean;
  } = {}
): Promise<{
  leads: { imported: number; skipped: number };
  questions: { imported: number; skipped: number };
  statuses: { imported: number; skipped: number };
  settings: { imported: boolean };
}> {
  const {
    mergeStrategy = 'merge',
    importLeads = true,
    importScript = true,
    importStatuses = true,
    importSettings = true
  } = options;

  // Validação obrigatória do diretório
  const validation = await validateDirectory(directoryHandle);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const handle = directoryHandle as FileSystemDirectoryHandle;
  const stats = {
    leads: { imported: 0, skipped: 0 },
    questions: { imported: 0, skipped: 0 },
    statuses: { imported: 0, skipped: 0 },
    settings: { imported: false }
  };

  try {
    const fileHandle = await handle.getFileHandle(FILE_NAME);
    const file = await fileHandle.getFile();
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Helper para converter sheet para JSON
    const sheetToJson = (sheetName: string): any[] => {
      const sheet = workbook.Sheets[sheetName];
      return sheet ? XLSX.utils.sheet_to_json(sheet) : [];
    };

    // Importar Script (Perguntas)
    if (importScript) {
      const scriptData = sheetToJson(SHEET_NAMES.SCRIPT);
      const questions: Question[] = scriptData.map((row: any) => ({
        id: String(row['ID'] || crypto.randomUUID()),
        order: Number(row['Ordem'] || 0),
        text: String(row['Pergunta'] || '')
      }));

      if (questions.length > 0) {
        if (mergeStrategy === 'replace') {
          await db.questions.clear();
        }
        
        for (const q of questions) {
          const exists = await db.questions.get(q.id);
          if (!exists) {
            await db.questions.add(q);
            stats.questions.imported++;
          } else if (mergeStrategy === 'merge') {
            await db.questions.update(q.id, { text: q.text, order: q.order });
            stats.questions.imported++;
          } else {
            stats.questions.skipped++;
          }
        }
      }
    }

    // Importar Status
    if (importStatuses) {
      const statusData = sheetToJson(SHEET_NAMES.STATUSES);
      const statuses: LeadStatus[] = statusData.map((row: any) => ({
        id: String(row['ID'] || crypto.randomUUID()),
        label: String(row['Label'] || ''),
        color: String(row['Cor'] || '#6366f1')
      }));

      if (statuses.length > 0) {
        if (mergeStrategy === 'replace') {
          await db.statuses.clear();
        }

        for (const s of statuses) {
          const exists = await db.statuses.get(s.id);
          if (!exists) {
            await db.statuses.add(s);
            stats.statuses.imported++;
          } else if (mergeStrategy === 'merge') {
            await db.statuses.update(s.id, { label: s.label, color: s.color });
            stats.statuses.imported++;
          } else {
            stats.statuses.skipped++;
          }
        }
      }
    }

    // Importar Leads
    if (importLeads) {
      const leadsData = sheetToJson(SHEET_NAMES.LEADS);
      const existingLeads = await db.leads.toArray();
      
      // Helper para verificar duplicatas
      const isDuplicate = (nomeRetifica: string, telefone: string): boolean => {
        const normalizedNome = nomeRetifica.toLowerCase().trim();
        const normalizedTelefone = telefone.toLowerCase().trim();
        return existingLeads.some(l => 
          l.nomeRetifica.toLowerCase().trim() === normalizedNome ||
          (normalizedTelefone && l.telefone.toLowerCase().trim() === normalizedTelefone)
        );
      };

      for (const row of leadsData) {
        const lead: Lead = {
          id: row['ID'] ? Number(row['ID']) : undefined,
          createdAt: parseDate(String(row['Data'] || new Date())),
          nomeRetifica: String(row['Nome Retifica'] || ''),
          responsavel: String(row['Responsavel'] || ''),
          uf: String(row['UF'] || ''),
          cidade: String(row['Cidade'] || ''),
          telefone: String(row['Telefone'] || ''),
          status: String(row['Status'] || 'Pendente'),
          compraEstimada: Number(row['Compra Estimada'] || 0),
          planilhaEnviada: (row['Planilha Enviada'] === 'Sim' ? 'Sim' : 'Não') as 'Sim' | 'Não',
          liveAgendada: row['Live Agendada'] ? parseDate(String(row['Live Agendada'])) : null,
          fechou: (row['Fechou'] === 'Sim' ? 'Sim' : 'Não') as 'Sim' | 'Não',
          motivoPerda: String(row['Motivo Perda'] || ''),
          observacao: String(row['Observacao'] || ''),
          answers: parseAnswers(row['Respostas JSON'])
        };

        if (isDuplicate(lead.nomeRetifica, lead.telefone)) {
          stats.leads.skipped++;
          continue;
        }

        await db.leads.add(lead);
        stats.leads.imported++;
      }
    }

    // Importar Configurações
    if (importSettings) {
      const settingsData = sheetToJson(SHEET_NAMES.SETTINGS);
      if (settingsData.length > 0) {
        const row = settingsData[0];
        const existingSettings = await db.settings.get('main');
        
        const newSettings: Partial<AppSettings> = {
          autoSync: row['Auto Sync'] === 'Sim',
          syncInterval: Number(row['Intervalo Sync (min)'] || 5)
        };

        if (existingSettings) {
          await db.settings.update('main', newSettings);
        } else {
          await db.settings.add({
            id: 'main',
            ...newSettings
          } as AppSettings);
        }
        stats.settings.imported = true;
      }
    }

    // Atualizar last sync
    await db.settings.update('main', { lastSync: new Date() });

    return stats;
  } catch (error) {
    console.error('Erro ao importar do Excel local:', error);
    throw error;
  }
}

// Helper para parse de datas
function parseDate(dateStr: string): Date {
  try {
    // Tenta formato dd/MM/yyyy HH:mm
    const parsed = parse(dateStr, 'dd/MM/yyyy HH:mm', new Date());
    if (!isNaN(parsed.getTime())) return parsed;
    
    // Tenta formato dd/MM/yyyy HH:mm:ss
    const parsedWithSeconds = parse(dateStr, 'dd/MM/yyyy HH:mm:ss', new Date());
    if (!isNaN(parsedWithSeconds.getTime())) return parsedWithSeconds;
    
    return new Date();
  } catch {
    return new Date();
  }
}

// Helper para parse de respostas JSON
function parseAnswers(jsonStr: string): any[] {
  try {
    if (!jsonStr || jsonStr === 'undefined') return [];
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
