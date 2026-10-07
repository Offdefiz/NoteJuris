import React from 'react';
import { 
  BookOpen, 
  Clock, 
  Sparkles, 
  Layers, 
  FolderKanban 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'notebook' | 'timeline' | 'flashcards';
  onNavigateNotebook: () => void;
  onNavigateTimeline: () => void;
  onOpenGemini: () => void;
  onOpenFlashcards: () => void;
  onOpenDisciplines: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateNotebook,
  onNavigateTimeline,
  onOpenGemini,
  onOpenFlashcards,
  onOpenDisciplines,
}) => {
  return (
    <nav 
      aria-label="Navegação inferior mobile"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#fbfbfa]/95 dark:bg-[#151922]/95 backdrop-blur-xl border-t border-[#e5e2da] dark:border-[#252d3e] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe"
    >
      <div className="flex items-center justify-around h-15 px-2 max-w-md mx-auto">
        {/* Tab 1: Caderno */}
        <button
          onClick={onNavigateNotebook}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            activeTab === 'notebook'
              ? 'text-[#284b63] dark:text-[#60a5fa] font-semibold'
              : 'text-[#6c7587] dark:text-[#8e98ac] hover:text-[#181d28] dark:hover:text-white'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'notebook' ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-1">Caderno</span>
        </button>

        {/* Tab 2: Linha do Tempo / Rito */}
        <button
          onClick={onNavigateTimeline}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            activeTab === 'timeline'
              ? 'text-[#284b63] dark:text-[#60a5fa] font-semibold'
              : 'text-[#6c7587] dark:text-[#8e98ac] hover:text-[#181d28] dark:hover:text-white'
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'timeline' ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-1">Rito</span>
        </button>

        {/* Tab 3: Center Elevated Gemini Button (Instagram / TikTok style hero trigger) */}
        <div className="flex items-center justify-center flex-1 -mt-4">
          <button
            onClick={onOpenGemini}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#203c50] via-[#284b63] to-[#3b82f6] text-white shadow-lg shadow-blue-500/25 active:scale-90 transition-transform ring-4 ring-[#fbfbfa] dark:ring-[#151922]"
            title="Abrir Assistente Gemini IA"
            aria-label="Assistente Gemini IA"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </button>
        </div>

        {/* Tab 4: Flashcards */}
        <button
          onClick={onOpenFlashcards}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 ${
            activeTab === 'flashcards'
              ? 'text-[#284b63] dark:text-[#60a5fa] font-semibold'
              : 'text-[#6c7587] dark:text-[#8e98ac] hover:text-[#181d28] dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#fbfbfa] dark:ring-[#151922]" />
          </div>
          <span className="text-[10px] tracking-tight mt-1">Cards</span>
        </button>

        {/* Tab 5: Disciplinas & Grade */}
        <button
          onClick={onOpenDisciplines}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#6c7587] dark:text-[#8e98ac] hover:text-[#181d28] dark:hover:text-white transition-all active:scale-90"
        >
          <FolderKanban className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-1">Matérias</span>
        </button>
      </div>
    </nav>
  );
};
