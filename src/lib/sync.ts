import * as XLSX from 'xlsx';
import { db } from '../db';
import { format } from 'date-fns';

const FILE_NAME = 'RedeScript_Dados.xlsx';

export async function syncToLocalExcel(directoryHandle: FileSystemDirectoryHandle) {
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
    const fileHandle = await directoryHandle.getFileHandle(FILE_NAME, { create: true });
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

export async function importFromLocalExcel(directoryHandle: FileSystemDirectoryHandle) {
  try {
    const fileHandle = await directoryHandle.getFileHandle(FILE_NAME);
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
