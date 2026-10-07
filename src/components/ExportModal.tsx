import React, { useState } from 'react';
import { X, Printer, FileText, Download, Copy, Check } from 'lucide-react';
import { NotebookDocument } from '../types/notebook';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookDoc: NotebookDocument;
  onImportBackup: (importedDoc: NotebookDocument) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  notebookDoc,
  onImportBackup,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdown = () => {
    let md = `# ${notebookDoc.title}\n`;
    md += `**${notebookDoc.lessonMeta} • ${notebookDoc.courseMeta}**\n`;
    md += `*${notebookDoc.subtitle}*\n\n`;

    md += `## ${notebookDoc.timelineHeading.title}\n\n`;
    notebookDoc.timelineItems.forEach((item) => {
      md += `### ${item.stepNumber}. ${item.title} (${item.article})\n`;
      md += `${item.detail}\n`;
      if (item.notes) {
        md += `> **Anotação de aula:** ${item.notes}\n`;
      }
      md += `\n`;
    });

    md += `## Fluxograma do Procedimento\n\n`;
    md += `1. **${notebookDoc.flow.card1.title}**: ${notebookDoc.flow.card1.body}\n`;
    md += `2. **${notebookDoc.flow.card2.title}**\n`;
    notebookDoc.flow.card2.branches.forEach((b) => {
      md += `   - [${b.letter}] ${b.title}: ${b.note}\n`;
    });
    md += `3. **${notebookDoc.flow.card3.title}** (${notebookDoc.flow.card3.legalNote})\n`;
    notebookDoc.flow.card3.items.forEach((item) => {
      md += `   - ${item}\n`;
    });
    md += `4. **${notebookDoc.flow.card4.title}**\n`;
    notebookDoc.flow.card4.noteLines.forEach((l) => {
      md += `   - ${l}\n`;
    });
    md += `5. **${notebookDoc.flow.card5.title}**\n`;
    notebookDoc.flow.card5.deadlines.forEach((dl) => {
      md += `   - ${dl.label}: ${dl.text}\n`;
    });

    if (notebookDoc.customNotes.length > 0) {
      md += `\n## Anotações Complementares da Aula\n\n`;
      notebookDoc.customNotes.forEach((n) => {
        md += `### ${n.number}. ${n.title}\n${n.body}\n\n`;
      });
    }

    return md;
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notebookDoc, null, 2));
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${notebookDoc.title.toLowerCase().replace(/\s+/g, '-')}-backup.json`);
    window.document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.timelineItems && json.flow) {
          onImportBackup(json);
          onClose();
        }
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#181e2b] rounded-2xl border border-[#dedbd3] dark:border-[#2b3548] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#ece9e1] dark:border-[#252e40]">
          <h3 className="font-serif text-xl font-bold text-[#141822] dark:text-[#f8fafc]">
            Exportar Material de Estudo
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#798192] hover:text-[#181d28] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-3.5 w-full p-3.5 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] hover:bg-[#f6f4ee] dark:hover:bg-[#1e2535] text-left transition-colors group"
          >
            <div className="p-2 rounded-lg bg-[#ede8dc] dark:bg-[#252f44] text-[#30384a] dark:text-[#93c5fd]">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#151922] dark:text-[#f8fafc]">
                Imprimir ou Salvar em PDF
              </p>
              <p className="text-[11px] text-[#6b7385] dark:text-[#9ea8bd]">
                Layout pronto para impressão e fichamento físico
              </p>
            </div>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-3.5 w-full p-3.5 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] hover:bg-[#f6f4ee] dark:hover:bg-[#1e2535] text-left transition-colors group"
          >
            <div className="p-2 rounded-lg bg-[#ede8dc] dark:bg-[#252f44] text-[#30384a] dark:text-[#93c5fd]">
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#151922] dark:text-[#f8fafc]">
                {copied ? 'Copiado para a área de transferência!' : 'Copiar Resumo em Markdown'}
              </p>
              <p className="text-[11px] text-[#6b7385] dark:text-[#9ea8bd]">
                Ideal para colar no Notion, Obsidian ou Anki
              </p>
            </div>
          </button>

          {/* Download JSON Backup */}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-3.5 w-full p-3.5 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] hover:bg-[#f6f4ee] dark:hover:bg-[#1e2535] text-left transition-colors group"
          >
            <div className="p-2 rounded-lg bg-[#ede8dc] dark:bg-[#252f44] text-[#30384a] dark:text-[#93c5fd]">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#151922] dark:text-[#f8fafc]">
                Exportar Backup JSON
              </p>
              <p className="text-[11px] text-[#6b7385] dark:text-[#9ea8bd]">
                Guarde todas as alterações e anotações em arquivo local
              </p>
            </div>
          </button>
        </div>

        {/* Restore Backup input */}
        <div className="pt-2 border-t border-[#ece9e1] dark:border-[#252e40]">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#798192] dark:text-[#8b95a8] block mb-1">
            Restaurar de arquivo JSON
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-[12px] text-[#555d6e] dark:text-[#9ea8bd] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-[#dedbd3] dark:file:bg-[#273246] file:text-[#181d28] dark:file:text-white hover:file:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
