import React, { useState } from 'react';
import { LegendType } from '../types/notebook';
import { Edit3 } from 'lucide-react';

interface DocumentHeaderProps {
  lessonMeta: string;
  courseMeta: string;
  title: string;
  subtitle: string;
  activeFilter: LegendType | null;
  onToggleFilter: (type: LegendType) => void;
  onUpdateTitle: (title: string) => void;
  onUpdateSubtitle: (subtitle: string) => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  lessonMeta,
  courseMeta,
  title,
  subtitle,
  activeFilter,
  onToggleFilter,
  onUpdateTitle,
  onUpdateSubtitle,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempSubtitle, setTempSubtitle] = useState(subtitle);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== title) {
      onUpdateTitle(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
  };

  const handleSubtitleBlur = () => {
    setIsEditingSubtitle(false);
    if (tempSubtitle !== subtitle) {
      onUpdateSubtitle(tempSubtitle.trim());
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e5e2da] dark:border-[#272e3e]">
      {/* Title & Metadata */}
      <div className="space-y-2 max-w-3xl">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#666f81] dark:text-[#8e98ac] uppercase">
          <span>{lessonMeta}</span>
          <span className="w-1 h-1 rounded-full bg-[#9da4b3] dark:bg-[#525b6e]" />
          <span>{courseMeta}</span>
        </div>

        {/* Editable Document Title */}
        <div className="group relative">
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
              className="w-full text-3xl sm:text-4xl font-serif font-bold text-[#151922] dark:text-white bg-transparent border-b-2 border-[#2b3547] dark:border-[#60a5fa] focus:outline-hidden pb-1"
            />
          ) : (
            <h1
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#151922] dark:text-[#f8fafc] cursor-pointer hover:text-[#2d3b53] dark:hover:text-[#93c5fd] transition-colors inline-flex items-center gap-2"
              title="Clique para editar o título"
            >
              <span>{title}</span>
              <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity text-[#757d8e] shrink-0" />
            </h1>
          )}
        </div>

        {/* Editable Subtitle */}
        <div className="group relative">
          {isEditingSubtitle ? (
            <input
              type="text"
              value={tempSubtitle}
              onChange={(e) => setTempSubtitle(e.target.value)}
              onBlur={handleSubtitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleSubtitleBlur()}
              autoFocus
              className="w-full text-[16px] sm:text-[15px] text-[#4d5566] dark:text-[#a0abbd] bg-transparent border-b border-[#2b3547] dark:border-[#60a5fa] focus:outline-hidden py-1"
            />
          ) : (
            <p
              onClick={() => {
                setTempSubtitle(subtitle);
                setIsEditingSubtitle(true);
              }}
              className="text-[14px] sm:text-[15px] text-[#4d5566] dark:text-[#9ea8bc] cursor-pointer hover:text-[#181d27] dark:hover:text-[#e2e8f0] transition-colors inline-flex items-center gap-1.5"
              title="Clique para editar o subtítulo"
            >
              <span>{subtitle}</span>
              <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-[#757d8e] shrink-0" />
            </p>
          )}
        </div>
      </div>

      {/* Legend & Filter Badges */}
      <div className="flex items-center gap-4 text-[12px] text-[#555d6e] dark:text-[#9aa4b8] font-medium bg-[#f0eee9] dark:bg-[#1a202c] px-3.5 py-2 rounded-xl border border-[#e2dfd7] dark:border-[#272f40] self-start md:self-end">
        <button
          onClick={() => onToggleFilter('conceito')}
          className={`flex items-center gap-1.5 transition-opacity hover:opacity-100 ${
            activeFilter && activeFilter !== 'conceito' ? 'opacity-40' : 'opacity-100'
          }`}
          title="Filtrar passos por Conceito"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a6496] dark:bg-[#60a5fa] shrink-0 ring-2 ring-white dark:ring-[#1a202c]" />
          <span>conceito</span>
        </button>

        <button
          onClick={() => onToggleFilter('procedimento')}
          className={`flex items-center gap-1.5 transition-opacity hover:opacity-100 ${
            activeFilter && activeFilter !== 'procedimento' ? 'opacity-40' : 'opacity-100'
          }`}
          title="Filtrar passos por Procedimento"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#467a57] dark:bg-[#4ade80] shrink-0 ring-2 ring-white dark:ring-[#1a202c]" />
          <span>procedimento</span>
        </button>

        <button
          onClick={() => onToggleFilter('atencao')}
          className={`flex items-center gap-1.5 transition-opacity hover:opacity-100 ${
            activeFilter && activeFilter !== 'atencao' ? 'opacity-40' : 'opacity-100'
          }`}
          title="Filtrar passos por Atenção"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#c28424] dark:bg-[#fbbf24] shrink-0 ring-2 ring-white dark:ring-[#1a202c]" />
          <span>atenção</span>
        </button>
      </div>
    </div>
  );
};
