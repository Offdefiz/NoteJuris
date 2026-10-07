import React from 'react';
import { FlowData } from '../types/notebook';
import { MoreHorizontal, AlertCircle, ArrowDown, ArrowRight } from 'lucide-react';

interface FlowchartSectionProps {
  flow: FlowData;
  onUpdateCard1: (updates: Partial<FlowData['card1']>) => void;
  onUpdateCard2: (updates: Partial<FlowData['card2']>) => void;
  onUpdateCard3: (updates: Partial<FlowData['card3']>) => void;
  onUpdateCard4: (updates: Partial<FlowData['card4']>) => void;
  onUpdateCard5: (updates: Partial<FlowData['card5']>) => void;
}

export const FlowchartSection: React.FC<FlowchartSectionProps> = ({
  flow,
  onUpdateCard1,
  onUpdateCard2,
  onUpdateCard3,
  onUpdateCard4,
  onUpdateCard5,
}) => {
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8 space-y-6">
      {/* 01. PONTO DE PARTIDA (Blue tinted card) */}
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#edf3fa] dark:bg-[#192231] border border-[#d3e0f0] dark:border-[#263750] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-bold text-[#2a5b88] dark:text-[#60a5fa] px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30">
              {flow.card1.number}
            </span>
            <span className="text-[11px] font-bold tracking-widest text-[#2a5b88] dark:text-[#60a5fa] uppercase">
              {flow.card1.eyebrow}
            </span>
          </div>
          <button className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <h3
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateCard1({ title: e.currentTarget.textContent || flow.card1.title })}
          className="font-serif text-xl sm:text-2xl font-bold text-[#10243e] dark:text-[#f1f6fd] mb-1.5 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
        >
          {flow.card1.title}
        </h3>

        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateCard1({ body: e.currentTarget.textContent || flow.card1.body })}
          className="text-[13px] text-[#3b516b] dark:text-[#9bb0cb] leading-relaxed mb-4 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
        >
          {flow.card1.body}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#dce6f5] dark:border-[#223249]">
          {flow.card1.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/80 dark:bg-[#121926] text-[#244b70] dark:text-[#93c5fd] border border-[#cbdcf2] dark:border-[#2b3e5c]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Connector 1 */}
      <div className="flex flex-col items-center">
        <div className="w-[2px] h-6 bg-[#cbd2df] dark:bg-[#2c374c]" />
        <ArrowDown className="w-4 h-4 text-[#7c879c] dark:text-[#6b778e] -mt-1" />
      </div>

      {/* 02. INSTAURAÇÃO (Paper white card with 3 branches) */}
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-white dark:bg-[#171c26] border border-[#e2dfd7] dark:border-[#262e3e] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-bold text-[#454d5e] dark:text-[#939cb0] px-1.5 py-0.5 rounded bg-[#f3f0e8] dark:bg-[#202735]">
              {flow.card2.number}
            </span>
            <span className="text-[11px] font-bold tracking-widest text-[#565f72] dark:text-[#9aa4b8] uppercase">
              {flow.card2.eyebrow}
            </span>
          </div>
          <button className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <h3
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateCard2({ title: e.currentTarget.textContent || flow.card2.title })}
          className="font-serif text-xl sm:text-2xl font-bold text-[#141924] dark:text-[#f8fafc] mb-4 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
        >
          {flow.card2.title}
        </h3>

        {/* 3 Branches: A, B, C */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {flow.card2.branches.map((b, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#f8f7f4] dark:bg-[#1f2635] border border-[#e8e5dc] dark:border-[#2b3548]"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#343e52] text-white text-[10px] font-bold font-mono">
                  {b.letter}
                </span>
                <span className="font-serif text-[14px] font-bold text-[#191f2c] dark:text-[#f1f4f9]">
                  {b.title}
                </span>
              </div>
              <p className="text-[11px] text-[#5b6374] dark:text-[#9faabf] leading-relaxed">
                {b.note}
              </p>
            </div>
          ))}
        </div>

        {/* Annotation with '!' */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fef7ec] dark:bg-[#251e12] border border-[#fae2be] dark:border-[#4d391a]">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#d97706] text-white text-[11px] font-bold shrink-0 mt-0.5">
            !
          </div>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateCard2({ annotation: e.currentTarget.textContent || flow.card2.annotation })}
            className="text-[12px] text-[#854d0e] dark:text-[#fde68a] leading-relaxed focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
          >
            {flow.card2.annotation}
          </p>
        </div>
      </div>

      {/* Connector 2: INÍCIO DAS INVESTIGAÇÕES */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-widest text-[#717b8f] dark:text-[#8895ad] uppercase bg-[#ece9e0] dark:bg-[#202735] px-2.5 py-0.5 rounded-full mb-1">
          INÍCIO DAS INVESTIGAÇÕES
        </span>
        <div className="w-[2px] h-6 bg-[#cbd2df] dark:bg-[#2c374c]" />
        <ArrowDown className="w-4 h-4 text-[#7c879c] dark:text-[#6b778e] -mt-1" />
      </div>

      {/* Flow Row: Cards 03 & 04 side by side */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Card 03: CARACTERÍSTICAS (Cream parchment) */}
        <div className="p-6 rounded-2xl bg-[#faf5ea] dark:bg-[#1e1c18] border border-[#e8ddc7] dark:border-[#383327] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-[#8c6b2c] dark:text-[#f6cf7d] px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30">
                  {flow.card3.number}
                </span>
                <span className="text-[11px] font-bold tracking-widest text-[#8c6b2c] dark:text-[#f6cf7d] uppercase">
                  {flow.card3.eyebrow}
                </span>
              </div>
              <button className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateCard3({ title: e.currentTarget.textContent || flow.card3.title })}
              className="font-serif text-xl sm:text-2xl font-bold text-[#2e230e] dark:text-[#fdf4e2] mb-3 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {flow.card3.title}
            </h3>

            {/* Checklist */}
            <div className="space-y-1.5 mb-4">
              {flow.card3.items.map((item, idx) => (
                <div
                  key={idx}
                  contentEditable
                  suppressContentEditableWarning
                  className="text-[13px] text-[#4d4023] dark:text-[#d6c7a7] leading-relaxed focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#ebdfc7] dark:border-[#352f23]">
            <span className="text-[10px] font-bold tracking-wider text-[#917d52] dark:text-[#bda473] uppercase block mb-0.5">
              BASE LEGAL
            </span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateCard3({ legalNote: e.currentTarget.textContent || flow.card3.legalNote })}
              className="font-mono text-[12px] font-semibold text-[#665225] dark:text-[#ebd296] focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {flow.card3.legalNote}
            </span>
          </div>
        </div>

        {/* Card 04: DILIGÊNCIAS (Sage green card) */}
        <div className="p-6 rounded-2xl bg-[#edf4ed] dark:bg-[#16211a] border border-[#d1e3d2] dark:border-[#243a2b] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold text-[#356e42] dark:text-[#6ee7b7] px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30">
                  {flow.card4.number}
                </span>
                <span className="text-[11px] font-bold tracking-widest text-[#356e42] dark:text-[#6ee7b7] uppercase">
                  {flow.card4.eyebrow}
                </span>
              </div>
              <button className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <h3
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateCard4({ title: e.currentTarget.textContent || flow.card4.title })}
              className="font-serif text-xl sm:text-2xl font-bold text-[#142e1b] dark:text-[#ecfdf5] mb-3 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {flow.card4.title}
            </h3>

            {/* Note lines */}
            <div className="space-y-1.5 mb-4">
              {flow.card4.noteLines.map((line, idx) => (
                <div
                  key={idx}
                  contentEditable
                  suppressContentEditableWarning
                  className="text-[13px] text-[#2c4e35] dark:text-[#a7d7b3] leading-relaxed focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-[#1c2c22] border border-[#cbe0cc] dark:border-[#2e4736]">
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateCard4({ promptBox: e.currentTarget.textContent || flow.card4.promptBox })}
              className="text-[12px] font-medium text-[#20492c] dark:text-[#a7f3d0] leading-snug focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text italic"
            >
              {flow.card4.promptBox}
            </p>
          </div>
        </div>
      </div>

      {/* Connector 3: ENCERRAMENTO */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-widest text-[#717b8f] dark:text-[#8895ad] uppercase bg-[#ece9e0] dark:bg-[#202735] px-2.5 py-0.5 rounded-full mb-1">
          ENCERRAMENTO
        </span>
        <div className="w-[2px] h-6 bg-[#cbd2df] dark:bg-[#2c374c]" />
        <ArrowDown className="w-4 h-4 text-[#7c879c] dark:text-[#6b778e] -mt-1" />
      </div>

      {/* 05. CONCLUSÃO (Paper card with deadlines and outcomes) */}
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-white dark:bg-[#171c26] border border-[#e2dfd7] dark:border-[#262e3e] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-bold text-[#454d5e] dark:text-[#939cb0] px-1.5 py-0.5 rounded bg-[#f3f0e8] dark:bg-[#202735]">
              {flow.card5.number}
            </span>
            <span className="text-[11px] font-bold tracking-widest text-[#565f72] dark:text-[#9aa4b8] uppercase">
              {flow.card5.eyebrow}
            </span>
          </div>
          <button className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 mb-4 border-b border-[#eeece6] dark:border-[#262e3d]">
          <div>
            <h3
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateCard5({ title: e.currentTarget.textContent || flow.card5.title })}
              className="font-serif text-xl sm:text-2xl font-bold text-[#141924] dark:text-[#f8fafc] mb-1.5 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {flow.card5.title}
            </h3>
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateCard5({ body: e.currentTarget.textContent || flow.card5.body })}
              className="text-[13px] text-[#555d6e] dark:text-[#9faabf] leading-relaxed focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {flow.card5.body}
            </p>
          </div>

          {/* Deadlines block */}
          <div className="p-3.5 rounded-xl bg-[#f8f6f0] dark:bg-[#1e2533] border border-[#e6e2d8] dark:border-[#2b3548]">
            <span className="text-[10px] font-bold tracking-widest text-[#7f8899] dark:text-[#8894a8] uppercase block mb-1.5">
              PRAZOS — REGRA GERAL
            </span>
            <div className="space-y-1 text-[12px] text-[#2c3342] dark:text-[#d3d9e6]">
              {flow.card5.deadlines.map((dl, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="font-bold text-[#111622] dark:text-white">{dl.label}</span>
                  <span className="text-[#88909e]">·</span>
                  <span>{dl.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outcome row (3 boxes: MP Oferece denúncia, etc.) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {flow.card5.outcomes.map((oc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#f5f4ef] dark:bg-[#1a202c] border border-[#e5e1d7] dark:border-[#283244] text-center"
            >
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ded9cd] dark:bg-[#2b3548] text-[#3c4454] dark:text-[#c4cbda] uppercase mb-1">
                {oc.actor}
              </span>
              <p className="text-[12px] font-semibold text-[#181d28] dark:text-[#edf1f8]">
                {oc.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
