import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe } from 'lucide-react';
import { NotebookDocument } from '../types/notebook';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NotebookDocument;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, document }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#181e2b] rounded-2xl border border-[#dedbd3] dark:border-[#2b3548] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#ece9e1] dark:border-[#252e40]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#2b5b88] dark:text-[#60a5fa]" />
            <h3 className="font-serif text-xl font-bold text-[#141822] dark:text-[#f8fafc]">
              Compartilhar Caderno
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#798192] hover:text-[#181d28] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card preview */}
        <div className="p-4 rounded-xl bg-[#f8f6f0] dark:bg-[#141924] border border-[#e5e1d7] dark:border-[#263145] space-y-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#737b8c] dark:text-[#8894a8]">
            {document.lessonMeta} • {document.disciplineName}
          </span>
          <p className="font-serif text-[16px] font-bold text-[#131822] dark:text-[#f3f6fc]">
            {document.title}
          </p>
          <p className="text-[12px] text-[#555d6e] dark:text-[#9ea8bc] line-clamp-2">
            {document.subtitle}
          </p>
        </div>

        {/* Link copy field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#798192] dark:text-[#8b95a8] block">
            Link público
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-[12px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#333a4a] dark:text-[#c4cbda] focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#202735] dark:bg-[#2e3a4e] text-white text-[12px] font-semibold hover:bg-[#131822] transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#71798a] dark:text-[#8d97aa] text-center">
          Qualquer colega com o link poderá visualizar esta aula e seus fluxogramas.
        </p>
      </div>
    </div>
  );
};
