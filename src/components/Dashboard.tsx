import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Lead, LeadStatus } from '../types';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

export function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [leadsData, statusesData] = await Promise.all([
        db.leads.toArray(),
        db.statuses.toArray()
      ]);
      setLeads(leadsData);
      setStatuses(statusesData);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando indicadores...</div>;

  // 1. Conversion Rate Data
  const closedCount = leads.filter(l => l.fechou === 'Sim').length;
  const notClosedCount = leads.filter(l => l.fechou === 'Não').length;
  const conversionData = [
    { name: 'Fechou', value: closedCount, color: '#22c55e' },
    { name: 'Não Fechou', value: notClosedCount, color: '#ef4444' }
  ];

  // 2. Funnel Data (Status Distribution)
  const funnelData = statuses.map(s => ({
    name: s.label,
    count: leads.filter(l => l.status === s.label).length,
    color: s.color
  })).sort((a, b) => b.count - a.count);

  // 3. Purchase Volume Data
  const totalVolume = leads.reduce((acc, l) => acc + (l.compraEstimada || 0), 0);
  const closedVolume = leads.filter(l => l.fechou === 'Sim').reduce((acc, l) => acc + (l.compraEstimada || 0), 0);
  const pendingVolume = totalVolume - closedVolume;

  const volumeData = [
    { name: 'Volume Fechado', value: closedVolume },
    { name: 'Volume em Negociação', value: pendingVolume }
  ];

  const conversionRate = leads.length > 0 ? (closedCount / leads.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Painel de Performance</h2>
        <p className="text-slate-500">Acompanhe os principais indicadores de vendas em tempo real.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Users size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total de Leads</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <Target size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Taxa de Conversão</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Volume Fechado</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(closedVolume)}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <BarChart3 size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Volume Total</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalVolume)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Taxa de Conversão (Sim vs Não)</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribuição por Status</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Volume Financeiro em Negociação</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
