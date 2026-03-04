import React, { useRef, useState, useEffect } from 'react';
import { db } from '../db';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Upload, RefreshCcw, X, ShieldAlert, FolderOpen, HardDrive, Smartphone, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { DEFAULT_QUESTIONS, INITIAL_STATUSES } from '../constants';
import { syncToLocalExcel } from '../lib/sync';
import { cn } from '../lib/utils';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    // Timeout para determinar se o evento não foi disparado
    const timeout = setTimeout(() => {
      if (deferredPrompt === null && !window.matchMedia('(display-mode: standalone)').matches) {
        // O evento pode não ter sido disparado ainda ou o app não é instalável
        setIsInstallable(false);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timeout);
    };
  }, [deferredPrompt]);

  useEffect(() => {
    if (isOpen) {
      db.settings.get('main').then(s => {
        if (s) setSettings(s);
        else {
          const initial: AppSettings = { id: 'main', autoSync: false };
          db.settings.add(initial);
          setSettings(initial);
        }
      });
    }
  }, [isOpen]);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  const selectWorkspace = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        toast.error('Seu navegador não suporta a seleção de pastas local. Use o Chrome ou Edge.');
        return;
      }

      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      
      const updated: AppSettings = { 
        ...settings!, 
        directoryHandle: handle,
        autoSync: true 
      };
      
      await db.settings.put(updated);
      setSettings(updated);
      
      toast.promise(syncToLocalExcel(handle), {
        loading: 'Sincronizando dados iniciais...',
        success: 'Pasta de trabalho conectada e sincronizada!',
        error: 'Erro ao sincronizar com a pasta.'
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Erro ao selecionar pasta: ' + error.message);
      }
    }
  };

  const forceSync = async () => {
    if (!settings?.directoryHandle) {
      toast.error('Nenhuma pasta de trabalho selecionada. Por favor, selecione uma pasta primeiro.');
      return;
    }
    
    try {
      await syncToLocalExcel(settings.directoryHandle);
      toast.success('Sincronização concluída!');
      
      const updated = await db.settings.get('main');
      if (updated) setSettings(updated);
    } catch (error: any) {
      toast.error(error.message || 'Falha na sincronização. Tente reconectar a pasta.');
    }
  };

  const exportBackup = async () => {
    try {
      const leads = await db.leads.toArray();
      const questions = await db.questions.toArray();
      const statuses = await db.statuses.toArray();
      
      const backup = {
        version: '1.0',
        date: new Date().toISOString(),
        data: { leads, questions, statuses }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RedeScript_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup');
    }
  };

  const importBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (!backup.data) throw new Error('Formato inválido');

        if (confirm('Isso irá substituir seus dados atuais. Deseja continuar?')) {
          await db.transaction('rw', [db.leads, db.questions, db.statuses], async () => {
            await db.leads.clear();
            await db.questions.clear();
            await db.statuses.clear();
            
            await db.leads.bulkAdd(backup.data.leads);
            await db.questions.bulkAdd(backup.data.questions);
            await db.statuses.bulkAdd(backup.data.statuses);
          });
          toast.success('Backup restaurado com sucesso!');
          window.location.reload();
        }
      } catch (error) {
        toast.error('Erro ao importar backup. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const clearLeads = async () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os leads permanentemente. Esta ação não pode ser desfeita. Confirmar?')) {
      await db.leads.clear();
      toast.success('Todos os leads foram apagados.');
      window.location.reload();
    }
  };

  const resetToFactory = async () => {
    if (confirm('Isso restaurará o Script e os Status para o padrão original. Seus leads NÃO serão apagados. Confirmar?')) {
      await db.transaction('rw', [db.questions, db.statuses], async () => {
        await db.questions.clear();
        await db.statuses.clear();
        await db.questions.bulkAdd(DEFAULT_QUESTIONS);
        await db.statuses.bulkAdd(INITIAL_STATUSES);
      });
      toast.success('Configurações resetadas com sucesso!');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Configurações do Sistema</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* PWA Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
              <Smartphone size={16} />
              Aplicativo Instalável (PWA)
            </h3>
            
            <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/30 space-y-4">
              {deferredPrompt && (
                <button 
                  onClick={installApp}
                  className="w-full flex items-center gap-3 p-3 text-left border border-indigo-200 rounded-xl bg-white hover:bg-indigo-50 transition-all group shadow-sm"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Download size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Instalar no Computador</div>
                    <div className="text-xs text-slate-500">Use o sistema como um app nativo</div>
                  </div>
                </button>
              )}

              {isInstallable === false && (
                <div className="p-3 text-left border border-slate-200 rounded-xl bg-white/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                      <Download size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-600">Instalação Indisponível</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {window.matchMedia('(display-mode: standalone)').matches 
                          ? 'O aplicativo já está instalado neste dispositivo.'
                          : 'A instalação não está disponível no momento. Verifique se:\n• Você está usando Chrome ou Edge\n• O site está em HTTPS\n• O manifesto está válido\n• Tente recarregar a página'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Workspace Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <HardDrive size={16} />
              Sincronização Local (Excel)
            </h3>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <FolderOpen size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">Pasta de Trabalho</div>
                  <p className="text-xs text-slate-500">
                    {settings?.directoryHandle 
                      ? `Conectado: ${(settings.directoryHandle as any).name}` 
                      : 'Nenhuma pasta selecionada'}
                  </p>
                </div>
              </div>

              {settings?.directoryHandle && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase">Sincronização Automática</label>
                    <button 
                      onClick={async () => {
                        const updated = { ...settings, autoSync: !settings.autoSync };
                        await db.settings.put(updated);
                        setSettings(updated);
                      }}
                      className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        settings.autoSync ? "bg-indigo-600" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        settings.autoSync ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>

                  {settings.autoSync && (
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Intervalo (minutos)</label>
                      <select 
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium"
                        value={settings.syncInterval || 5}
                        onChange={async (e) => {
                          const updated = { ...settings, syncInterval: Number(e.target.value) };
                          await db.settings.put(updated);
                          setSettings(updated);
                        }}
                      >
                        <option value={1}>1 min</option>
                        <option value={5}>5 min</option>
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={60}>1 hora</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={selectWorkspace}
                  className="flex-1 btn-secondary text-xs py-2"
                >
                  {settings?.directoryHandle ? 'Alterar Pasta' : 'Selecionar Pasta'}
                </button>
                {settings?.directoryHandle && (
                  <button 
                    onClick={forceSync}
                    className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1"
                  >
                    <RefreshCcw size={14} />
                    Sincronizar Agora
                  </button>
                )}
              </div>
              
              {settings?.lastSync && (
                <p className="text-[10px] text-slate-400 text-center">
                  Última sincronização: {format(new Date(settings.lastSync), 'dd/MM HH:mm')}
                </p>
              )}
            </div>
          </div>

          {/* Backup Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Backup e Restauração</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={exportBackup}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all gap-2"
              >
                <Download size={24} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Exportar</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all gap-2"
              >
                <Upload size={24} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Importar</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={importBackup} 
                  accept=".json" 
                  className="hidden" 
                />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              Zona de Perigo
            </h3>
            <div className="space-y-2">
              <button 
                onClick={clearLeads}
                className="w-full flex items-center gap-3 p-3 text-left border border-red-100 rounded-xl hover:bg-red-50 transition-all group"
              >
                <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Trash2 size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Limpar Banco de Leads</div>
                  <div className="text-xs text-slate-500">Apaga todos os registros de leads salvos</div>
                </div>
              </button>

              <button 
                onClick={resetToFactory}
                className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <RefreshCcw size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Resetar Script e Status</div>
                  <div className="text-xs text-slate-500">Restaura perguntas e status para o padrão</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Rede Script Pro v1.0.0<br/>
            Os dados são armazenados localmente no seu navegador.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
