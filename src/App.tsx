import React, { useState, useEffect } from 'react';
import { ScriptManager } from './components/ScriptManager';
import { LeadForm } from './components/LeadForm';
import { LeadHistory } from './components/LeadHistory';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './components/Dashboard';
import { Agenda } from './components/Agenda';
import { PhoneCall, ClipboardList, History, Settings, LayoutDashboard, BarChart2, CalendarCheck } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { db } from './db';
import { syncEverything, syncToLocalExcel } from './lib/sync';

import { Lead } from './types';

type Tab = 'dashboard' | 'agenda' | 'new-lead' | 'script' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Background Sync Effect
  useEffect(() => {
    let intervalId: any;

    const setupSync = async () => {
      const settings = await db.settings.get('main');
      if (settings?.autoSync && settings.directoryHandle) {
        const intervalMs = (settings.syncInterval || 5) * 60 * 1000;

        intervalId = setInterval(async () => {
          try {
            const status = await (settings.directoryHandle as any).queryPermission({ mode: 'readwrite' });
            if (status === 'granted') {
              await syncEverything(settings.directoryHandle);
              console.log('Total bidirectional sync completed');
            }
          } catch (error) {
            console.error('Background sync failed:', error);
          }
        }, intervalMs);
      }
    };

    setupSync();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSettingsOpen]); // Re-check settings when modal closes

  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: BarChart2 },
    { id: 'agenda', label: 'Agenda', icon: CalendarCheck },
    { id: 'new-lead', label: editingLead ? 'Editando' : 'Novo Lead', icon: PhoneCall },
    { id: 'script', label: 'Script', icon: ClipboardList },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setActiveTab('new-lead');
  };

  const handleFormSuccess = () => {
    setEditingLead(null);
    setActiveTab('history');
  };

  const handleFormCancel = () => {
    setEditingLead(null);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-right" richColors />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight hidden lg:block">
                Rede Script <span className="text-indigo-600">Pro</span>
              </h1>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight lg:hidden">
                RS<span className="text-indigo-600">P</span>
              </h1>
            </div>

            <nav className="hidden md:flex space-x-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-2 rounded-lg text-[11px] xl:text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <tab.icon size={16} className="shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Settings size={18} />
              </button>
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                UN
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-b border-slate-200 flex justify-around p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.id
                ? "text-indigo-700"
                : "text-slate-500"
            )}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="py-8"
          >
            {activeTab === 'dashboard' && (
              <Dashboard />
            )}
            {activeTab === 'agenda' && (
              <Agenda onEdit={handleEditLead} />
            )}
            {activeTab === 'new-lead' && (
              <LeadForm
                onSuccess={handleFormSuccess}
                initialData={editingLead}
                onCancel={editingLead ? handleFormCancel : undefined}
              />
            )}
            {activeTab === 'script' && (
              <ScriptManager />
            )}
            {activeTab === 'history' && (
              <LeadHistory onEdit={handleEditLead} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
          © 2024 Rede Script Pro - Sistema de Gestão de Vendas
        </div>
      </footer>
    </div>
  );
}
