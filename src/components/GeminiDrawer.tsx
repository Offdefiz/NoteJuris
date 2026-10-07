import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';
import { TimelineItem, NoteBlock } from '../types/notebook';

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
      content: `Olá! Sou seu assistente jurídico inteligente com tecnologia Google Gemini. Posso te ajudar a montar linhas do tempo processuais, esquematizar artigos da lei, listar jurisprudência do STJ/STF ou criar blocos de estudo para a aula de **${currentTitle}** em **${disciplineName}**. Escolha uma sugestão abaixo ou faça sua pergunta!`,
      timestamp: 'Agora',
    },
  ]);
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
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentTitle,
          discipline: disciplineName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na comunicação com o assistente.');
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Nenhuma resposta recebida.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro ao consultar o Gemini: ${err.message}`,
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
    const title = lines[0]?.replace(/[#*_-]/g, '').trim().slice(0, 70) || `Estudo Gemini: ${currentTitle}`;
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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3b5998] to-[#60a5fa] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-[17px] font-bold text-[#141924] dark:text-[#f8fafc]">
                  Assistente Jurídico Gemini
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  IA Studio
                </span>
              </div>
              <p className="text-[11px] text-[#697283] dark:text-[#9ea8bc] truncate max-w-xs">
                {disciplineName} • {currentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#717a8c] hover:text-[#141924] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-[#f5f3ec]/80 dark:bg-[#131720]/80 border-b border-[#ece8df] dark:border-[#222a3a] overflow-x-auto scrollbar-thin">
          <div className="flex gap-2 min-w-max">
            {suggestions.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.prompt)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-[#1c2331] text-[#333b4b] dark:text-[#c4cbda] border border-[#dedbd3] dark:border-[#2b3548] hover:border-[#385b88] dark:hover:border-[#60a5fa] hover:text-[#182638] dark:hover:text-white transition-all shadow-2xs disabled:opacity-50 text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-[#3b5998] dark:text-[#60a5fa] shrink-0" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-[13px] leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-[#212836] dark:bg-[#2d384c] text-white rounded-tr-xs'
                    : 'bg-white dark:bg-[#1a202d] text-[#1c222e] dark:text-[#e4e7ee] border border-[#e5e1d7] dark:border-[#273144] rounded-tl-xs'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#f0eee9] dark:border-[#232b3c] text-[10px] font-bold tracking-wider text-[#647188] dark:text-[#8d9ab3] uppercase">
                    <Sparkles className="w-3 h-3 text-[#3b5998] dark:text-[#60a5fa]" />
                    <span>Gemini 3.8 Flash</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Assistant actions on responses */}
                {msg.role === 'assistant' && msg.id !== 'welcome' && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-[#f0eee9] dark:border-[#232b3c]">
                    <button
                      onClick={() => handleAddToNotes(msg.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#f0eee9] dark:bg-[#252f42] text-[#2c3342] dark:text-[#cbd5e1] hover:bg-[#e4e1d7] dark:hover:bg-[#313e56] transition-colors"
                      title="Criar bloco de anotações no caderno com esta resposta"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#407052] dark:text-[#4ade80]" />
                      <span>Inserir nas Anotações</span>
                    </button>

                    <button
                      onClick={() => handleAddToTimeline(msg.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#f0eee9] dark:bg-[#252f42] text-[#2c3342] dark:text-[#cbd5e1] hover:bg-[#e4e1d7] dark:hover:bg-[#313e56] transition-colors"
                      title="Adicionar como novo passo na Linha do Tempo"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#284b63] dark:text-[#60a5fa]" />
                      <span>Adicionar na Linha</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#656d7d] dark:text-[#94a3b8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-auto"
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
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#8e97a7] mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white dark:bg-[#1a202d] border border-[#e5e1d7] dark:border-[#273144] w-fit">
              <Loader2 className="w-4 h-4 text-[#3b5998] dark:text-[#60a5fa] animate-spin" />
              <span className="text-[12px] font-medium text-[#4f5768] dark:text-[#9ea8bd]">
                Gemini está estruturando a fundamentação jurídica...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-[#171d28] border-t border-[#ece8df] dark:border-[#222a3a]">
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
              placeholder="Pergunte ao Gemini ou peça uma linha do tempo..."
              className="flex-1 px-3.5 py-2.5 text-[13px] rounded-xl bg-[#f5f4ef] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#263042] text-[#1c222e] dark:text-white placeholder-[#8790a0] focus:outline-hidden focus:border-[#3b5998] dark:focus:border-[#60a5fa]"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="flex items-center justify-center p-2.5 rounded-xl bg-[#202735] dark:bg-[#313f56] hover:bg-[#141924] dark:hover:bg-[#40516d] text-white transition-colors disabled:opacity-40"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-[#868f9f] text-center mt-2">
            Respostas orientadas pela legislação brasileira (CPP, CP, CF/88, CPC).
          </p>
        </div>
      </div>
    </div>
  );
};
