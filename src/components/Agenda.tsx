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

  if (loading) return <div className="p-6 text-center text-slate-500 text-sm">Carregando agenda...</div>;

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
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Agenda de Follow-up</h2>
          <p className="text-xs text-slate-500">Não deixe nenhuma venda esfriar. Retorne para seus leads hoje.</p>
        </div>
        <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full font-bold text-xs">
          {totalTasks} Tarefas
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Urgent / Overdue */}
        {overdueLives.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={14} />
              Vencidos / Reuniões Passadas
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {overdueLives.map(lead => (
                <TaskCard key={lead.id} lead={lead} onEdit={onEdit} type="overdue" />
              ))}
            </div>
          </section>
        )}

        {/* Lives Today */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} />
            Reuniões Agendadas para Hoje
          </h3>
          {livesToday.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {livesToday.map(lead => (
                <TaskCard key={lead.id} lead={lead} onEdit={onEdit} type="live" />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 italic text-sm">
              Nenhuma reunião agendada para hoje.
            </div>
          )}
        </section>

        {/* Calls to Return */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={14} />
            Retornos Pendentes
          </h3>
          {callsToReturn.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {callsToReturn.map(lead => (
                <TaskCard key={lead.id} lead={lead} onEdit={onEdit} type="call" />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 italic text-sm">
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
      whileHover={{ x: 3 }}
      className={cn(
        "bg-white p-3 rounded-lg border flex items-center justify-between group transition-all",
        type === 'overdue' ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-indigo-300 shadow-sm"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          type === 'overdue' ? "bg-red-100 text-red-600" : 
          type === 'live' ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"
        )}>
          {type === 'live' || type === 'overdue' ? <Clock size={20} /> : <Phone size={20} />}
        </div>
        
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-sm">{lead.nomeRetifica}</h4>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">{lead.responsavel}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Phone size={10} />
              {lead.telefone}
            </div>
            {lead.liveAgendada && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                type === 'overdue' ? "text-red-600" : "text-indigo-600"
              )}>
                <Calendar size={10} />
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
        <div className="text-right mr-3 hidden md:block">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compra Est.</div>
          <div className="text-xs font-bold text-slate-700">{formatCurrency(lead.compraEstimada)}</div>
        </div>
        <button 
          onClick={() => onEdit(lead)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Ligar
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
