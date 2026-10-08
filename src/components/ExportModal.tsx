import React, { useState } from 'react';
import { X, Printer, FileText, Download, Copy, Check, Database, Server, RefreshCw } from 'lucide-react';
import { NotebookDocument, Discipline } from '../types/notebook';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookDoc: NotebookDocument;
  disciplines: Discipline[];
  onImportBackup: (importedDoc: NotebookDocument) => void;
  onExportFullBackup: () => void;
  onImportFullBackup: (importedData: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  notebookDoc,
  disciplines,
  onImportBackup,
  onExportFullBackup,
  onImportFullBackup,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'full'>('current');

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

  const handleDownloadTopicJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notebookDoc, null, 2));
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${notebookDoc.title.toLowerCase().replace(/\s+/g, '-')}-materia.json`);
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
        if (json.disciplines && json.documents) {
          onImportFullBackup(json);
          onClose();
        } else if (json.timelineItems && json.flow) {
          onImportBackup(json);
          onClose();
        } else {
          alert('Arquivo JSON de backup inválido.');
        }
      } catch {
        alert('Erro ao processar arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181e2b] rounded-2xl border border-[#dedbd3] dark:border-[#2b3548] shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece9e1] dark:border-[#252e40]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#141822] dark:text-[#f8fafc]">
              Exportar e Backup do Caderno
            </h3>
            <p className="text-[11px] text-[#6b7385] dark:text-[#9ea8bd] mt-0.5">
              100% autônomo e independente do Google Cloud
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#798192] hover:text-[#181d28] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Aula Atual vs Backup Completo */}
        <div className="flex p-1 bg-[#edeae4] dark:bg-[#121620] rounded-xl border border-[#dedbd3] dark:border-[#283244]">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
              activeTab === 'current'
                ? 'bg-white dark:bg-[#1f2635] text-[#171b26] dark:text-white shadow-xs'
                : 'text-[#687080] dark:text-[#96a0b2] hover:text-[#181d28]'
            }`}
          >
            Esta Aula ({notebookDoc.title})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('full')}
            className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'full'
                ? 'bg-white dark:bg-[#1f2635] text-[#171b26] dark:text-white shadow-xs'
                : 'text-[#687080] dark:text-[#96a0b2] hover:text-[#181d28]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>Backup de Todo o Caderno</span>
          </button>
        </div>

        {activeTab === 'current' ? (
          <div className="space-y-2.5">
            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-3.5 w-full p-3 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] hover:bg-[#f6f4ee] dark:hover:bg-[#1e2535] text-left transition-colors group"
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
              className="flex items-center gap-3.5 w-full p-3 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] hover:bg-[#f6f4ee] dark:hover:bg-[#1e2535] text-left transition-colors group"
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

            {/* Download Topic JSON */}
            <button
              onClick={handleDownloadTopicJSON}
              className="flex items-center gap-3.5 w-full p-3 rounded-xl border border-[#dedbd3] dark:border-[#2b3548] hover:bg-[#f6f4ee] dark:hover:bg-[#1e2535] text-left transition-colors group"
            >
              <div className="p-2 rounded-lg bg-[#ede8dc] dark:bg-[#252f44] text-[#30384a] dark:text-[#93c5fd]">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[#151922] dark:text-[#f8fafc]">
                  Exportar Matéria Atual (JSON)
                </p>
                <p className="text-[11px] text-[#6b7385] dark:text-[#9ea8bd]">
                  Salva o arquivo individual desta matéria
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-[12px] mb-1">
                <Server className="w-4 h-4" />
                <span>Portabilidade Total & Servidor Próprio</span>
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                Este backup inclui todas as suas {disciplines.length} disciplinas cadastradas, todas as matérias, notas, fluxogramas e flashcards. Você pode importar este arquivo em qualquer servidor, VPS ou navegador a qualquer momento.
              </p>
            </div>

            <button
              onClick={() => {
                onExportFullBackup();
                onClose();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#202735] dark:bg-[#2f394d] hover:bg-[#141924] dark:hover:bg-[#3d4b66] text-white text-[13px] font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo de Backup Completo (.json)</span>
            </button>
          </div>
        )}

        {/* Restore Backup input */}
        <div className="pt-3 border-t border-[#ece9e1] dark:border-[#252e40] space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#798192] dark:text-[#8b95a8] flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Restaurar de Arquivo JSON</span>
            </label>
            <span className="text-[10px] text-[#9199a8]">Reconhece matéria ou caderno inteiro</span>
          </div>
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
