import React, { useRef } from 'react';
import { TimelineItem, TimelineAlert, LegendType } from '../types/notebook';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Trash2, Sparkles } from 'lucide-react';

interface TimelineSectionProps {
  heading: {
    eyebrow: string;
    title: string;
    note: string;
  };
  items: TimelineItem[];
  alerts: TimelineAlert[];
  activeFilter: LegendType | null;
  onUpdateHeading: (field: 'title' | 'note', value: string) => void;
  onUpdateItem: (id: string, updates: Partial<TimelineItem>) => void;
  onUpdateAlert: (id: string, text: string) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onOpenGemini?: () => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  heading,
  items,
  alerts,
  activeFilter,
  onUpdateHeading,
  onUpdateItem,
  onUpdateAlert,
  onAddItem,
  onDeleteItem,
  onOpenGemini,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="timeline-section" className="space-y-6 pt-4 scroll-mt-20">
      {/* Section Header with Left/Right Scroll Arrows & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#717a8c] dark:text-[#8e98ac] uppercase block mb-1">
            {heading.eyebrow}
          </span>
          <div className="flex items-center gap-2">
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateHeading('title', e.currentTarget.textContent || heading.title)}
              className="text-xl sm:text-2xl font-serif font-bold text-[#1a1f2b] dark:text-[#f8fafc] focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 px-1 -mx-1 rounded cursor-text"
            >
              {heading.title}
            </h2>
          </div>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateHeading('note', e.currentTarget.textContent || heading.note)}
            className="text-[12px] text-[#697283] dark:text-[#9aa4b8] focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 px-1 -mx-1 rounded cursor-text block mt-0.5"
          >
            {heading.note}
          </span>
        </div>

        {/* Action buttons & Scroll Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-end">
          {onOpenGemini && (
            <button
              onClick={onOpenGemini}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[11px] font-semibold transition-colors"
              title="Pedir ao Gemini para gerar etapas procedimentais"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar com IA</span>
            </button>
          )}

          <button
            onClick={onAddItem}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2a3346] bg-[#fbfbfa] dark:bg-[#191f2c] text-[#414958] dark:text-[#c4cbda] hover:bg-[#eae7df] dark:hover:bg-[#252e40] text-[11px] font-medium transition-colors"
            title="Adicionar nova etapa manual"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Passo</span>
          </button>

          <div className="flex items-center gap-1 border-l border-[#dedbd3] dark:border-[#2a3346] pl-2">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2a3346] bg-[#fbfbfa] dark:bg-[#191f2c] text-[#555d6e] dark:text-[#a0abbd] hover:bg-[#eae7df] dark:hover:bg-[#252e40] transition-colors"
              title="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2a3346] bg-[#fbfbfa] dark:bg-[#191f2c] text-[#555d6e] dark:text-[#a0abbd] hover:bg-[#eae7df] dark:hover:bg-[#252e40] transition-colors"
              title="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-[#d5d2c8] dark:scrollbar-thumb-[#2f394d]"
      >
        <div className="flex gap-4 min-w-max">
          {items.map((item) => {
            const isDimmed = activeFilter && item.type !== activeFilter;

            return (
              <div
                key={item.id}
                id={`step-${item.stepNumber}`}
                className={`flex flex-col w-[300px] shrink-0 transition-opacity duration-200 group/card ${
                  isDimmed ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* Marker Step Number & Delete affordance */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#202735] dark:bg-[#2e394e] text-white text-[12px] font-bold font-mono shadow-xs">
                      {item.stepNumber}
                    </div>
                    <div className="h-[2px] flex-1 bg-[#dedbd3] dark:bg-[#283244]" />
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="opacity-0 group-hover/card:opacity-100 p-1 text-[#8c94a4] hover:text-rose-600 transition-opacity ml-1.5"
                      title="Excluir este passo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card */}
                <div className="flex flex-col flex-1 p-4 rounded-2xl bg-white dark:bg-[#181d27] border border-[#e2ded6] dark:border-[#273042] shadow-xs hover:border-[#cbc6ba] dark:hover:border-[#38455e] transition-all">
                  {/* Article citation */}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateItem(item.id, { article: e.currentTarget.textContent || item.article })}
                    className="text-[11px] font-semibold text-[#876735] dark:text-[#d4aa5d] tracking-wide block mb-1 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1"
                  >
                    {item.article}
                  </span>

                  {/* Title */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateItem(item.id, { title: e.currentTarget.textContent || item.title })}
                    className="font-serif text-[16px] font-bold text-[#141821] dark:text-[#f1f4f9] leading-snug mb-1.5 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
                  >
                    {item.title}
                  </div>

                  {/* Detail */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateItem(item.id, { detail: e.currentTarget.textContent || item.detail })}
                    className="text-[12px] text-[#4f5666] dark:text-[#9ea8bc] leading-relaxed mb-4 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
                  >
                    {item.detail}
                  </div>

                  {/* Notes box */}
                  <div className="mt-auto pt-3 border-t border-[#f0eee9] dark:border-[#222938]">
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-[#7a8394] dark:text-[#8893a7] uppercase mb-1.5">
                      <span>ANOTAÇÕES DA AULA</span>
                      <Plus className="w-3 h-3 text-[#99a2b3]" />
                    </div>

                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateItem(item.id, { notes: e.currentTarget.textContent || '' })}
                      data-placeholder="Clique para adicionar os detalhes explicados pelo professor..."
                      className={`text-[12px] leading-relaxed p-2.5 rounded-xl bg-[#fbfaf8] dark:bg-[#131720] border border-[#ece8de] dark:border-[#222938] focus:outline-hidden focus:border-[#2d3b53] dark:focus:border-[#60a5fa] cursor-text min-h-[46px] ${
                        !item.notes
                          ? 'text-[#9fa6b5] dark:text-[#5e677c] italic'
                          : 'text-[#2a303d] dark:text-[#c7d0e0]'
                      }`}
                    >
                      {item.notes || 'Clique para adicionar os detalhes explicados pelo professor...'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 rounded-2xl bg-[#f5f2ea] dark:bg-[#1b2230] border border-[#e4dfd3] dark:border-[#273246] flex flex-col gap-1.5 shadow-2xs"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#7c633a] dark:text-[#e0b76e] uppercase">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{alert.title}</span>
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateAlert(alert.id, e.currentTarget.textContent || alert.text)}
              className="text-[12px] text-[#4d5463] dark:text-[#a0abbd] leading-relaxed focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {alert.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
