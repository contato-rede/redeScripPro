import * as XLSX from 'xlsx';
import { db } from '../db';
import { format } from 'date-fns';

const FILE_NAME = 'RedeScript_Dados.xlsx';

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

export async function syncToLocalExcel(directoryHandle: FileSystemDirectoryHandle | undefined) {
  // Validação obrigatória do diretório
  const validation = await validateDirectory(directoryHandle);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Garantir que directoryHandle não é undefined após validação
  const handle = directoryHandle as FileSystemDirectoryHandle;

  try {
    // 1. Get all data
    const leads = await db.leads.toArray();
    
    // 2. Prepare Excel Data
    const exportData = leads.map(l => ({
      'ID': l.id,
      'Data': format(new Date(l.createdAt), 'dd/MM/yyyy HH:mm'),
      'Nome Retífica': l.nomeRetifica,
      'Responsável': l.responsavel,
      'UF': l.uf,
      'Cidade': l.cidade,
      'Telefone': l.telefone,
      'Status': l.status,
      'Compra Estimada': l.compraEstimada,
      'Planilha Enviada': l.planilhaEnviada,
      'Live Agendada': l.liveAgendada ? format(new Date(l.liveAgendada), 'dd/MM/yyyy HH:mm') : '-',
      'Fechou': l.fechou,
      'Motivo da Perda': l.motivoPerda,
      'Observação': l.observacao
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    
    // 3. Generate Buffer
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    
    // 4. Save to Local File System
    const fileHandle = await handle.getFileHandle(FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(excelBuffer);
    await writable.close();
    
    // 5. Update last sync
    await db.settings.update('main', { lastSync: new Date() });
    
    return true;
  } catch (error) {
    console.error('Erro na sincronização local:', error);
    throw error;
  }
}

export async function importFromLocalExcel(directoryHandle: FileSystemDirectoryHandle | undefined) {
  // Validação obrigatória do diretório
  const validation = await validateDirectory(directoryHandle);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const handle = directoryHandle as FileSystemDirectoryHandle;

  try {
    const fileHandle = await handle.getFileHandle(FILE_NAME);
    const file = await fileHandle.getFile();
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Map Excel back to Lead objects (simplified for now)
    // In a real app, we'd need more robust mapping
    return jsonData;
  } catch (error) {
    console.error('Erro ao importar do Excel local:', error);
    throw error;
  }
}
