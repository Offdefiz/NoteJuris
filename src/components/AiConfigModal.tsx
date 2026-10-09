import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Check, 
  AlertCircle, 
  Loader2, 
  WifiOff, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Server
} from 'lucide-react';
import { useAi } from '../context/AiContext';

export const AiConfigModal: React.FC = () => {
  const { 
    apiKey, 
    isOfflineMode, 
    hasServerKey, 
    isConfigModalOpen, 
    closeConfigModal, 
    saveSettings, 
    testApiKey 
  } = useAi();

  const [inputKey, setInputKey] = useState(apiKey);
  const [offline, setOffline] = useState(isOfflineMode);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if modal reopens
  React.useEffect(() => {
    if (isConfigModalOpen) {
      setInputKey(apiKey);
      setOffline(isOfflineMode);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isConfigModalOpen, apiKey, isOfflineMode]);

  if (!isConfigModalOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testApiKey(inputKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro ao validar conexão com o Google Gemini.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveSettings(inputKey, offline);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      closeConfigModal();
    }, 700);
  };

  const handleClearKey = () => {
    setInputKey('');
    saveSettings('', offline);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#fbfbfa] dark:bg-[#151922] rounded-3xl border border-[#dedbd3] dark:border-[#283244] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#ece8df] dark:border-[#222938] bg-white/80 dark:bg-[#1a202d]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#284b63] to-[#3b82f6] text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#141924] dark:text-[#f8fafc]">
                Conexão da API Google Gemini
              </h3>
              <p className="text-[11px] text-[#6e7687] dark:text-[#8e98ac]">
                Autonomia total • Integrada a todas as funções de IA
              </p>
            </div>
          </div>
          <button
            onClick={closeConfigModal}
            className="p-1.5 rounded-lg text-[#7c8699] dark:text-[#9ea8bd] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4.5 overflow-y-auto max-h-[75vh]">
          {/* Independence Banner */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a212f] border border-[#dedbd3] dark:border-[#283244] flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[12px] text-[#4d5668] dark:text-[#9ea8bd] leading-relaxed">
              <strong className="text-[#151923] dark:text-white block font-semibold mb-0.5">
                Independente & Seguro
              </strong>
              O Caderno Jurídico roda no seu próprio servidor/Docker sem depender do espaço de desenvolvimento. Quando configurada, sua chave é usada em <strong>todas as funções</strong> de IA (assistente, geração de flashcards, resumos e esquemas).
            </div>
          </div>

          {/* Server Key Detected note if applicable */}
          {hasServerKey && (
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center gap-2.5 text-[11.5px] text-blue-900 dark:text-blue-300">
              <Server className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Uma chave já está pré-configurada no arquivo <code>.env</code> do servidor. Você pode usar a padrão ou inserir uma chave personalizada abaixo.
              </span>
            </div>
          )}

          {/* Offline Mode Toggle */}
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#1a212f] border border-[#dedbd3] dark:border-[#283244] cursor-pointer hover:border-[#cbc6ba] dark:hover:border-[#38455e] transition-colors">
            <div className="flex items-center gap-3 pr-2">
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[12.5px] font-semibold text-[#181d28] dark:text-white block">
                  Modo 100% Offline (Sem chamada à API)
                </span>
                <span className="text-[11px] text-[#6f7788] dark:text-[#9aa4b7]">
                  Usa exclusivamente o gerador local do servidor de esquemas pré-definidos.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={offline}
              onChange={(e) => setOffline(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
          </label>

          {/* API Key Input */}
          {!offline && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5c6475] dark:text-[#9ea8bd]">
                  <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Chave da API Google Gemini</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Obter chave gratuita</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 text-[13px] font-mono rounded-xl bg-white dark:bg-[#131720] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white placeholder-[#8790a1] focus:outline-hidden focus:border-[#385b88] transition-colors"
                />
                {inputKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#717b8d] hover:text-rose-600 dark:hover:text-rose-400 px-1.5 py-0.5 rounded"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Test Button & Result */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting || !inputKey.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2c364b] bg-white dark:bg-[#1c2331] hover:bg-[#edebe6] dark:hover:bg-[#252e40] text-[11.5px] font-medium text-[#2d3444] dark:text-[#dce2ee] transition-colors disabled:opacity-40"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Testar Conexão</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-lg ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate max-w-xs">{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#ece8df] dark:border-[#222938] bg-white/80 dark:bg-[#1a202d]/80">
          <button
            type="button"
            onClick={closeConfigModal}
            className="px-4 py-2 rounded-xl border border-[#dedbd3] dark:border-[#2a3449] text-[12.5px] font-medium text-[#555d6e] dark:text-[#9ea8bc] hover:bg-[#edebe6] dark:hover:bg-[#202738] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#202735] dark:bg-[#344259] hover:bg-[#131720] text-white text-[12.5px] font-semibold transition-colors shadow-xs"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Salvo!</span>
              </>
            ) : (
              <span>Salvar Configuração</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
