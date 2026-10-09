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
  Server,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAi, AiExecutionMode } from '../context/AiContext';

export const AiConfigModal: React.FC = () => {
  const { 
    apiKey, 
    aiMode,
    isOfflineMode, 
    hasServerKey, 
    isConfigModalOpen, 
    closeConfigModal, 
    saveSettings, 
    testApiKey 
  } = useAi();

  const [selectedMode, setSelectedMode] = useState<AiExecutionMode>(aiMode || (isOfflineMode ? 'static_fallback' : 'custom_key'));
  const [inputKey, setInputKey] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when modal opens or settings change
  React.useEffect(() => {
    if (isConfigModalOpen) {
      setSelectedMode(aiMode || (isOfflineMode ? 'static_fallback' : 'custom_key'));
      setInputKey(apiKey);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isConfigModalOpen, apiKey, aiMode, isOfflineMode]);

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
    saveSettings(inputKey, selectedMode);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      closeConfigModal();
    }, 700);
  };

  const handleClearKey = () => {
    setInputKey('');
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
                Configuração de IA & API
              </h3>
              <p className="text-[11px] text-[#6e7687] dark:text-[#8e98ac]">
                Autonomia total • Escolha entre Chave Própria ou Fallback Estático
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
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Independence Banner */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a212f] border border-[#dedbd3] dark:border-[#283244] flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[12px] text-[#4d5668] dark:text-[#9ea8bd] leading-relaxed">
              <strong className="text-[#151923] dark:text-white block font-semibold mb-0.5">
                Independente do Google Cloud / AI Studio
              </strong>
              O NoteJuris é auto-suficiente: você decide como executar as funcionalidades de inteligência jurídica. O app continua 100% funcional em qualquer ambiente.
            </div>
          </div>

          {/* Mode Selector Cards */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#5c6475] dark:text-[#9ea8bd] block">
              Selecione o Modo de Operação
            </label>

            {/* Option 1: Custom API Key */}
            <div
              onClick={() => setSelectedMode('custom_key')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedMode === 'custom_key'
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-[#1a212f] border-[#dedbd3] dark:border-[#283244] hover:border-[#cbd5e1] dark:hover:border-[#334155]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    selectedMode === 'custom_key'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#ece9df] dark:bg-[#252f42] text-[#5b6477] dark:text-[#a0acc2]'
                  }`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-[#141924] dark:text-[#f8fafc]">
                        Usar Minha Própria Chave da API Google
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        IA Conectada
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#60697b] dark:text-[#939eaf] mt-1 leading-relaxed">
                      Conecte sua chave gratuita da API Gemini para análises dinâmicas em tempo real, geração ilimitada de flashcards e assistência jurídica completa.
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                  selectedMode === 'custom_key'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-[#94a3b8] dark:border-[#64748b]'
                }`}>
                  {selectedMode === 'custom_key' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* API Key Sub-Panel (shown when custom_key selected) */}
              {selectedMode === 'custom_key' && (
                <div className="mt-3.5 pt-3.5 border-t border-blue-100 dark:border-blue-900/40 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#485368] dark:text-[#9ba7bd]">
                      Chave da API Google (armazenada com segurança no seu navegador):
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
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
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Cole sua chave aqui (ex: AIzaSy...)"
                      className="w-full px-3.5 py-2 text-[12.5px] font-mono rounded-xl bg-white dark:bg-[#121620] border border-[#cbd5e1] dark:border-[#2d394e] text-[#1a1f2b] dark:text-white placeholder-[#8790a1] focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                    {inputKey && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearKey();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#717b8d] hover:text-rose-600 dark:hover:text-rose-400 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTest();
                      }}
                      disabled={isTesting || !inputKey.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cbd5e1] dark:border-[#2e3b52] bg-white dark:bg-[#1e2636] hover:bg-[#f1f5f9] dark:hover:bg-[#273247] text-[11.5px] font-medium text-[#2d3444] dark:text-[#dce2ee] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          <span>Validando no Google...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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

            {/* Option 2: Static Fallback Mode */}
            <div
              onClick={() => setSelectedMode('static_fallback')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedMode === 'static_fallback'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/80 shadow-xs ring-1 ring-amber-500/20'
                  : 'bg-white dark:bg-[#1a212f] border-[#dedbd3] dark:border-[#283244] hover:border-[#cbd5e1] dark:hover:border-[#334155]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    selectedMode === 'static_fallback'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#ece9df] dark:bg-[#252f42] text-[#5b6477] dark:text-[#a0acc2]'
                  }`}>
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-[#141924] dark:text-[#f8fafc]">
                        Modo de Fallback Estático
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        100% Autônomo
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#60697b] dark:text-[#939eaf] mt-1 leading-relaxed">
                      Não requer nenhuma chave de API ou conexão externa. Utiliza a base de conhecimento jurídica local integrada, fichamentos e algoritmos de síntese estática nativos do NoteJuris.
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                  selectedMode === 'static_fallback'
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-[#94a3b8] dark:border-[#64748b]'
                }`}>
                  {selectedMode === 'static_fallback' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {selectedMode === 'static_fallback' && (
                <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-900/40 text-[11.5px] text-[#786134] dark:text-[#e4cf9b] flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Todas as funções (flashcards, resumos e esquemas) continuarão funcionando instantaneamente sem consumir cotas nem depender de serviços externos.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Server Key Detected note if applicable */}
          {hasServerKey && (
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center gap-2.5 text-[11.5px] text-blue-900 dark:text-blue-300">
              <Server className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Uma chave de servidor padrão está disponível via <code>GEMINI_API_KEY</code>. Se você escolher o Modo Chave Própria, sua chave terá prioridade absoluta.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ece8df] dark:border-[#222938] bg-white/80 dark:bg-[#1a202d]/80">
          <div className="text-[11px] text-[#6b7385] dark:text-[#8e98ac]">
            Modo ativo:{' '}
            <strong className="text-[#141924] dark:text-white">
              {selectedMode === 'custom_key' ? 'Chave de API Própria' : 'Fallback Estático (Offline)'}
            </strong>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={closeConfigModal}
              className="px-3.5 py-1.5 rounded-xl border border-[#dedbd3] dark:border-[#2a3449] text-[12px] font-medium text-[#555d6e] dark:text-[#9ea8bc] hover:bg-[#edebe6] dark:hover:bg-[#202738] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-xl bg-[#202735] dark:bg-[#344259] hover:bg-[#131720] text-white text-[12px] font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Configuração Salva!</span>
                </>
              ) : (
                <span>Salvar Escolha</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
