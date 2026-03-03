import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Lead, LeadStatus } from '../types';
import { format, isToday, isPast, addDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Phone, Clock, AlertCircle, CheckCircle2, ExternalLink, ChevronRight } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AgendaProps {
  onEdit: (lead: Lead) => void;
}

export function Agenda({ onEdit }: AgendaProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const allLeads = await db.leads.toArray();
      setLeads(allLeads);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando agenda...</div>;

  // 1. Leads with Live Agendada for Today
  const livesToday = leads.filter(l => l.liveAgendada && isToday(new Date(l.liveAgendada)));
  
  // 2. Leads with Status "Ligar mais tarde" (that are not closed)
  const callsToReturn = leads.filter(l => l.status === 'Ligar mais tarde' && l.fechou === 'Não');

  // 3. Past Lives (not closed) - Urgent reminders
  const overdueLives = leads.filter(l => 
    l.liveAgendada && 
    isPast(new Date(l.liveAgendada)) && 
    !isToday(new Date(l.liveAgendada)) && 
    l.fechou === 'Não'
  );

  const totalTasks = livesToday.length + callsToReturn.length + overdueLives.length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Agenda de Follow-up</h2>
          <p className="text-slate-500">Não deixe nenhuma venda esfriar. Retorne para seus leads hoje.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm">
          {totalTasks} Tarefas Pendentes
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Urgent / Overdue */}
        {overdueLives.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={18} />
              Vencidos / Reuniões Passadas
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {overdueLives.map(lead => (
                <TaskCard key={lead.id} lead={lead} onEdit={onEdit} type="overdue" />
              ))}
            </div>
          </section>
        )}

        {/* Lives Today */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={18} />
            Reuniões (Lives) Agendadas para Hoje
          </h3>
          {livesToday.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {livesToday.map(lead => (
                <TaskCard key={lead.id} lead={lead} onEdit={onEdit} type="live" />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic">
              Nenhuma reunião agendada para hoje.
            </div>
          )}
        </section>

        {/* Calls to Return */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
            <Phone size={18} />
            Retornos Pendentes (Ligar mais tarde)
          </h3>
          {callsToReturn.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {callsToReturn.map(lead => (
                <TaskCard key={lead.id} lead={lead} onEdit={onEdit} type="call" />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic">
              Nenhum retorno pendente.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const TaskCard: React.FC<{ lead: Lead, onEdit: (l: Lead) => void, type: 'live' | 'call' | 'overdue' }> = ({ lead, onEdit, type }) => {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className={cn(
        "bg-white p-4 rounded-xl border flex items-center justify-between group transition-all",
        type === 'overdue' ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-indigo-300 shadow-sm"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          type === 'overdue' ? "bg-red-100 text-red-600" : 
          type === 'live' ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"
        )}>
          {type === 'live' || type === 'overdue' ? <Clock size={24} /> : <Phone size={24} />}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900">{lead.nomeRetifica}</h4>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">{lead.responsavel}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Phone size={12} />
              {lead.telefone}
            </div>
            {lead.liveAgendada && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                type === 'overdue' ? "text-red-600" : "text-indigo-600"
              )}>
                <Calendar size={12} />
                {format(new Date(lead.liveAgendada), 'HH:mm')}
                {type === 'overdue' && ` (${format(new Date(lead.liveAgendada), 'dd/MM')})`}
              </div>
            )}
            <div className="text-xs text-slate-400 italic">
              {lead.cidade} - {lead.uf}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right mr-4 hidden md:block">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compra Est.</div>
          <div className="text-sm font-bold text-slate-700">{formatCurrency(lead.compraEstimada)}</div>
        </div>
        <button 
          onClick={() => onEdit(lead)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Ligar Agora
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
