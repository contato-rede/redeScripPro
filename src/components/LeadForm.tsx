import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Lead, Question, LeadStatus, LeadAnswer } from '../types';
import { INITIAL_STATUSES } from '../constants';
import { Save, User, Building2, MapPin, Phone, DollarSign, Calendar, FileText } from 'lucide-react';
import { cn, formatPhoneNumber, formatCurrency, parseCurrency, toCamelCase } from '../lib/utils';
import { toast } from 'sonner';
import { syncToLocalExcel } from '../lib/sync';
import { UFSelector } from './UFSelector';
import { CidadeSelector } from './CidadeSelector';
import { validateUFCidade } from '../constants/brazilLocations';

interface LeadFormProps {
  onSuccess: () => void;
  initialData?: Lead | null;
  onCancel?: () => void;
}

export function LeadForm({ onSuccess, initialData, onCancel }: LeadFormProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Lead>>({
    nomeRetifica: '',
    responsavel: '',
    uf: '',
    cidade: '',
    telefone: '',
    status: 'Pendente',
    compraEstimada: 0,
    planilhaEnviada: 'Não',
    liveAgendada: null,
    fechou: 'Não',
    motivoPerda: '',
    observacao: '',
    answers: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      const q = await db.questions.orderBy('order').toArray();
      const s = await db.statuses.toArray();
      
      let currentStatuses = s;
      if (s.length === 0) {
        try {
          await db.statuses.bulkPut(INITIAL_STATUSES);
        } catch (e) {
          console.warn('Statuses already seeded', e);
        }
        currentStatuses = INITIAL_STATUSES;
        setStatuses(INITIAL_STATUSES);
      } else {
        setStatuses(s);
      }
      
      setQuestions(q);

      if (initialData) {
        // If editing, use initialData but ensure answers are mapped correctly
        const mergedAnswers = q.map(question => {
          const existing = initialData.answers.find(a => a.questionId === question.id);
          return existing || { questionId: question.id, answer: '' };
        });

        setFormData({
          ...initialData,
          answers: mergedAnswers
        });
      } else {
        // If new, use defaults
        setFormData(prev => ({
          ...prev,
          status: currentStatuses[0]?.label || 'Pendente',
          answers: q.map(question => ({ questionId: question.id, answer: '' }))
        }));
      }
      
      setLoading(false);
    }
    init();
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomeRetifica?.trim()) newErrors.nomeRetifica = 'Nome da Retífica é obrigatório';
    if (!formData.responsavel?.trim()) newErrors.responsavel = 'Responsável é obrigatório';
    if (!formData.uf?.trim()) newErrors.uf = 'UF é obrigatória';
    if (!formData.cidade?.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.telefone?.trim()) newErrors.telefone = 'Telefone é obrigatório';
    
    // Validação de UF e Cidade
    if (formData.uf && formData.cidade) {
      const validation = validateUFCidade(formData.uf, formData.cidade);
      if (!validation.valid) {
        newErrors.cidade = validation.error || 'Cidade inválida para a UF selecionada';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers?.map(a => a.questionId === questionId ? { ...a, answer } : a) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = document.querySelector('.text-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Aplicar formatação CamelCase antes de salvar
    const formattedData = {
      ...formData,
      nomeRetifica: toCamelCase(formData.nomeRetifica || ''),
      responsavel: toCamelCase(formData.responsavel || ''),
    };

    const lead: Lead = {
      ...formattedData as Lead,
      createdAt: initialData?.createdAt || new Date(),
    };

    if (initialData?.id) {
      await db.leads.put(lead);
    } else {
      await db.leads.add(lead);
    }
    
    // Auto-sync to local Excel if workspace is set and accessible
    const settings = await db.settings.get('main');
    if (settings?.directoryHandle && settings?.autoSync) {
      try {
        await syncToLocalExcel(settings.directoryHandle);
      } catch (e: any) {
        console.warn('Auto-sync failed:', e.message);
        // Não exibir erro ao usuário para não interromper o fluxo de salvamento
        // A sincronização pode ser feita manualmente depois
      }
    }

    toast.success('Lead salvo com sucesso!');
    onSuccess();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Preparando formulário...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            Informações do Lead
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome da Retífica <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Building2 className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Digite o nome da retífica"
                  className={cn(
                    "input-field-icon",
                    errors.nomeRetifica && "border-red-500 focus:ring-red-500"
                  )}
                  value={formData.nomeRetifica}
                  onChange={e => {
                    setFormData({ ...formData, nomeRetifica: e.target.value });
                    if (errors.nomeRetifica) setErrors(prev => ({ ...prev, nomeRetifica: '' }));
                  }}
                  onBlur={e => {
                    const formatted = toCamelCase(e.target.value);
                    if (formatted !== e.target.value) {
                      setFormData({ ...formData, nomeRetifica: formatted });
                    }
                  }}
                />
              </div>
              {errors.nomeRetifica && <p className="text-red-500 text-xs mt-1.5">{errors.nomeRetifica}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Responsável <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Digite o nome do responsável"
                  className={cn(
                    "input-field-icon",
                    errors.responsavel && "border-red-500 focus:ring-red-500"
                  )}
                  value={formData.responsavel}
                  onChange={e => {
                    setFormData({ ...formData, responsavel: e.target.value });
                    if (errors.responsavel) setErrors(prev => ({ ...prev, responsavel: '' }));
                  }}
                  onBlur={e => {
                    const formatted = toCamelCase(e.target.value);
                    if (formatted !== e.target.value) {
                      setFormData({ ...formData, responsavel: formatted });
                    }
                  }}
                />
              </div>
              {errors.responsavel && <p className="text-red-500 text-xs mt-1.5">{errors.responsavel}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <UFSelector
                  value={formData.uf || ''}
                  onChange={(uf) => {
                    setFormData({ ...formData, uf, cidade: '' }); // Limpa cidade ao mudar UF
                    if (errors.uf) setErrors(prev => ({ ...prev, uf: '' }));
                    if (errors.cidade) setErrors(prev => ({ ...prev, cidade: '' }));
                  }}
                  error={errors.uf}
                />
              </div>
              <div className="col-span-2">
                <CidadeSelector
                  value={formData.cidade || ''}
                  uf={formData.uf || ''}
                  onChange={(cidade) => {
                    setFormData({ ...formData, cidade });
                    if (errors.cidade) setErrors(prev => ({ ...prev, cidade: '' }));
                  }}
                  error={errors.cidade}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Phone className="input-icon" size={18} />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className={cn(
                    "input-field-icon",
                    errors.telefone && "border-red-500 focus:ring-red-500"
                  )}
                  value={formData.telefone}
                  onChange={e => {
                    setFormData({ ...formData, telefone: formatPhoneNumber(e.target.value) });
                    if (errors.telefone) setErrors(prev => ({ ...prev, telefone: '' }));
                  }}
                />
              </div>
              {errors.telefone && <p className="text-red-500 text-xs mt-1.5">{errors.telefone}</p>}
            </div>
          </div>
        </div>

        {/* Sales Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="text-indigo-600" size={20} />
            Dados Comerciais
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map(s => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compra Estimada (R$)</label>
                <input
                  type="text"
                  className="input-field"
                  value={formatCurrency(formData.compraEstimada || 0)}
                  onChange={e => {
                    const value = parseCurrency(e.target.value);
                    setFormData({ ...formData, compraEstimada: value });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planilha Enviada?</label>
                <div className="flex gap-2">
                  {['Sim', 'Não'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, planilhaEnviada: opt as 'Sim' | 'Não' })}
                      className={cn(
                        "flex-1 py-2 rounded-lg border transition-all",
                        formData.planilhaEnviada === opt 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fechou?</label>
                <div className="flex gap-2">
                  {['Sim', 'Não'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, fechou: opt as 'Sim' | 'Não' })}
                      className={cn(
                        "flex-1 py-2 rounded-lg border transition-all",
                        formData.fechou === opt 
                          ? (opt === 'Sim' ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600")
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Live Agendada</label>
              <div className="relative group">
                <Calendar className="input-icon" size={18} />
                <input
                  type="datetime-local"
                  className="input-field-icon"
                  onChange={e => setFormData({ ...formData, liveAgendada: e.target.value ? new Date(e.target.value) : null })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Script Questions */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="text-indigo-600" size={20} />
          Script de Perguntas
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {idx + 1}. {q.text || '(Pergunta sem texto)'}
              </label>
              <textarea
                rows={2}
                className="input-field resize-none"
                placeholder="Resposta do cliente..."
                value={formData.answers?.find(a => a.questionId === q.id)?.answer || ''}
                onChange={e => handleAnswerChange(q.id, e.target.value)}
              />
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-slate-500 italic">Nenhuma pergunta configurada no script.</p>
          )}
        </div>
      </div>

      {/* Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Motivo da Perda (se houver)</label>
          <textarea
            rows={4}
            className="input-field"
            value={formData.motivoPerda}
            onChange={e => setFormData({ ...formData, motivoPerda: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações Gerais</label>
          <textarea
            rows={4}
            className="input-field"
            value={formData.observacao}
            onChange={e => setFormData({ ...formData, observacao: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-8">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-secondary px-12 py-4 text-lg"
          >
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary flex items-center gap-2 px-12 py-4 text-lg">
          <Save size={24} />
          {initialData ? 'Atualizar Lead' : 'Salvar Lead'}
        </button>
      </div>
    </form>
  );
}
