import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  RotateCcw,
  Trash2,
  Edit2,
  BookOpen
} from 'lucide-react';
import { Flashcard, CardMastery, NotebookDocument } from '../types/notebook';
import { generateDefaultFlashcards } from '../utils/flashcardsGenerator';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NotebookDocument;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(`caderno_juridico_flashcards_${document.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateDefaultFlashcards(document);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newArticle, setNewArticle] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`caderno_juridico_flashcards_${document.id}`, JSON.stringify(cards));
  }, [cards, document.id]);

  // When switching document, regenerate default cards if none exist
  useEffect(() => {
    const saved = localStorage.getItem(`caderno_juridico_flashcards_${document.id}`);
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch {
        setCards(generateDefaultFlashcards(document));
      }
    } else {
      setCards(generateDefaultFlashcards(document));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
  }, [document.id]);

  // Keyboard navigation: Space (Flip), Left/Right (prev/next), 1/2/3 (rating)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === '1' && isFlipped) {
        e.preventDefault();
        handleSetMastery('hard');
      } else if (e.key === '2' && isFlipped) {
        e.preventDefault();
        handleSetMastery('good');
      } else if (e.key === '3' && isFlipped) {
        e.preventDefault();
        handleSetMastery('easy');
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipped, currentIndex, cards.length]);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex] || cards[0];

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((i) => i - 1);
      setShowSummary(false);
    }
  };

  const handleSetMastery = (level: CardMastery) => {
    if (!currentCard) return;
    setCards((prev) =>
      prev.map((c, idx) => (idx === currentIndex ? { ...c, mastery: level } : c))
    );
    handleNextCard();
  };

  const handleResetDeck = () => {
    setCards((prev) => prev.map((c) => ({ ...c, mastery: 'unreviewed' })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
  };

  const handleReviewHardOnly = () => {
    const hardCards = cards.filter((c) => c.mastery === 'hard' || c.mastery === 'unreviewed');
    if (hardCards.length > 0) {
      setCards(hardCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowSummary(false);
    } else {
      handleResetDeck();
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-manual-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      article: newArticle.trim() || undefined,
      category: newCategory.trim() || 'Geral',
      mastery: 'unreviewed',
    };

    setCards((prev) => [...prev, newCard]);
    setNewFront('');
    setNewBack('');
    setNewArticle('');
    setIsAddingCard(false);
    setCurrentIndex(cards.length);
    setIsFlipped(false);
  };

  const handleDeleteCurrentCard = () => {
    if (cards.length <= 1) return;
    setCards((prev) => prev.filter((_, idx) => idx !== currentIndex));
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
    setIsFlipped(false);
  };

  const handleGenerateCardsAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Gere 4 flashcards de alto nível para fixação sobre a aula: ${document.title} (${document.disciplineName}). 
Estruture cada cartão exatamente neste formato:
Pergunta: [Pergunta ou Caso]
Resposta: [Resposta fundamentada com artigo de lei]
Artigo: [Artigo CPP/CP/CF correspondente]
---`,
          currentTitle: document.title,
          discipline: document.disciplineName,
        }),
      });

      const data = await res.json();
      if (data.text) {
        // Parse simple text into flashcards
        const blocks = data.text.split('---').filter((b: string) => b.includes('Pergunta:'));
        const newCards: Flashcard[] = [];

        blocks.forEach((block: string, i: number) => {
          const frontMatch = block.match(/Pergunta:\s*([^\n]+)/i);
          const backMatch = block.match(/Resposta:\s*([\s\S]+?)(?=Artigo:|$)/i);
          const artMatch = block.match(/Artigo:\s*([^\n]+)/i);

          if (frontMatch && backMatch) {
            newCards.push({
              id: `fc-gemini-${Date.now()}-${i}`,
              front: frontMatch[1].trim(),
              back: backMatch[1].trim(),
              article: artMatch ? artMatch[1].trim() : document.disciplineName,
              category: 'Gemini IA',
              mastery: 'unreviewed',
            });
          }
        });

        if (newCards.length > 0) {
          setCards((prev) => [...prev, ...newCards]);
        }
      }
    } catch (err) {
      console.error('Error generating cards with AI:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Stats
  const total = cards.length;
  const masteredCount = cards.filter((c) => c.mastery === 'easy').length;
  const goodCount = cards.filter((c) => c.mastery === 'good').length;
  const hardCount = cards.filter((c) => c.mastery === 'hard').length;
  const reviewedCount = cards.filter((c) => c.mastery !== 'unreviewed').length;
  const progressPercent = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#fbfbfa] dark:bg-[#151922] rounded-3xl border border-[#dedbd3] dark:border-[#283244] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ece8df] dark:border-[#222938] bg-white/70 dark:bg-[#1a202d]/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#284b63] dark:bg-[#3b82f6] text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#141924] dark:text-[#f8fafc]">
                  Flashcards de Estudo
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#eeeae1] dark:bg-[#252f42] text-[#4d5669] dark:text-[#9ea8bd]">
                  {document.disciplineName}
                </span>
              </div>
              <p className="text-[11px] text-[#6e7687] dark:text-[#8e98ac] truncate max-w-sm">
                {document.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateCardsAI}
              disabled={isGeneratingAI}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
              title="Gerar novos cartões automaticamente com Gemini"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAI ? 'Gerando...' : '+ IA Flashcards'}</span>
            </button>

            <button
              onClick={() => setIsAddingCard(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2b3548] bg-white dark:bg-[#1c2331] text-[#3e4657] dark:text-[#c4cbda] hover:bg-[#f6f5f0] text-[11px] font-medium transition-colors"
              title="Criar novo flashcard manual"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Criar Cartão</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7c8699] dark:text-[#9ea8bd] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="px-6 py-2.5 bg-[#f4f2eb]/80 dark:bg-[#131720]/80 border-b border-[#ece8df] dark:border-[#222938] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3 text-[#525a6b] dark:text-[#9ea8bc] font-medium">
            <span>
              Cartão <strong className="text-[#151922] dark:text-white">{currentIndex + 1}</strong> de {total}
            </span>
            <span aria-hidden="true">·</span>
            <span>{progressPercent}% revisado</span>
          </div>

          {/* Mastery indicators */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {masteredCount} fácil
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {goodCount} bom
            </span>
            <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {hardCount} difícil
            </span>
          </div>
        </div>

        {/* Linear progress fill line */}
        <div className="w-full h-1 bg-[#e7e4dc] dark:bg-[#202736]">
          <div
            className="h-full bg-gradient-to-r from-[#284b63] to-[#3b82f6] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Body */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-y-auto">
          {showSummary ? (
            /* Summary Screen at the end of the deck */
            <div className="w-full max-w-lg p-8 rounded-3xl bg-white dark:bg-[#19202c] border border-[#e2ded6] dark:border-[#273042] text-center space-y-6 shadow-md animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-[#141924] dark:text-[#f8fafc]">
                  Revisão Concluída!
                </h4>
                <p className="text-[13px] text-[#697283] dark:text-[#9ea8bc] mt-1">
                  Você revisou todos os {total} cartões do caderno de {document.title}.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#f9f8f5] dark:bg-[#141822] border border-[#ece8de] dark:border-[#222938]">
                <div>
                  <p className="text-[11px] text-[#717a8c] dark:text-[#8894a8]">Fáceis</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {masteredCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#717a8c] dark:text-[#8894a8]">Bons</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {goodCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#717a8c] dark:text-[#8894a8]">Difíceis</p>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {hardCount}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleReviewHardOnly}
                  className="flex-1 w-full py-3 rounded-xl border border-[#dedbd3] dark:border-[#2c364b] hover:bg-[#edebe6] dark:hover:bg-[#202738] text-[13px] font-semibold text-[#2f3647] dark:text-[#cbd5e1] transition-colors"
                >
                  Revisar Cartões Difíceis ({hardCount})
                </button>
                <button
                  onClick={handleResetDeck}
                  className="flex-1 w-full py-3 rounded-xl bg-[#202735] dark:bg-[#344259] hover:bg-[#131720] text-[13px] font-semibold text-white transition-colors"
                >
                  Reiniciar Baralho Todo
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Flip Card */
            <div className="w-full max-w-lg perspective-1000 flex flex-col items-center">
              {/* Card Container with 3D Flip */}
              <div
                onClick={() => setIsFlipped((f) => !f)}
                className={`relative w-full min-h-[300px] sm:min-h-[330px] rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform select-none shadow-md border hover:border-[#3b5998] dark:hover:border-[#60a5fa] flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-gradient-to-br from-white to-[#f4f7fb] dark:from-[#192230] dark:to-[#141b27] border-[#cfe0f4] dark:border-[#2f4260]'
                    : 'bg-white dark:bg-[#181e2b] border-[#e2ded6] dark:border-[#283245]'
                }`}
              >
                {/* Card Top badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#edeae3] dark:bg-[#242c3d] text-[#4f5768] dark:text-[#a0abbd]">
                      {currentCard?.category || 'Geral'}
                    </span>
                    {currentCard?.article && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#f6ecd9] dark:bg-[#312a1d] text-[#8c672b] dark:text-[#e4be79]">
                        {currentCard.article}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8a92a2]">
                      {isFlipped ? 'VERSO (RESPOSTA)' : 'FRENTE (QUESTÃO)'}
                    </span>
                    <RotateCw className="w-3.5 h-3.5 text-[#8a92a2]" />
                  </div>
                </div>

                {/* Question / Answer Content */}
                <div className="my-auto py-6 text-center">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#141924] dark:text-[#f8fafc] leading-snug">
                        {currentCard?.front}
                      </p>
                      <p className="text-[11px] text-[#868f9f] italic">
                        (Toque no cartão ou aperte Espaço para ver a resposta)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-left">
                      <p className="text-[14px] sm:text-[15px] text-[#222938] dark:text-[#e2e8f0] leading-relaxed whitespace-pre-wrap font-sans">
                        {currentCard?.back}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Bottom: delete / keyboard helper */}
                <div className="flex items-center justify-between text-[11px] text-[#8a92a2] pt-2 border-t border-[#f0eee9] dark:border-[#222a3a]">
                  <span>Atalho: <kbd className="font-mono px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">Espaço</kbd></span>
                  {cards.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCurrentCard();
                      }}
                      className="text-[#9ea7b7] hover:text-rose-600 transition-colors p-1"
                      title="Excluir este cartão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Rating Buttons (shown when flipped) */}
              <div className="w-full mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="p-2.5 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] text-[#555d6e] dark:text-[#9ea8bc] hover:bg-[#edebe6] dark:hover:bg-[#1f2635] disabled:opacity-30 transition-colors"
                  title="Cartão anterior (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {isFlipped ? (
                  <div className="flex-1 flex items-center gap-2">
                    <button
                      onClick={() => handleSetMastery('hard')}
                      className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[12px] font-semibold transition-colors text-center"
                      title="Atalho: Tecla 1"
                    >
                      🔴 Errei [1]
                    </button>
                    <button
                      onClick={() => handleSetMastery('good')}
                      className="flex-1 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[12px] font-semibold transition-colors text-center"
                      title="Atalho: Tecla 2"
                    >
                      🟡 Dúvida [2]
                    </button>
                    <button
                      onClick={() => handleSetMastery('easy')}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[12px] font-semibold transition-colors text-center"
                      title="Atalho: Tecla 3"
                    >
                      🟢 Dominei [3]
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="flex-1 py-2.5 rounded-xl bg-[#202735] dark:bg-[#2c374c] hover:bg-[#141924] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Virar Cartão</span>
                  </button>
                )}

                <button
                  onClick={handleNextCard}
                  className="p-2.5 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] text-[#555d6e] dark:text-[#9ea8bc] hover:bg-[#edebe6] dark:hover:bg-[#1f2635] transition-colors"
                  title="Próximo cartão (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Create new custom card */}
        {isAddingCard && (
          <div className="absolute inset-0 z-20 bg-white/95 dark:bg-[#151922]/95 backdrop-blur-md p-6 flex flex-col justify-center animate-in fade-in duration-150">
            <div className="max-w-md w-full mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#ece8df] dark:border-[#252e40]">
                <h4 className="font-serif text-xl font-bold text-[#141924] dark:text-[#f8fafc]">
                  Novo Flashcard
                </h4>
                <button
                  onClick={() => setIsAddingCard(false)}
                  className="p-1 rounded-md text-[#788192] hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewCard} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                    Frente (Pergunta ou Hipótese)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Ex: Qual o prazo da denúncia quando o réu estiver solto?"
                    className="w-full px-3 py-2 text-[16px] sm:text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                    Verso (Resposta & Fundamento)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Ex: 15 dias, prorrogáveis a critério judicial (CPP, art. 46)."
                    className="w-full px-3 py-2 text-[16px] sm:text-[13px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                      Artigo / Legislação
                    </label>
                    <input
                      type="text"
                      value={newArticle}
                      onChange={(e) => setNewArticle(e.target.value)}
                      placeholder="Ex: CPP, art. 46"
                      className="w-full px-3 py-1.5 text-[16px] sm:text-[12px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Ex: Prazos, Conceito"
                      className="w-full px-3 py-1.5 text-[16px] sm:text-[12px] rounded-xl bg-[#f8f7f4] dark:bg-[#121620] border border-[#dedbd3] dark:border-[#293347] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#385b88]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="flex-1 py-2 rounded-xl border border-[#dedbd3] dark:border-[#2a3449] text-[12px] font-medium text-[#555d6e] dark:text-[#9ea8bc]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#202735] dark:bg-[#324056] text-white text-[12px] font-semibold"
                  >
                    Adicionar Cartão
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
