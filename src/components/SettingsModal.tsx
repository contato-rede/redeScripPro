import React, { useRef, useState, useEffect } from 'react';
import { db } from '../db';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Download, Upload, RefreshCcw, X, ShieldAlert, FolderOpen, HardDrive, Smartphone, Sparkles, ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { DEFAULT_QUESTIONS, INITIAL_STATUSES } from '../constants';
import { syncToLocalExcel } from '../lib/sync';
import { cn } from '../lib/utils';
import { AppSettings } from '../types';
import { GoogleGenAI } from "@google/genai";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);

  const generateAndSetIcon = async () => {
    // Check for API key selection if using advanced models or if previous attempt failed with permission error
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        toast.info('Para gerar imagens com IA de alta qualidade, você precisa selecionar uma chave de API paga.', {
          action: {
            label: 'Selecionar Chave',
            onClick: () => (window as any).aistudio.openSelectKey()
          },
          duration: 5000
        });
        return;
      }
    }

    setIsGeneratingIcon(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Using 2.5 for better compatibility
        contents: {
          parts: [
            {
              text: 'A modern, minimalist app icon for a sales management software called "Rede Script Pro". The icon should feature a stylized document or script combined with a dashboard graph element. Use a vibrant indigo and white color palette. Professional, clean, high-quality, 512x512, centered on a solid background, suitable for a desktop icon.',
            },
          ],
        },
      });

      let iconUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          iconUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (iconUrl) {
        // Update manifest links in index.html dynamically
        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (manifestLink) {
          // In a real app we'd save this to a file, but for now we'll just show it
          toast.success('Ícone gerado com sucesso! (Visualização disponível abaixo)');
          // Store in local storage for persistence in this session
          localStorage.setItem('rspro_custom_icon', iconUrl);
          window.location.reload();
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Requested entity was not found') || errorMessage.includes('PERMISSION_DENIED')) {
        toast.error('Erro de permissão. Por favor, selecione sua chave de API novamente.', {
          action: {
            label: 'Selecionar Chave',
            onClick: () => (window as any).aistudio.openSelectKey()
          }
        });
      } else {
        toast.error('Erro ao gerar ícone: ' + errorMessage);
      }
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tipos de arquivo suportados específicos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    // Validar tipo MIME e extensão do arquivo
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      toast.error('Formato não suportado. Use apenas JPG, PNG ou WEBP.', {
        duration: 4000,
      });
      // Limpar input para permitir nova seleção
      e.target.value = '';
      return;
    }

    // Validar tamanho do arquivo (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Imagem muito grande. Tamanho máximo: 5MB.\nTamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`, {
        duration: 5000,
      });
      e.target.value = '';
      return;
    }

    // Validar tamanho mínimo do arquivo (evitar imagens muito pequenas/corrompidas)
    const minSize = 1 * 1024; // 1KB
    if (file.size < minSize) {
      toast.error('Arquivo muito pequeno. Selecione uma imagem válida.', {
        duration: 4000,
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const iconUrl = event.target?.result as string;
      if (!iconUrl) {
        toast.error('Erro ao processar a imagem. Tente novamente.');
        e.target.value = '';
        return;
      }

      // Criar imagem para validar dimensões
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const minDimension = 64; // Mínimo 64x64 pixels
        const maxDimension = 2048; // Máximo 2048x2048 pixels

        // Validar dimensões mínimas
        if (width < minDimension || height < minDimension) {
          toast.error(`Dimensões muito pequenas. Mínimo: ${minDimension}x${minDimension}px.\nDimensões atuais: ${width}x${height}px`, {
            duration: 5000,
          });
          e.target.value = '';
          return;
        }

        // Validar dimensões máximas
        if (width > maxDimension || height > maxDimension) {
          toast.error(`Dimensões muito grandes. Máximo: ${maxDimension}x${maxDimension}px.\nDimensões atuais: ${width}x${height}px`, {
            duration: 5000,
          });
          e.target.value = '';
          return;
        }

        // Validar proporção (não aceitar imagens muito alongadas)
        const aspectRatio = width / height;
        const minAspectRatio = 0.5; // 1:2
        const maxAspectRatio = 2.0; // 2:1

        if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
          toast.error('Proporção da imagem inválida. Use uma imagem mais quadrada (entre 1:2 e 2:1).', {
            duration: 5000,
          });
          e.target.value = '';
          return;
        }

        // Todas as validações passaram - salvar o ícone
        try {
          localStorage.setItem('rspro_custom_icon', iconUrl);
          toast.success(`Ícone atualizado com sucesso!\nDimensões: ${width}x${height}px`, {
            duration: 3000,
          });
          window.location.reload();
        } catch (storageError) {
          // Erro de quota excedida no localStorage
          toast.error('Imagem muito grande para armazenar. Tente uma imagem menor ou compacte-a.', {
            duration: 5000,
          });
          e.target.value = '';
        }
      };

      img.onerror = () => {
        toast.error('Erro ao carregar a imagem. O arquivo pode estar corrompido.', {
          duration: 4000,
        });
        e.target.value = '';
      };

      img.src = iconUrl;
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Erro ao ler o arquivo. Verifique se o arquivo não está corrompido.', {
        duration: 4000,
      });
      e.target.value = '';
    };

    reader.onabort = () => {
      toast.error('Leitura do arquivo foi cancelada.', {
        duration: 3000,
      });
      e.target.value = '';
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Erro inesperado ao processar o arquivo. Tente novamente.', {
        duration: 4000,
      });
      e.target.value = '';
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
    if (!settings?.directoryHandle) return;
    
    try {
      // Re-verify permission
      const status = await (settings.directoryHandle as any).queryPermission({ mode: 'readwrite' });
      if (status !== 'granted') {
        await (settings.directoryHandle as any).requestPermission({ mode: 'readwrite' });
      }
      
      await syncToLocalExcel(settings.directoryHandle);
      toast.success('Sincronização concluída!');
      
      const updated = await db.settings.get('main');
      if (updated) setSettings(updated);
    } catch (error) {
      toast.error('Falha na sincronização. Tente reconectar a pasta.');
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-600 uppercase">Personalizar Ícone</div>
                  {localStorage.getItem('rspro_custom_icon') && (
                    <button 
                      onClick={() => {
                        localStorage.removeItem('rspro_custom_icon');
                        window.location.reload();
                      }}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Resetar Ícone
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                    <img 
                      src={localStorage.getItem('rspro_custom_icon') || 'https://picsum.photos/seed/rspro/192/192'} 
                      alt="App Icon" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => iconInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all shadow-sm"
                      >
                        <ImageIcon size={14} />
                        Upload
                      </button>
                      <input
                        type="file"
                        ref={iconInputRef}
                        onChange={handleIconUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <button 
                        onClick={generateAndSetIcon}
                        disabled={isGeneratingIcon}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                      >
                        {isGeneratingIcon ? (
                          <RefreshCcw size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {isGeneratingIcon ? 'Gerando...' : 'Gerar com IA'}
                      </button>
                      
                      {localStorage.getItem('rspro_custom_icon') && (
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = localStorage.getItem('rspro_custom_icon')!;
                            link.download = 'RedeScriptPro_Icon.png';
                            link.click();
                          }}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                          title="Baixar Ícone"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Faça upload da sua imagem ou gere um ícone profissional com IA.
                    </p>
                  </div>
                </div>
              </div>
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
