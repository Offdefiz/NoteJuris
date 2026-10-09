import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileText,
  Upload,
  Sparkles,
  Scale,
  Users,
  Target,
  FileCheck,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Download,
  PlusCircle,
  Loader2,
  Shield,
  FileQuestion,
  FileSpreadsheet,
  FileCode,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LegalDocumentAnalysis } from '../types/notebook';

interface DocumentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertAsNoteBlock?: (title: string, body: string) => void;
}

export const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({
  isOpen,
  onClose,
  onInsertAsNoteBlock,
}) => {
  const { user } = useAuth();

  // Mode and input state
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & API information state
  const [serverStatus, setServerStatus] = useState<{
    hasKey: boolean;
    model: string;
    status: string;
  } | null>(null);

  // Analysis execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LegalDocumentAnalysis | null>(null);

  // UI state for results
  const [activeTab, setActiveTab] = useState<'summary' | 'parties' | 'claims' | 'evidence' | 'issues' | 'actions'>('summary');
  const [copied, setCopied] = useState<boolean>(false);
  const [insertedToNotes, setInsertedToNotes] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Fetch OpenAI service status on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/openai/status')
        .then((res) => res.json())
        .then((data) => setServerStatus(data))
        .catch(() => setServerStatus({ hasKey: false, model: 'gpt-4o-mini', status: 'offline' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // File selection handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('Formato não suportado. Por favor, envie arquivos PDF, DOCX, TXT ou MD.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('O arquivo excede o limite máximo permitido de 15 MB.');
      return;
    }

    setSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  // Execute Analysis
  const handleAnalyze = async () => {
    setError(null);
    setInsertedToNotes(false);

    if (inputMode === 'upload' && !selectedFile) {
      setError('Selecione um arquivo PDF, DOCX ou TXT para analisar.');
      return;
    }

    if (inputMode === 'paste' && (!pastedText.trim() || pastedText.trim().length < 20)) {
      setError('Cole ao menos 20 caracteres do documento jurídico.');
      return;
    }

    setIsLoading(true);

    try {
      let fileData: string | undefined = undefined;
      let fileName = 'texto-avulso.txt';
      let fileType = 'txt';

      if (inputMode === 'upload' && selectedFile) {
        fileData = await fileToBase64(selectedFile);
        fileName = selectedFile.name;
        fileType = selectedFile.name.split('.').pop() || 'txt';
      }

      // Prepare request headers with authentication (Requirement 4)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (user?.uid) {
        headers['x-user-id'] = user.uid;
      } else {
        headers['x-client-session'] = `session-user-${Date.now()}`;
      }

      const response = await fetch('/api/openai/analyze-document', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileName,
          fileType,
          fileData,
          text: inputMode === 'paste' ? pastedText : undefined,
          forceOffline,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar o documento.');
      }

      setAnalysisResult(data.analysis);
      setActiveTab('summary');
    } catch (err: any) {
      setError(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format analysis as Markdown for copying / export
  const generateMarkdownReport = (a: LegalDocumentAnalysis): string => {
    return `# RELATÓRIO DE ANÁLISE JURÍDICA E PROCESSUAL
**Documento:** ${a.fileName}
**Data:** ${new Date(a.analyzedAt).toLocaleDateString('pt-BR')} às ${new Date(a.analyzedAt).toLocaleTimeString('pt-BR')}
**Modelo:** ${a.modelUsed} ${a.isOfflineFallback ? '(Modo Offline Local)' : ''}

---

## 1. RESUMO EXECUTIVO
${a.resumoExecutivo}

## 2. PARTES PROCESSUAIS
- **Polo Ativo:** ${a.partes.poloAtivo.join(', ') || '[Não informado no documento]'}
- **Polo Passivo:** ${a.partes.poloPassivo.join(', ') || '[Não informado no documento]'}
- **Terceiros / Intervenientes:** ${a.partes.terceiros.join(', ') || '[Não informado no documento]'}

## 3. OBJETO DA DEMANDA
${a.objeto}

## 4. PEDIDOS FORMULADOS
${a.pedidos.map((p) => `- ${p}`).join('\n')}

## 5. FATOS RELEVANTES
${a.fatosRelevantes.map((f) => `- ${f}`).join('\n')}

## 6. DECISÕES E DESPACHOS IDENTIFICADOS
${a.decisoes.map((d) => `- ${d}`).join('\n')}

## 7. PROVAS MENCIONADAS
${a.provas.map((p) => `- ${p}`).join('\n')}

## 8. POSSÍVEIS INCONSISTÊNCIAS E PONTOS DE ATENÇÃO
${a.inconsistencias.map((i) => `- ⚠️ ${i}`).join('\n')}

## 9. FUNDAMENTOS JURÍDICOS MENCIONADOS
${a.fundamentosJuridicos.map((fj) => `- ${fj}`).join('\n')}

## 10. PROVIDÊNCIAS SUGERIDAS
${a.providenciasSugeridas.map((ps) => `- [ ] ${ps}`).join('\n')}

---

### AVISOS DE VALIDAÇÃO PROFISSIONAL:
${a.alertasValidacao.map((av) => `> ⚖️ ${av}`).join('\n')}
`;
  };

  // Copy full analysis to clipboard
  const handleCopy = () => {
    if (!analysisResult) return;
    const md = generateMarkdownReport(analysisResult);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export report as .md file
  const handleDownloadMarkdown = () => {
    if (!analysisResult) return;
    const md = generateMarkdownReport(analysisResult);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-${analysisResult.fileName.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Insert analysis as a new custom note block into the active notebook
  const handleInsertIntoNotebook = () => {
    if (!analysisResult || !onInsertAsNoteBlock) return;
    const title = `Análise: ${analysisResult.fileName}`;
    const body = `**Objeto:** ${analysisResult.objeto}\n\n**Resumo:** ${analysisResult.resumoExecutivo}\n\n**Partes:**\n- Ativo: ${analysisResult.partes.poloAtivo.join(', ')}\n- Passivo: ${analysisResult.partes.poloPassivo.join(', ')}\n\n**Principais Pedidos:**\n${analysisResult.pedidos.slice(0, 4).map((p) => `• ${p}`).join('\n')}\n\n**Fundamentos:** ${analysisResult.fundamentosJuridicos.join(', ')}\n\n*(Análise com gpt-4o-mini - requer validação técnica)*`;

    onInsertAsNoteBlock(title, body);
    setInsertedToNotes(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#fbfbfa] dark:bg-[#151922] rounded-2xl border border-[#dedcd4] dark:border-[#273042] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7e5dc] dark:border-[#242c3d] bg-white/70 dark:bg-[#1a202c]/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1a202c] dark:text-[#f0f3f8]">
                  Análise Técnica de Peças e Processos
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3" />
                  {serverStatus?.model || 'gpt-4o-mini'}
                </span>
                {serverStatus && !serverStatus.hasKey && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Modo Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626a7c] dark:text-[#919cb0]">
                Extração estruturada de partes, pedidos, fatos, inconsistências e riscos com a API oficial OpenAI.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6b7385] dark:text-[#929cb0] hover:text-[#181d27] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!analysisResult ? (
            /* ================= INPUT VIEW ================= */
            <div className="space-y-5">
              {/* Mode Switcher */}
              <div className="flex rounded-xl bg-[#eeebe2] dark:bg-[#1d2433] p-1 max-w-md">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    inputMode === 'upload'
                      ? 'bg-white dark:bg-[#2b3548] text-[#1b222f] dark:text-white shadow-xs'
                      : 'text-[#656d7e] dark:text-[#8e98ab] hover:text-[#1c222e] dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Enviar Arquivo (PDF / DOCX / TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    inputMode === 'paste'
                      ? 'bg-white dark:bg-[#2b3548] text-[#1b222f] dark:text-white shadow-xs'
                      : 'text-[#656d7e] dark:text-[#8e98ab] hover:text-[#1c222e] dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Colar Texto da Peça
                </button>
              </div>

              {/* Upload Tab */}
              {inputMode === 'upload' ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                      : selectedFile
                      ? 'border-emerald-400 bg-white dark:bg-[#1a2130]'
                      : 'border-[#d8d5cb] dark:border-[#2f394d] bg-white/50 dark:bg-[#19202c]/50 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-white dark:hover:bg-[#1c2331]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        <FileCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1f2633] dark:text-[#f0f3f8]">
                          {selectedFile.name}
                        </h4>
                        <p className="text-xs text-[#6e7789] dark:text-[#8d97aa] mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Pronto para processamento em memória
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Trocar arquivo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#20293a] text-emerald-600 dark:text-emerald-400">
                        <Upload className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <p className="text-sm font-semibold text-[#252c3a] dark:text-[#e4e8f1]">
                        Arraste e solte o processo ou clique para selecionar
                      </p>
                      <p className="text-xs text-[#737c8e] dark:text-[#8b95a8]">
                        Suporta arquivos <strong>PDF</strong>, <strong>DOCX (Word)</strong> ou <strong>TXT</strong> até 15 MB.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Paste Text Tab */
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#676f81] dark:text-[#8d97aa]">
                    <span>Cole abaixo o teor da petição inicial, contestação, recurso ou sentença:</span>
                    <span className="font-mono">{pastedText.length} caracteres (~{Math.round(pastedText.length / 4)} tokens)</span>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...\n\n[Cole aqui os trechos da peça ou decisão judicial para triagem técnica]"
                    className="w-full p-4 rounded-xl border border-[#dedcd4] dark:border-[#2d374a] bg-white dark:bg-[#1a2130] text-[#1b222f] dark:text-[#e7ebf3] text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 resize-y"
                  />
                </div>
              )}

              {/* Privacy, Retention & Cost Guarantees Banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-950 dark:text-blue-100">
                    Segurança, Sigilo e Retenção Volátil em Memória
                  </p>
                  <p className="text-blue-800/90 dark:text-blue-300 leading-relaxed">
                    O documento é processado exclusivamente em memória volátil e <strong>nunca é salvo em disco ou gravado em logs</strong> do servidor. A chave da OpenAI reside exclusivamente no backend protegido (<code className="font-mono bg-blue-100/80 dark:bg-blue-900/50 px-1 py-0.5 rounded">process.env.OPENAI_API_KEY</code>).
                  </p>
                </div>
              </div>

              {/* Offline Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="forceOfflineCheck"
                  checked={forceOffline}
                  onChange={(e) => setForceOffline(e.target.checked)}
                  className="rounded border-[#d0cdbf] dark:border-[#384357] text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="forceOfflineCheck" className="text-xs text-[#525a6b] dark:text-[#a0abbd] cursor-pointer">
                  Executar no <strong>Modo Offline Local Heurístico</strong> (sem efetuar chamadas à API OpenAI)
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isLoading || (inputMode === 'upload' && !selectedFile) || (inputMode === 'paste' && !pastedText.trim())}
                  onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-emerald-700/20 active:scale-[0.99] transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analisando com {forceOffline ? 'Motor Local Offline' : (serverStatus?.model || 'gpt-4o-mini')}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Iniciar Análise Estruturada</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ================= RESULTS VIEW ================= */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header result summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#1b2230] border border-[#e1dfd6] dark:border-[#2a3447] shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Análise Concluída
                    </span>
                    <span className="text-xs text-[#70798c] dark:text-[#8893a6]">
                      • {analysisResult.fileName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1a212e] dark:text-[#edf1f8] mt-0.5">
                    {analysisResult.objeto || 'Objeto processual analisado'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2c364b] bg-white dark:bg-[#1f2636] hover:bg-[#edebe6] dark:hover:bg-[#273145] text-xs font-semibold text-[#293242] dark:text-[#e2e8f0] transition-colors"
                    title="Copiar relatório em formato Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dedbd3] dark:border-[#2c364b] bg-white dark:bg-[#1f2636] hover:bg-[#edebe6] dark:hover:bg-[#273145] text-xs font-semibold text-[#293242] dark:text-[#e2e8f0] transition-colors"
                    title="Baixar arquivo .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar MD</span>
                  </button>

                  {onInsertAsNoteBlock && (
                    <button
                      type="button"
                      onClick={handleInsertIntoNotebook}
                      disabled={insertedToNotes}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-2xs"
                      title="Salvar como novo bloco nas notas da aula"
                    >
                      {insertedToNotes ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      <span>{insertedToNotes ? 'Adicionado ao Caderno' : 'Inserir nas Anotações'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs for Structured Output */}
              <div className="flex overflow-x-auto gap-1 border-b border-[#e1ded6] dark:border-[#273144] pb-2 text-xs font-semibold scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === 'summary'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-[#646d7e] dark:text-[#8d98ab] hover:text-[#1b222f] dark:hover:text-white'
                  }`}
                >
                  Resumo Executivo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('parties')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === 'parties'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-[#646d7e] dark:text-[#8d98ab] hover:text-[#1b222f] dark:hover:text-white'
                  }`}
                >
                  Partes ({analysisResult.partes.poloAtivo.length + analysisResult.partes.poloPassivo.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('claims')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === 'claims'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-[#646d7e] dark:text-[#8d98ab] hover:text-[#1b222f] dark:hover:text-white'
                  }`}
                >
                  Pedidos & Fatos ({analysisResult.pedidos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === 'evidence'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-[#646d7e] dark:text-[#8d98ab] hover:text-[#1b222f] dark:hover:text-white'
                  }`}
                >
                  Decisões & Provas ({analysisResult.decisoes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('issues')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === 'issues'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-[#646d7e] dark:text-[#8d98ab] hover:text-[#1b222f] dark:hover:text-white'
                  }`}
                >
                  Inconsistências & Riscos ({analysisResult.inconsistencias.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === 'actions'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-[#646d7e] dark:text-[#8d98ab] hover:text-[#1b222f] dark:hover:text-white'
                  }`}
                >
                  Fundamentos & Providências
                </button>
              </div>

              {/* Tab 1: Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#757d90] dark:text-[#8a96ab]">
                      Síntese da Peça Processual
                    </h4>
                    <p className="text-sm leading-relaxed text-[#232a38] dark:text-[#e1e6f0]">
                      {analysisResult.resumoExecutivo}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f4f2ea] dark:bg-[#19202c] border border-[#e2e0d7] dark:border-[#283244] space-y-2">
                    <h5 className="text-xs font-bold text-[#353d4f] dark:text-[#c5cedf]">
                      Objeto Central:
                    </h5>
                    <p className="text-xs text-[#4b5466] dark:text-[#b0bad0]">
                      {analysisResult.objeto}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Parties */}
              {activeTab === 'parties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                      <span>POLO ATIVO (AUTOR / REQUERENTE)</span>
                    </div>
                    <ul className="space-y-2 text-xs text-[#28303f] dark:text-[#dce2ee]">
                      {analysisResult.partes.poloAtivo.map((item, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                      <Users className="w-4 h-4" />
                      <span>POLO PASSIVO (RÉU / REQUERIDO)</span>
                    </div>
                    <ul className="space-y-2 text-xs text-[#28303f] dark:text-[#dce2ee]">
                      {analysisResult.partes.poloPassivo.map((item, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-full p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-2">
                    <div className="text-xs font-bold text-[#626a7c] dark:text-[#909cb0]">
                      TERCEIROS, INTERVENIENTES OU ASSISTENTES:
                    </div>
                    <p className="text-xs text-[#3d4554] dark:text-[#cbd4e5]">
                      {analysisResult.partes.terceiros.join(', ') || '[Não informado no documento]'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Claims and Facts */}
              {activeTab === 'claims' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Target className="w-4 h-4" />
                      <span>PEDIDOS FORMULADOS NA PEÇA</span>
                    </div>
                    <ul className="space-y-2 text-xs text-[#293140] dark:text-[#dce2ee]">
                      {analysisResult.pedidos.map((pedido, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{idx + 1}.</span>
                          <span className="leading-relaxed">{pedido}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="text-xs font-bold text-[#565e70] dark:text-[#9ba7bd]">
                      FATOS RELEVANTES E CRONOLOGIA
                    </div>
                    <ul className="space-y-2 text-xs text-[#293140] dark:text-[#dce2ee]">
                      {analysisResult.fatosRelevantes.map((fato, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          <span className="font-mono text-[10px] text-slate-500 mt-0.5">•</span>
                          <span className="leading-relaxed">{fato}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 4: Evidence & Decisions */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-400">
                      DECISÕES / DESPACHOS IDENTIFICADOS NOS AUTOS
                    </div>
                    <ul className="space-y-2 text-xs text-[#293140] dark:text-[#dce2ee]">
                      {analysisResult.decisoes.map((item, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="text-xs font-bold text-[#565e70] dark:text-[#9ba7bd]">
                      ACERVO PROBATÓRIO CITADO OU ACOSTADO
                    </div>
                    <ul className="space-y-2 text-xs text-[#293140] dark:text-[#dce2ee]">
                      {analysisResult.provas.map((item, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 5: Inconsistencies & Issues */}
              {activeTab === 'issues' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span>POSSÍVEIS INCONSISTÊNCIAS, CONTRADIÇÕES E PONTOS DE ATENÇÃO</span>
                    </div>
                    {analysisResult.inconsistencias.length > 0 ? (
                      <ul className="space-y-2 text-xs text-amber-950 dark:text-amber-200">
                        {analysisResult.inconsistencias.map((item, idx) => (
                          <li key={idx} className="p-2.5 rounded-lg bg-white/70 dark:bg-[#191f2c] border border-amber-200/70 dark:border-amber-900/50">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-amber-900 dark:text-amber-300">
                        Nenhuma contradição fática gritante detectada na redação da peça.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 6: Legal Basis & Next Steps */}
              {activeTab === 'actions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      FUNDAMENTOS JURÍDICOS E NORMAS MENCIONADAS
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.fundamentosJuridicos.map((fundamento, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {fundamento}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#1a2130] border border-[#dedcd4] dark:border-[#2a3447] space-y-3">
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      PROVIDÊNCIAS SUGERIDAS E PRÓXIMOS PASSOS
                    </div>
                    <ul className="space-y-2 text-xs text-[#283141] dark:text-[#dbe1ee]">
                      {analysisResult.providenciasSugeridas.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8f7f4] dark:bg-[#151a24] border border-[#e8e6de] dark:border-[#222a3a]">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">➔</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Anti-Hallucination & Legal Disclaimer Footer Banner (Requirement 8) */}
              <div className="p-4 rounded-xl bg-[#eeebe2] dark:bg-[#1b2230] border border-[#d8d5ca] dark:border-[#2c364b] space-y-1.5 text-xs text-[#525a6b] dark:text-[#9ea8bd]">
                <div className="flex items-center gap-1.5 font-bold text-[#232b3b] dark:text-[#e4e8f2]">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aviso Ético e Legal Obrigatório (NoteJuris Compliance)</span>
                </div>
                <p className="leading-relaxed">
                  Este relatório constitui triagem automatizada com o modelo <strong>{analysisResult.modelUsed}</strong> para apoio didático e organização preliminar. Artigos, datas ou dados não expressos no texto não foram presumidos. Toda providência prática e conclusão interpretativa depende de validação privativa por profissional do Direito devidamente habilitado.
                </p>
              </div>

              {/* Reset to New Analysis */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedFile(null);
                    setPastedText('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#666f81] dark:text-[#9ba6ba] hover:text-[#181d28] dark:hover:text-white transition-colors"
                >
                  ← Realizar Nova Análise
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
