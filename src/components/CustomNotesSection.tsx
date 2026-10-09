import React from 'react';
import { NoteBlock } from '../types/notebook';
import { Plus, Trash2, StickyNote } from 'lucide-react';

interface CustomNotesSectionProps {
  notes: NoteBlock[];
  onAddNote: () => void;
  onRemoveNote: (id: string) => void;
  onUpdateNote: (id: string, updates: Partial<NoteBlock>) => void;
}

export const CustomNotesSection: React.FC<CustomNotesSectionProps> = ({
  notes,
  onAddNote,
  onRemoveNote,
  onUpdateNote,
}) => {
  return (
    <section className="space-y-4 pt-6 border-t border-[#e5e2da] dark:border-[#262d3e]">
      {/* Heading */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#727a8c] dark:text-[#8e98ac] uppercase block mb-1">
            ANOTAÇÕES COMPLEMENTARES
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1f2b] dark:text-[#f8fafc]">
            Blocos livres da aula
          </h3>
        </div>
        <span className="text-[12px] font-medium text-[#656c7d] dark:text-[#919bb1] bg-[#f0eee9] dark:bg-[#1f2635] px-2.5 py-1 rounded-full border border-[#dedbd3] dark:border-[#2b3548]">
          {notes.length} {notes.length === 1 ? 'bloco' : 'blocos'}
        </span>
      </div>

      {/* Grid of note cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex flex-col p-5 rounded-2xl bg-white dark:bg-[#181d27] border border-[#e2ded6] dark:border-[#273042] shadow-xs hover:border-[#cbc6ba] dark:hover:border-[#38455e] transition-all group"
          >
            {/* Note Card Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0eee9] dark:border-[#232a3a]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#303847] dark:text-[#9aa4b8] px-1.5 py-0.5 rounded bg-[#f3f0e8] dark:bg-[#202735]">
                  {note.number}
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#798192] dark:text-[#8590a3] uppercase">
                  BLOCO DE ANOTAÇÕES
                </span>
              </div>
              <button
                onClick={() => onRemoveNote(note.id)}
                className="opacity-0 group-hover:opacity-100 text-[#969fad] hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-opacity"
                title="Excluir este bloco"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editable Title */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateNote(note.id, { title: e.currentTarget.textContent || note.title })}
              className="font-serif text-[16px] font-bold text-[#141822] dark:text-[#f3f5fa] mb-2 leading-snug focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {note.title}
            </div>

            {/* Editable Body */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateNote(note.id, { body: e.currentTarget.textContent || note.body })}
              className="text-[16px] sm:text-[13px] text-[#4d5464] dark:text-[#9ea8bc] leading-relaxed flex-1 focus:outline-hidden hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 cursor-text"
            >
              {note.body}
            </div>
          </div>
        ))}
      </div>

      {/* Add note button */}
      <button
        onClick={onAddNote}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed border-[#dedbd3] dark:border-[#2c364b] hover:border-[#a8a397] dark:hover:border-[#4d5b78] bg-[#fbfbfa]/50 dark:bg-[#151922]/50 text-[#545b6b] dark:text-[#9ba6ba] hover:text-[#181d27] dark:hover:text-white text-[13px] font-medium transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2]" />
        <span>Adicionar bloco de anotação</span>
      </button>
    </section>
  );
};
