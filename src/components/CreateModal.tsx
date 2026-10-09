import React, { useState } from 'react';
import { X, FolderPlus, FilePlus, Sparkles, Palette } from 'lucide-react';
import { Discipline } from '../types/notebook';

interface CreateModalProps {
  isOpen: boolean;
  mode: 'discipline' | 'topic';
  disciplines: Discipline[];
  activeDisciplineId: string;
  onClose: () => void;
  onCreateDiscipline: (name: string, colorClass: string) => void;
  onCreateTopic: (disciplineId: string, title: string, subtitle: string, lessonMeta: string) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  mode,
  disciplines,
  activeDisciplineId,
  onClose,
  onCreateDiscipline,
  onCreateTopic,
}) => {
  // Discipline form state
  const [disciplineName, setDisciplineName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-[#284b63] dark:bg-[#60a5fa]');

  // Topic form state
  const [selectedDisciplineId, setSelectedDisciplineId] = useState(activeDisciplineId || disciplines[0]?.id || '');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSubtitle, setTopicSubtitle] = useState('');
  const [lessonMeta, setLessonMeta] = useState('AULA 01');

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Azul Marinho / Navy', class: 'bg-[#284b63] dark:bg-[#60a5fa]' },
    { label: 'Terracota / Clay', class: 'bg-[#b85a3a] dark:bg-[#fb923c]' },
    { label: 'Verde Sálvia / Sage', class: 'bg-[#407052] dark:bg-[#4ade80]' },
    { label: 'Bordô / Vinho', class: 'bg-[#882436] dark:bg-[#f43f5e]' },
    { label: 'Púrpura Imperial', class: 'bg-[#5b328a] dark:bg-[#c084fc]' },
    { label: 'Âmbar Dourado', class: 'bg-[#b47a18] dark:bg-[#facc15]' },
  ];

  const handleSubmitDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineName.trim()) return;
    onCreateDiscipline(disciplineName.trim(), selectedColor);
    setDisciplineName('');
    onClose();
  };

  const handleSubmitTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;
    onCreateTopic(
      selectedDisciplineId || activeDisciplineId,
      topicTitle.trim(),
      topicSubtitle.trim() || 'Esqueleto de revisão e fluxograma da matéria',
      lessonMeta.trim() || 'AULA 01'
    );
    setTopicTitle('');
    setTopicSubtitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#181e2b] rounded-2xl border border-[#dedbd3] dark:border-[#2b3548] shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7c8699] dark:text-[#9ea8bd] hover:bg-[#edebe6] dark:hover:bg-[#252f42] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'discipline' ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#202735] text-white">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141822] dark:text-[#f8fafc]">
                  Nova Disciplina
                </h3>
                <p className="text-[12px] text-[#6b7385] dark:text-[#9ea8bd]">
                  Adicione uma nova cadeira à sua grade curricular.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitDiscipline} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1.5">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Direito Civil, Direito Administrativo..."
                  value={disciplineName}
                  onChange={(e) => setDisciplineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[16px] sm:text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88] dark:focus:border-[#60a5fa]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-2">
                  Cor de Identificação
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(opt.class)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                        selectedColor === opt.class
                          ? 'border-[#222a38] dark:border-white bg-[#ece9e2] dark:bg-[#222b3b] font-semibold text-[#111622] dark:text-white shadow-2xs'
                          : 'border-[#dedbd3] dark:border-[#293347] text-[#555d6e] dark:text-[#9faabf] hover:bg-[#f6f5f0]'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${opt.class} shrink-0`} />
                      <span>{opt.label.split(' / ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#dedbd3] dark:border-[#2a3449] text-[13px] font-medium text-[#555d6e] dark:text-[#9ea8bc] hover:bg-black/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#202735] dark:bg-[#324056] hover:bg-[#141924] dark:hover:bg-[#435471] text-white text-[13px] font-semibold transition-colors"
                >
                  Criar Disciplina
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#202735] text-white">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141822] dark:text-[#f8fafc]">
                  Nova Matéria / Caderno
                </h3>
                <p className="text-[12px] text-[#6b7385] dark:text-[#9ea8bd]">
                  Crie um novo tópico de aula com fluxograma e linha do tempo.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitTopic} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  Pertence à Disciplina
                </label>
                <select
                  value={selectedDisciplineId}
                  onChange={(e) => setSelectedDisciplineId(e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                >
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  Título da Matéria / Assunto
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Teoria da Prova, Audiência de Custódia..."
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-[16px] sm:text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                    Código da Aula
                  </label>
                  <input
                    type="text"
                    value={lessonMeta}
                    onChange={(e) => setLessonMeta(e.target.value)}
                    placeholder="Ex: AULA 05"
                    className="w-full px-3.5 py-2 text-[16px] sm:text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                    Subtítulo / Foco
                  </label>
                  <input
                    type="text"
                    value={topicSubtitle}
                    onChange={(e) => setTopicSubtitle(e.target.value)}
                    placeholder="Ex: Rito comum ordinário"
                    className="w-full px-3.5 py-2 text-[16px] sm:text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center gap-2 text-[11px] text-blue-900 dark:text-blue-200">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  Você poderá usar o Google Gemini para gerar a linha do tempo e fluxograma desta nova matéria em segundos!
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#dedbd3] dark:border-[#2a3449] text-[13px] font-medium text-[#555d6e] dark:text-[#9ea8bc] hover:bg-black/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#202735] dark:bg-[#324056] hover:bg-[#141924] dark:hover:bg-[#435471] text-white text-[13px] font-semibold transition-colors"
                >
                  Criar Matéria
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
