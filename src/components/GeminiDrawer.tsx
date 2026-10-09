import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  PlusCircle, 
  Copy, 
  Check, 
  Clock, 
  GitBranch, 
  AlertTriangle, 
  Scale, 
  HelpCircle,
  Settings,
  Server,
  Key,
  WifiOff,
  Cpu
} from 'lucide-react';
import { TimelineItem } from '../types/notebook';
import { useAi } from '../context/AiContext';

interface GeminiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  disciplineName: string;
  onInsertTimelineItem: (item: Partial<TimelineItem>) => void;
  onAddNoteBlock: (title: string, body: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isOffline?: boolean;
}

export const GeminiDrawer: React.FC<GeminiDrawerProps> = ({
  isOpen,
  onClose,
  currentTitle,
  disciplineName,
  onInsertTimelineItem,
  onAddNoteBlock,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou seu assistente para estudos jurídicos. Posso te ajudar a esquematizar linhas do tempo processuais, fluxogramas de ritos, prazos críticos e súmulas dos tribunais para a aula de **${currentTitle}** (${disciplineName}).\n\n💡 *Funciona com inteligência artificial ou em modo autônomo offline no seu servidor próprio!*`,
      timestamp: 'Agora',
    },
  ]);
  const { 
    apiKey, 
    isOfflineMode, 
    openConfigModal, 
    askAiAssistant, 
    isKeyConfigured 
  } = useAi();

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const suggestions = [
    {
      icon: Clock,
      label: 'Gerar Linha do Tempo Processual',
      prompt: `Crie uma linha do tempo sequencial e detalhada descrevendo as etapas procedimentais e prazos para o tema: ${currentTitle} (${disciplineName}), com artigos do código e notas práticas.`,
    },
    {
      icon: GitBranch,
      label: 'Esquematizar em Fluxograma',
      prompt: `Crie uma estrutura de fluxograma didático com ponto de partida, hipóteses/ramificações (A, B, C) e desfechos possíveis para: ${currentTitle}.`,
    },
    {
      icon: AlertTriangle,
      label: 'Pegadinhas & Prazos Críticos',
      prompt: `Quais são as principais pegadinhas de prova, divergências doutrinárias e prazos fatais cobrados sobre ${currentTitle}?`,
    },
    {
      icon: Scale,
      label: 'Jurisprudência Relevante (STF/STJ)',
      prompt: `Resuma as principais súmulas e teses fixadas pelo STF e STJ sobre o tema: ${currentTitle}.`,
    },
    {
      icon: HelpCircle,
      label: 'Caso Prático com Gabarito',
      prompt: `Elabore uma questão prática estilo 2ª Fase OAB/Magistratura sobre ${currentTitle}, seguida de gabarito comentado fundamentado na lei.`,
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const result = await askAiAssistant({
        prompt: text,
        currentTitle,
        discipline: disciplineName,
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.text || 'Nenhuma resposta recebida.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffline: result.isOffline,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro ao consultar o assistente: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddToNotes = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const title = lines[0]?.replace(/[#*_-]/g, '').trim().slice(0, 70) || `Estudo: ${currentTitle}`;
    const body = lines.slice(1).join('\n').trim() || text;
    onAddNoteBlock(title, body);
  };

  const handleAddToTimeline = (text: string) => {
    onInsertTimelineItem({
      title: `Etapa Gerada (${currentTitle})`,
      detail: text.slice(0, 160) + (text.length > 160 ? '...' : ''),
      notes: text,
      article: 'Legislação Aplicável',
      type: 'procedimento',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#fbfbfa] dark:bg-[#151a24] border-l border-[#e5e2da] dark:border-[#273042] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ece8df] dark:border-[#222a3a] bg-white/80 dark:bg-[#1a212e]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#284b63] to-[#3b82f6] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-[17px] font-bold text-[#141822] dark:text-[#f8fafc]">
                  Assistente de Estudos
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                  {isOfflineMode ? 'Modo Offline' : 'Gemini / Autônomo'}
                </span>
              </div>
              <p className="text-[11px] text-[#6b7385] dark:text-[#9ea8bd]">
                Focado em: <span className="font-medium text-[#1e2430] dark:text-white">{currentTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openConfigModal}
              className="p-2 rounded-lg text-[#6b7385] dark:text-[#9ea8bd] hover:bg-[#edebe6] dark:hover:bg-[#202738] transition-colors"
              title="Configurar Chave da API Google Gemini"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#6b7385] dark:text-[#9ea8bd] hover:bg-[#edebe6] dark:hover:bg-[#202738]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Chat Area */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 text-[13px] leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#202735] dark:bg-[#2d394d] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#1a212e] text-[#1a1f2c] dark:text-[#e4e8f1] border border-[#ece8df] dark:border-[#252e3f] rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#f0ece3] dark:border-[#242c3d]">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#5c6475] dark:text-[#9ea8bd] hover:text-[#171b24] dark:hover:text-white"
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleAddToNotes(msg.content)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#2563eb] dark:text-[#60a5fa] hover:underline"
                          title="Inserir como bloco de anotação na aula"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Adicionar às Anotações</span>
                        </button>

                        <button
                          onClick={() => handleAddToTimeline(msg.content)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#059669] dark:text-[#34d399] hover:underline"
                          title="Adicionar à linha do tempo"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Na Linha do Tempo</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#868f9f] mt-1 px-1">
                    {msg.timestamp} {msg.isOffline ? '• modo offline' : ''}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-[12px] text-[#6b7385] dark:text-[#9ea8bd] p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Elaborando esquema jurídico...</span>
                </div>
              )}
            </div>

            {/* Quick Action Suggestions */}
            <div className="p-3 bg-[#f5f3ec] dark:bg-[#161c27] border-t border-[#eae6dc] dark:border-[#222a3a]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#828b9c] dark:text-[#737c8e] mb-2 px-1">
                Ações Rápidas para Esta Aula:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {suggestions.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s.prompt)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1e2533] border border-[#dfdbd1] dark:border-[#2c3649] text-[11px] font-medium text-[#2d3444] dark:text-[#dce2ee] hover:bg-[#eae7df] dark:hover:bg-[#283244] shrink-0 transition-colors shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#ece8df] dark:border-[#222a3a] bg-white dark:bg-[#1a212e]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder={`Pergunte sobre ${currentTitle} ou peça um esquema...`}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#f7f6f2] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[16px] sm:text-[13px] text-[#181d28] dark:text-white placeholder-[#8790a1] focus:outline-hidden focus:border-[#24334a]"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || loading}
                  className="p-2.5 rounded-xl bg-[#202735] dark:bg-[#344157] hover:bg-[#131720] dark:hover:bg-[#465775] text-white disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
      </div>
    </div>
  );
};
