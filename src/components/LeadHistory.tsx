import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { Lead, LeadStatus } from '../types';
import { format, isToday, isThisWeek, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { Download, Search, Trash2, ExternalLink, AlertTriangle, X, FileUp, FileSpreadsheet, Filter, Calendar as CalendarIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatCurrency, cn, toCamelCase } from '../lib/utils';
import { validateUFCidade, isValidUF } from '../constants/brazilLocations';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface LeadHistoryProps {
  onEdit: (lead: Lead) => void;
}

export function LeadHistory({ onEdit }: LeadHistoryProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [leadsData, statusesData] = await Promise.all([
      db.leads.orderBy('createdAt').reverse().toArray(),
      db.statuses.toArray()
    ]);
    setLeads(leadsData);
    setStatuses(statusesData);
    setLoading(false);
  }

  const getStatusColor = (label: string) => {
    const status = statuses.find(s => s.label === label);
    return status?.color || '#94a3b8';
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.nomeRetifica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchesResult = filterResult === 'all' || l.fechou === filterResult;
    
    let matchesPeriod = true;
    const leadDate = new Date(l.createdAt);
    
    if (filterPeriod === 'today') {
      matchesPeriod = isToday(leadDate);
    } else if (filterPeriod === 'week') {
      matchesPeriod = isThisWeek(leadDate, { weekStartsOn: 0 });
    } else if (filterPeriod === 'custom' && startDate && endDate) {
      matchesPeriod = isWithinInterval(leadDate, {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate))
      });
    }
    
    return matchesSearch && matchesStatus && matchesResult && matchesPeriod;
  });

  const exportToExcel = () => {
    const exportData = leads.map(l => ({
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
    XLSX.writeFile(wb, `Leads_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nome Retífica': 'Exemplo Retífica LTDA',
        'Responsável': 'João Silva',
        'UF': 'SP',
        'Cidade': 'São Paulo',
        'Telefone': '(11) 99999-9999',
        'Compra Estimada': 5000.00,
        'Observação': 'Lead importado via planilha'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
    XLSX.writeFile(wb, `Modelo_Importacao_RedeScript.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          toast.error('A planilha está vazia.');
          return;
        }

        // Validação de UF e Cidade antes da importação
        const invalidRows: { row: number; errors: string[] }[] = [];
        
        const newLeads: Lead[] = jsonData.map((row, index) => {
          const uf = (row['UF'] || '').substring(0, 2).toUpperCase();
          const cidade = toCamelCase(row['Cidade'] || '');
          const rowErrors: string[] = [];
          
          // Validação de UF
          if (!uf) {
            rowErrors.push('UF não informada');
          } else if (!isValidUF(uf)) {
            rowErrors.push(`UF "${uf}" inválida`);
          }
          
          // Validação de Cidade
          if (!cidade) {
            rowErrors.push('Cidade não informada');
          } else if (uf && !validateUFCidade(uf, cidade).valid) {
            rowErrors.push(`Cidade "${cidade}" não encontrada para a UF ${uf}`);
          }
          
          if (rowErrors.length > 0) {
            invalidRows.push({ row: index + 2, errors: rowErrors }); // +2 porque linha 1 é cabeçalho
          }
          
          return {
            createdAt: new Date(),
            nomeRetifica: toCamelCase(row['Nome Retífica'] || 'Sem Nome'),
            responsavel: toCamelCase(row['Responsável'] || 'Não Informado'),
            uf: uf || 'XX', // Valor padrão se inválido
            cidade: cidade || 'Não Informada',
            telefone: row['Telefone'] || '',
            status: 'Pendente',
            compraEstimada: Number(row['Compra Estimada']) || 0,
            planilhaEnviada: 'Não',
            liveAgendada: null,
            fechou: 'Não',
            motivoPerda: '',
            observacao: row['Observação'] || '',
            answers: []
          };
        });

        // Se houver erros, mostra alerta mas permite importar os válidos
        if (invalidRows.length > 0) {
          const errorDetails = invalidRows.slice(0, 5).map(r => 
            `Linha ${r.row}: ${r.errors.join(', ')}`
          ).join('\n');
          
          const moreErrors = invalidRows.length > 5 ? `\n... e mais ${invalidRows.length - 5} linhas com erros` : '';
          
          toast.warning(
            `${invalidRows.length} linha(s) com UF/Cidade inválidas. Dados serão importados com valores padrão.`,
            {
              description: `${errorDetails}${moreErrors}`,
              duration: 8000,
            }
          );
        }

        await db.leads.bulkAdd(newLeads);
        toast.success(`${newLeads.length} leads importados! ${invalidRows.length > 0 ? `(${invalidRows.length} com dados de localização inválidos)` : ''}`);
        loadData();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error('Erro na importação:', error);
        toast.error('Erro ao processar a planilha. Verifique o formato.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmDelete = async () => {
    if (leadToDelete !== null) {
      await db.leads.delete(leadToDelete);
      toast.success('Lead excluído com sucesso');
      setLeadToDelete(null);
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando histórico...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {leadToDelete !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Excluir Lead?</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Esta ação não pode ser desfeita. O registro da retífica será removido permanentemente.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setLeadToDelete(null)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Histórico de Leads</h2>
          <p className="text-slate-500">Visualize e exporte todos os registros salvos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="input-field-icon w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "btn-secondary flex items-center gap-2 text-xs py-2",
              showFilters && "bg-indigo-50 border-indigo-200 text-indigo-700"
            )}
          >
            <Filter size={18} />
            Filtros
          </button>

          <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2 text-xs py-2">
            <FileSpreadsheet size={18} />
            Modelo
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2 text-xs py-2">
            <FileUp size={18} />
            Importar
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".xlsx, .xls" 
              className="hidden" 
            />
          </button>
          <button onClick={exportToExcel} className="btn-primary flex items-center gap-2 text-xs py-2">
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Período</label>
                <select 
                  className="input-field text-sm"
                  value={filterPeriod}
                  onChange={e => setFilterPeriod(e.target.value)}
                >
                  <option value="all">Todo o período</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta Semana</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {filterPeriod === 'custom' && (
                <div className="md:col-span-1 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Início</label>
                    <input 
                      type="date" 
                      className="input-field text-sm"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Fim</label>
                    <input 
                      type="date" 
                      className="input-field text-sm"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Status</label>
                <select 
                  className="input-field text-sm"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Fechou?</label>
                <div className="flex gap-2">
                  {['all', 'Sim', 'Não'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilterResult(opt)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-xs font-medium transition-all",
                        filterResult === opt 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {opt === 'all' ? 'Todos' : opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end pt-2">
                <button 
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterResult('all');
                    setFilterPeriod('all');
                    setSearchTerm('');
                  }}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Data</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Retífica</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Cidade/UF</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Compra Est.</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Fechou</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm text-slate-600">
                  {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-900">{lead.nomeRetifica}</div>
                  <div className="text-xs text-slate-500">{lead.responsavel}</div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {lead.cidade} - {lead.uf}
                </td>
                <td className="p-4">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getStatusColor(lead.status)}20`, 
                      color: getStatusColor(lead.status) 
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {formatCurrency(lead.compraEstimada)}
                </td>
                <td className="p-4">
                  <span className={cn(
                    "text-xs font-bold",
                    lead.fechou === 'Sim' ? "text-green-600" : "text-red-600"
                  )}>
                    {lead.fechou}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(lead)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Editar Lead / Ligar Novamente"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button 
                      onClick={() => setLeadToDelete(lead.id!)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Excluir Lead"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400 italic">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
