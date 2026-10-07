import React from 'react';
import { X, Plus, ChevronRight, Check } from 'lucide-react';
import { Discipline } from '../types/notebook';

interface MobileDisciplinesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  disciplines: Discipline[];
  activeDisciplineId: string;
  activeTopicId: string;
  onSelectTopic: (disciplineId: string, topicId: string) => void;
  onOpenCreateModal: (mode: 'discipline' | 'topic') => void;
}

export const MobileDisciplinesSheet: React.FC<MobileDisciplinesSheetProps> = ({
  isOpen,
  onClose,
  disciplines,
  activeDisciplineId,
  activeTopicId,
  onSelectTopic,
  onOpenCreateModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-h-[85vh] bg-[#fbfbfa] dark:bg-[#151922] rounded-t-3xl border-t border-[#e2ded6] dark:border-[#273042] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[#d0cdc4] dark:bg-[#343e52] mx-auto cursor-pointer" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#eeebe3] dark:border-[#232b3c]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#141924] dark:text-[#f8fafc]">
              Minhas Disciplinas
            </h3>
            <p className="text-[11px] text-[#6e7788] dark:text-[#9ea8bc]">
              Selecione uma matéria para estudar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateModal('discipline');
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202735] dark:bg-[#2b3548] text-white text-[11px] font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7c8699] dark:text-[#9ea8bd] hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheet Content: Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
          {disciplines.map((d) => {
            const isDisciplineActive = activeDisciplineId === d.id;

            return (
              <div 
                key={d.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1a202d] border border-[#e5e1d7] dark:border-[#263044] shadow-xs space-y-2.5"
              >
                {/* Discipline Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${d.dotColor} shrink-0`} />
                    <span className="font-serif text-[15px] font-bold text-[#151922] dark:text-white">
                      {d.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6f7889] dark:text-[#8d97a9] font-medium">
                    {d.topics.length} {d.topics.length === 1 ? 'matéria' : 'matérias'}
                  </span>
                </div>

                {/* Topics in this discipline */}
                <div className="space-y-1 pt-1">
                  {d.topics.map((t) => {
                    const isTopicActive = activeTopicId === t.id;

                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTopic(d.id, t.id);
                          onClose();
                        }}
                        className={`flex items-center justify-between w-full p-2.5 rounded-xl text-left transition-colors ${
                          isTopicActive
                            ? 'bg-[#202735] text-white font-semibold shadow-xs'
                            : 'bg-[#f8f7f4] dark:bg-[#141822] text-[#333b4b] dark:text-[#c4cbda] hover:bg-[#edeae4]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-[13px] truncate leading-tight">
                            {t.title}
                          </p>
                          <p className={`text-[10px] truncate mt-0.5 ${
                            isTopicActive ? 'text-white/70' : 'text-[#737c8e] dark:text-[#8894a8]'
                          }`}>
                            {t.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isTopicActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-[#646e80] dark:text-[#9faabf]'
                          }`}>
                            {t.lessonMeta}
                          </span>
                          {isTopicActive ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#969fad]" />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateModal('topic');
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-dashed border-[#dedbd3] dark:border-[#2b3548] text-[11px] font-medium text-[#656d7e] dark:text-[#9ea8bc] hover:bg-black/5 transition-colors mt-2"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar matéria em {d.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
