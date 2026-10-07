import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Layers, StickyNote, ArrowRight } from 'lucide-react';
import { NotebookDocument } from '../types/notebook';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NotebookDocument;
  onSelectResult: (elementId: string) => void;
}

interface SearchResult {
  id: string;
  category: 'Linha do Tempo' | 'Fluxograma' | 'Anotações';
  title: string;
  snippet: string;
  badge: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  document,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results: SearchResult[] = [];
  const q = query.trim().toLowerCase();

  if (q.length > 0) {
    // Search timeline items
    document.timelineItems.forEach((item) => {
      const match =
        item.title.toLowerCase().includes(q) ||
        item.article.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q);

      if (match) {
        results.push({
          id: `step-${item.stepNumber}`,
          category: 'Linha do Tempo',
          title: `${item.stepNumber}. ${item.title}`,
          snippet: item.article + ' — ' + item.detail,
          badge: item.stepNumber,
        });
      }
    });

    // Search flowchart cards
    const { flow } = document;
    if (
      flow.card1.title.toLowerCase().includes(q) ||
      flow.card1.body.toLowerCase().includes(q) ||
      flow.card1.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push({
        id: 'flow-card-1',
        category: 'Fluxograma',
        title: '01. ' + flow.card1.title,
        snippet: flow.card1.body,
        badge: '01',
      });
    }

    if (
      flow.card2.title.toLowerCase().includes(q) ||
      flow.card2.branches.some(
        (b) => b.title.toLowerCase().includes(q) || b.note.toLowerCase().includes(q)
      )
    ) {
      results.push({
        id: 'flow-card-2',
        category: 'Fluxograma',
        title: '02. ' + flow.card2.title,
        snippet: 'Formas de início: De ofício, Requisição, Requerimento',
        badge: '02',
      });
    }

    if (
      flow.card3.title.toLowerCase().includes(q) ||
      flow.card3.legalNote.toLowerCase().includes(q) ||
      flow.card3.items.some((i) => i.toLowerCase().includes(q))
    ) {
      results.push({
        id: 'flow-card-3',
        category: 'Fluxograma',
        title: '03. ' + flow.card3.title,
        snippet: 'Características: ' + flow.card3.legalNote,
        badge: '03',
      });
    }

    if (
      flow.card4.title.toLowerCase().includes(q) ||
      flow.card4.promptBox.toLowerCase().includes(q) ||
      flow.card4.noteLines.some((l) => l.toLowerCase().includes(q))
    ) {
      results.push({
        id: 'flow-card-4',
        category: 'Fluxograma',
        title: '04. ' + flow.card4.title,
        snippet: 'Diligências e atos investigatórios',
        badge: '04',
      });
    }

    if (
      flow.card5.title.toLowerCase().includes(q) ||
      flow.card5.body.toLowerCase().includes(q) ||
      flow.card5.deadlines.some(
        (d) => d.label.toLowerCase().includes(q) || d.text.toLowerCase().includes(q)
      )
    ) {
      results.push({
        id: 'flow-card-5',
        category: 'Fluxograma',
        title: '05. ' + flow.card5.title,
        snippet: 'Prazos: 10 dias indiciado preso / 30 dias solto',
        badge: '05',
      });
    }

    // Search custom notes
    document.customNotes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)) {
        results.push({
          id: n.id,
          category: 'Anotações',
          title: n.title,
          snippet: n.body,
          badge: n.number,
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#181e2b] rounded-2xl border border-[#dedbd3] dark:border-[#2b3548] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#ece9e1] dark:border-[#252e40]">
          <Search className="w-5 h-5 text-[#798192] dark:text-[#8b95a8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por artigos (ex: art. 396), ritos, prazos ou termos..."
            className="w-full px-3 text-[14px] bg-transparent text-[#181d28] dark:text-white placeholder-[#8e97a8] focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#798192] hover:text-[#181d28] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {q.length === 0 ? (
            <div className="py-8 text-center text-[#747d8f] dark:text-[#8e98ab] space-y-1">
              <p className="text-[13px] font-medium">Digite algo para buscar no caderno</p>
              <p className="text-[11px]">Dica: busque por "art. 403", "testemunha", "prazo" ou "MP"</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-[#747d8f] dark:text-[#8e98ab]">
              <p className="text-[13px] font-medium">Nenhum resultado encontrado para "{query}"</p>
            </div>
          ) : (
            results.map((res, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectResult(res.id);
                  onClose();
                }}
                className="flex items-start justify-between w-full p-3 rounded-xl hover:bg-[#f2efe8] dark:hover:bg-[#202738] transition-colors text-left group"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#737b8c] dark:text-[#8894a8]">
                      {res.category}
                    </span>
                    <span className="text-[10px] font-mono px-1 rounded bg-[#dedbd2] dark:bg-[#2b3548] text-[#2c3342] dark:text-[#c4cbda]">
                      {res.badge}
                    </span>
                  </div>
                  <p className="text-[13px] font-serif font-bold text-[#151922] dark:text-[#f8fafc] group-hover:text-[#2d5b88] dark:group-hover:text-[#60a5fa] truncate">
                    {res.title}
                  </p>
                  <p className="text-[12px] text-[#555d6e] dark:text-[#9ea8bc] line-clamp-1">
                    {res.snippet}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8a94a6] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#f9f8f5] dark:bg-[#131720] border-t border-[#ece9e1] dark:border-[#252e40] flex items-center justify-between text-[11px] text-[#747c8c] dark:text-[#7f8899]">
          <span>{results.length} resultados encontrados</span>
          <span>Pressione <kbd className="font-mono px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">ESC</kbd> para fechar</span>
        </div>
      </div>
    </div>
  );
};
