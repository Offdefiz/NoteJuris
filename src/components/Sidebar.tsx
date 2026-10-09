import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Home, 
  FolderLock, 
  FileCheck2, 
  Sparkles, 
  MoreVertical, 
  LogIn, 
  User as UserIcon,
  Moon, 
  Sun, 
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  FolderPlus,
  Key,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAi } from '../context/AiContext';
import { Discipline, TopicItem } from '../types/notebook';

interface SidebarProps {
  disciplines: Discipline[];
  activeDisciplineId: string;
  activeTopicId: string;
  onSelectTopic: (disciplineId: string, topicId: string) => void;
  onOpenCreateModal: (mode: 'discipline' | 'topic') => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenGemini: () => void;
  onOpenFlashcards: () => void;
  onOpenDocAnalysis?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  disciplines,
  activeDisciplineId,
  activeTopicId,
  onSelectTopic,
  onOpenCreateModal,
  onOpenSearch,
  onOpenAuth,
  onOpenGemini,
  onOpenFlashcards,
  onOpenDocAnalysis,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openConfigModal, isKeyConfigured, isOfflineMode } = useAi();

  // Track expanded disciplines
  const [expandedDisciplines, setExpandedDisciplines] = useState<Record<string, boolean>>({
    'processual-penal': true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDisciplines((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'EA';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[280px] bg-[#fbfbfa] dark:bg-[#151922] border-r border-[#e8e6e1] dark:border-[#242b3b] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#f0eee9] dark:border-[#222836]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1f2633] dark:bg-[#283244] text-white shadow-xs">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="font-serif text-[17px] font-bold tracking-tight text-[#171b24] dark:text-[#f1f3f7] leading-tight">
                Caderno Jurídico
              </p>
              <p className="text-[11px] font-medium tracking-wide text-[#788194] dark:text-[#9ba4b6] lowercase">
                área de estudos
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-[#798192] hover:text-[#171b24] dark:hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Assistant Callout Button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              onOpenGemini();
              onCloseMobile();
            }}
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-900/5 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700 text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#284b63] dark:bg-[#3b82f6] text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[#1e3a5f] dark:text-[#93c5fd] block leading-tight">
                  Assistente Gemini
                </span>
                <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                  Linhas do tempo & ritos com IA
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              Novo
            </span>
          </button>
        </div>

        {/* OpenAI Legal Document Analysis Card */}
        <div className="px-3 pt-2">
          <button
            onClick={() => {
              if (onOpenDocAnalysis) onOpenDocAnalysis();
              onCloseMobile();
            }}
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-emerald-900/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-700 text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-emerald-900 dark:text-emerald-300 block leading-tight">
                  Análise de Peças
                </span>
                <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                  PDFs & autos via gpt-4o-mini
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              OpenAI
            </span>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 px-3 py-3 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Main group */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onOpenSearch();
                onCloseMobile();
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-medium text-[#414856] dark:text-[#c4cbd8] rounded-lg hover:bg-[#edebe6]/60 dark:hover:bg-[#1f2635] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#636c7e] dark:text-[#8893a7]" />
                <span>Pesquisar</span>
              </div>
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border border-[#dfddd7] dark:border-[#32394a] text-[#808899] dark:text-[#7f889b] bg-[#f4f2ee] dark:bg-[#1a202c]">
                ⌘ K
              </span>
            </button>
          </div>

          {/* Section: Disciplinas e Matérias */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-[10px] font-bold tracking-wider text-[#8a92a0] dark:text-[#6e7789] uppercase">
                MINHAS DISCIPLINAS
              </p>
              <button
                onClick={() => onOpenCreateModal('discipline')}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#284b63] dark:text-[#60a5fa] hover:underline"
                title="Adicionar nova disciplina à grade curricular"
              >
                <Plus className="w-3 h-3" />
                <span>Nova</span>
              </button>
            </div>

            <div className="space-y-1">
              {disciplines.map((d) => {
                const isDisciplineActive = activeDisciplineId === d.id;
                const isExpanded = expandedDisciplines[d.id] ?? isDisciplineActive;

                return (
                  <div key={d.id} className="rounded-xl overflow-hidden">
                    {/* Discipline header row */}
                    <div
                      onClick={() => {
                        // Select first topic in this discipline
                        if (d.topics.length > 0) {
                          onSelectTopic(d.id, d.topics[0].id);
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors ${
                        isDisciplineActive
                          ? 'bg-[#eae7df] dark:bg-[#222938] text-[#141924] dark:text-white'
                          : 'text-[#3e4554] dark:text-[#c4cbda] hover:bg-[#edebe6]/60 dark:hover:bg-[#1d2331]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full ${d.dotColor} shrink-0`} />
                        <span className="truncate">{d.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleExpand(d.id, e)}
                          className="p-1 rounded text-[#7c8699] hover:text-[#181d28] dark:hover:text-white"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sub-topics list (Matérias) */}
                    {isExpanded && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-[#e6e3da] dark:border-[#273042] ml-4 mt-0.5">
                        {d.topics.map((t) => {
                          const isTopicActive = activeTopicId === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                onSelectTopic(d.id, t.id);
                                onCloseMobile();
                              }}
                              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[12px] font-medium text-left transition-colors ${
                                isTopicActive
                                  ? 'bg-[#dedbd2] dark:bg-[#2b3548] text-[#141924] dark:text-white font-semibold'
                                  : 'text-[#555d6e] dark:text-[#a1acbe] hover:bg-[#edebe6]/50 dark:hover:bg-[#1e2533]'
                              }`}
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[10px] font-mono opacity-60 shrink-0 ml-1">
                                {t.lessonMeta.replace('AULA ', '#')}
                              </span>
                            </button>
                          );
                        })}

                        {/* Add new topic button */}
                        <button
                          onClick={() => onOpenCreateModal('topic')}
                          className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-[11px] font-medium text-[#798394] dark:text-[#8895ad] hover:text-[#181d28] dark:hover:text-white transition-colors text-left"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar matéria...</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Meus Materiais */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-[#8a92a0] dark:text-[#6e7789] uppercase">
              MEUS MATERIAIS
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onOpenFlashcards();
                  onCloseMobile();
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[12px] font-medium text-[#414856] dark:text-[#c4cbd8] rounded-lg hover:bg-[#edebe6]/60 dark:hover:bg-[#1f2635] transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🗂️</span>
                  <span>Flashcards de Estudo</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Praticar
                </span>
              </button>
              <button
                onClick={onCloseMobile}
                className="flex items-center w-full gap-2.5 px-3 py-1.5 text-[12px] font-medium text-[#414856] dark:text-[#c4cbd8] rounded-lg hover:bg-[#edebe6]/60 dark:hover:bg-[#1f2635] transition-colors text-left"
              >
                <FolderLock className="w-4 h-4 text-[#636c7e] dark:text-[#8893a7]" />
                <span>Resumos Gerais</span>
              </button>
              <button
                onClick={onCloseMobile}
                className="flex items-center w-full gap-2.5 px-3 py-1.5 text-[12px] font-medium text-[#414856] dark:text-[#c4cbd8] rounded-lg hover:bg-[#edebe6]/60 dark:hover:bg-[#1f2635] transition-colors text-left"
              >
                <FileCheck2 className="w-4 h-4 text-[#636c7e] dark:text-[#8893a7]" />
                <span>Questões & Prazos</span>
              </button>
              <button
                onClick={() => {
                  onCloseMobile();
                  openConfigModal();
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[12px] font-medium text-[#414856] dark:text-[#c4cbd8] rounded-lg hover:bg-[#edebe6]/60 dark:hover:bg-[#1f2635] transition-colors text-left"
                title="Configurar Chave da API Google Gemini"
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>API Google</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOfflineMode
                      ? 'bg-amber-400'
                      : isKeyConfigured
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#f0eee9] dark:border-[#222836] space-y-2.5">
          {/* User Profile bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#edebe6]/60 dark:bg-[#1a202c] border border-[#e2dfd7] dark:border-[#242b3b]">
            <button
              onClick={onOpenAuth}
              className="flex items-center flex-1 min-w-0 gap-2.5 text-left group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#273142] text-white text-xs font-semibold shrink-0">
                {user ? initials : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#1c222e] dark:text-[#f0f2f7] truncate group-hover:underline">
                  {user ? profile?.displayName || 'Estudante' : 'Entrar / Cadastrar'}
                </p>
                <p className="text-[10px] text-[#767e8f] dark:text-[#8d97ac] truncate">
                  {user ? profile?.role || 'Meu espaço' : 'Conta local / Servidor'}
                </p>
              </div>
            </button>

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              className="p-1.5 rounded-lg text-[#5c6475] dark:text-[#9aa4b8] hover:bg-[#dfddd7] dark:hover:bg-[#283244] transition-colors shrink-0"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
