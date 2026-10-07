import React from 'react';
import { 
  ChevronRight, 
  Download, 
  Share2, 
  Menu, 
  Check, 
  Moon, 
  Sun, 
  User as UserIcon,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  disciplineName: string;
  documentTitle: string;
  lessonMeta: string;
  isSaving: boolean;
  onOpenExport: () => void;
  onOpenShare: () => void;
  onOpenAuth: () => void;
  onOpenGemini: () => void;
  onOpenCreateTopic: () => void;
  onOpenFlashcards: () => void;
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  disciplineName,
  documentTitle,
  lessonMeta,
  isSaving,
  onOpenExport,
  onOpenShare,
  onOpenAuth,
  onOpenGemini,
  onOpenCreateTopic,
  onOpenFlashcards,
  onOpenMobileSidebar,
}) => {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-[#fbfbfa]/90 dark:bg-[#151922]/90 backdrop-blur-md border-b border-[#e8e6e1] dark:border-[#242b3b] shadow-2xs">
      {/* Left zone: Mobile toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 -ml-1 text-[#5e6677] dark:text-[#97a0b3] hover:text-[#171b24] dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#6b7384] dark:text-[#8e98ab] truncate">
          <span className="font-semibold text-[#343b4a] dark:text-[#c4cbda] hover:text-[#1c222e] dark:hover:text-white cursor-pointer transition-colors truncate">
            {disciplineName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9fa7b8] dark:text-[#5e677c] shrink-0" />
          <span className="font-bold text-[#141924] dark:text-[#f0f2f7] truncate">
            {documentTitle}
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#eae7df] dark:bg-[#202735] text-[#555d6e] dark:text-[#9ea8bd] shrink-0 ml-1">
            {lessonMeta}
          </span>
        </nav>
      </div>

      {/* Right zone: Actions */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        {/* Flashcards Study Button */}
        <button
          onClick={onOpenFlashcards}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2c364b] bg-white dark:bg-[#1c2331] hover:bg-[#edebe6] dark:hover:bg-[#263145] text-[12px] font-semibold text-[#293242] dark:text-[#e2e8f0] transition-all shadow-2xs active:scale-[0.98]"
          title="Estudar flashcards interativos com repetição espaçada"
        >
          <span className="text-sm">🗂️</span>
          <span className="hidden sm:inline">Flashcards</span>
        </button>

        {/* Gemini Trigger Button */}
        <button
          onClick={onOpenGemini}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#284b63] to-[#3b82f6] hover:from-[#1f3b4e] hover:to-[#2563eb] text-white text-[12px] font-semibold transition-all shadow-xs active:scale-[0.98]"
          title="Abrir Assistente Jurídico Gemini"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden sm:inline">Assistente Gemini</span>
          <span className="sm:hidden">Gemini</span>
        </button>

        {/* Quick Add Topic Button */}
        <button
          onClick={onOpenCreateTopic}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#273144] hover:bg-[#edebe6] dark:hover:bg-[#1f2635] text-[12px] font-medium text-[#464e5e] dark:text-[#c4cbda] transition-colors"
          title="Criar nova matéria nesta disciplina"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Matéria</span>
        </button>

        {/* Save status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#4f5768] dark:text-[#9ea8bd] bg-[#f0eee9] dark:bg-[#1c222e] rounded-full border border-[#e1ded7] dark:border-[#283244]">
          {isSaving ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              <span>Salvo</span>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="p-2 rounded-lg text-[#5b6374] dark:text-[#9aa4b8] hover:bg-[#edebe6] dark:hover:bg-[#1f2635] transition-colors"
          aria-label="Alternar tema claro/escuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Export button */}
        <button
          onClick={onOpenExport}
          className="p-2 rounded-lg text-[#525969] dark:text-[#9ea8bd] hover:bg-[#edebe6] dark:hover:bg-[#1f2635] hover:text-[#181d27] dark:hover:text-white transition-colors"
          aria-label="Exportar material"
          title="Exportar (PDF, Markdown, JSON)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Share button */}
        <button
          onClick={onOpenShare}
          className="p-2 rounded-lg text-[#525969] dark:text-[#9ea8bd] hover:bg-[#edebe6] dark:hover:bg-[#1f2635] hover:text-[#181d27] dark:hover:text-white transition-colors"
          title="Compartilhar link do caderno"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* User avatar button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e6e3dc] dark:bg-[#252d3d] border border-[#d6d2c8] dark:border-[#353f53] text-[#202735] dark:text-[#e4e8f1] hover:scale-105 transition-transform"
          title={user ? `Logado como: ${profile?.displayName || user.email}` : 'Fazer login / Cadastrar'}
        >
          {user ? (
            <span className="text-[11px] font-bold">
              {(profile?.displayName || user.email || 'U')[0].toUpperCase()}
            </span>
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
