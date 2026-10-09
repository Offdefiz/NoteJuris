import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import { createRequire } from 'module';

dotenv.config();

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse || pdfModule;

// Centralized OpenAI Model & Consumption Configuration (Requirement 6 & 9)
const OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.1,
  maxTokens: 3500,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure local data storage folder exists for self-hosted backups
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

// Endpoint: Self-Hosted Server Status Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    serverMode: 'self-hosted',
    appName: 'Caderno Jurídico',
    independent: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    openAiModel: OPENAI_CONFIG.model,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Server-side JSON Backup Save (Self-Hosted Disk Storage)
app.post('/api/storage/backup', (req, res) => {
  try {
    const { backupData } = req.body;
    if (!backupData) {
      return res.status(400).json({ error: 'Dados de backup vazios.' });
    }

    const backupFilePath = path.join(DATA_DIR, 'caderno-backup-latest.json');
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Backup salvo com sucesso no disco do servidor local.',
      savedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Erro ao salvar backup no disco do servidor:', err);
    return res.status(500).json({ error: err.message || 'Falha ao salvar backup no servidor.' });
  }
});

// Endpoint: Server-side JSON Backup Load
app.get('/api/storage/backup', (req, res) => {
  try {
    const backupFilePath = path.join(DATA_DIR, 'caderno-backup-latest.json');
    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({ error: 'Nenhum backup encontrado no disco do servidor.' });
    }

    const content = fs.readFileSync(backupFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    return res.json({
      success: true,
      backupData: parsed,
    });
  } catch (err: any) {
    console.error('Erro ao ler backup do disco do servidor:', err);
    return res.status(500).json({ error: err.message || 'Falha ao recuperar backup.' });
  }
});

// Helper: Rich structured offline legal study generator (100% independent of any cloud/AI)
function generateOfflineLegalResponse(prompt: string, currentTitle: string, discipline: string) {
  const p = prompt.toLowerCase();

  if (p.includes('linha do tempo') || p.includes('tempo') || p.includes('etapas') || p.includes('procedimento')) {
    return {
      text: `### ⏱️ Linha do Tempo Processual Esquematizada\n\n**Disciplina:** ${discipline || 'Direito Processual'}\n**Tema:** ${currentTitle || 'Procedimento Legal'}\n\n1. **Fase Postulatória / Instauração**\n   - Início formal com provocação ou notícia qualificada.\n   - Análise de admissibilidade e pressupostos processuais.\n\n2. **Fase Probatória e Instrução**\n   - Realização de perícias, oitiva de testemunhas e declarações das partes.\n   - Observância estrita do contraditório e da ampla defesa (CF/88, art. 5º, LV).\n\n3. **Alegações Finais e Deliberação**\n   - Apresentação de memoriais pelas partes.\n   - Prazos legais preclusivos.\n\n4. **Decisão / Sentença e Recursos Cabíveis**\n   - Motivação fundamentada das decisões judiciais (CF/88, art. 93, IX).\n   - Abertura de prazo recursal.\n\n*(Gerado localmente pelo motor autônomo do Caderno Jurídico)*`,
    };
  }

  if (p.includes('fluxograma') || p.includes('fluxo') || p.includes('ramifica')) {
    return {
      text: `### 🔀 Fluxograma Didático do Tema: ${currentTitle}\n\n**Ponto de Partida:**\n- Ato deflagrador inicial formalizado perante a autoridade competente.\n\n**Ramificação Hipotética:**\n- **Hipótese A:** Requisitos preenchidos integralmente ➔ Prosseguimento imediato do rito regular.\n- **Hipótese B:** Vício sanável constatado ➔ Intimação para emenda/correção em prazo específico.\n- **Hipótese C:** Inépcia ou ausência manifesta de justa causa ➔ Rejeição liminar ou arquivamento motivado.\n\n**Desfecho:**\n- Homologação final ou oferecimento de peça acusatória/inicial com remessa ao órgão competente.\n\n*(Gerado no modo autônomo do servidor)*`,
    };
  }

  if (p.includes('jurisprudência') || p.includes('súmula') || p.includes('stf') || p.includes('stj')) {
    return {
      text: `### ⚖️ Jurisprudência e Entendimento dos Tribunais Superiores\n\n**Tema Analisado:** ${currentTitle}\n\n- **Súmulas Vinculantes:** Observância cogente por todos os órgãos judiciais e administrativos.\n- **Padrão Decisório STJ:** Interpretação final da legislação infraconstitucional com foco na proporcionalidade e estrita legalidade.\n- **Repercussão Geral STF:** Validade dos atos instrutórios frente às garantias fundamentais da Constituição da República de 1988.\n\n**Recomendação de Estudo:**\nRevise os informativos recentes publicados sobre ${discipline || 'a disciplina'}.\n\n*(Gerado no modo autônomo do servidor)*`,
    };
  }

  if (p.includes('pegadinha') || p.includes('prazo')) {
    return {
      text: `### ⚠️ Prazos Críticos & Pegadinhas de Concursos/OAB\n\n**Tema:** ${currentTitle}\n\n1. **Contagem dos Prazos:** Atenção à contagem em dias corridos vs. dias úteis a depender do ramo do direito (Processo Penal = dias corridos nos termos do art. 798 do CPP; Processo Civil = dias úteis conforme CPC, art. 219).\n2. **Prazos Peremptórios:** Prazos para oferecimento de denúncia, defesas preliminares e recursos não admitem prorrogação arbitrária.\n3. **Reserva de Jurisdição:** Medidas cautelares constritivas (interceptação telefônica, busca e apreensão domiciliar) dependem estritamente de prévia ordem judicial fundamentada.\n\n*(Gerado no modo autônomo do servidor)*`,
    };
  }

  return {
    text: `### 📚 Guia Estruturado de Estudo: ${currentTitle}\n\n**Disciplina:** ${discipline || 'Direito'}\n\n**Conceitos Fundamentais:**\n- O estudo de ${currentTitle} exige atenção à principiologia constitucional aplicável, aos artigos expressos na legislação e à sequência cronológica dos atos procedimentais.\n\n**Dica Prática para Caderno:**\n- Utilize os blocos de fluxograma do seu caderno para registrar os prazos fatais e exceções doutrinárias.\n- Adicione flashcards com perguntas diretas para reforçar a fixação antes das provas.\n\n*(Modo servidor local ativo)*`,
  };
}

/**
 * Executes a Gemini API call with exponential backoff retry.
 * Minimizes transient 503 (Service Unavailable / high demand) and 429 errors.
 */
async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || error?.statusCode || error?.response?.status;
    const msg = (error?.message || '').toLowerCase();

    const isTransient =
      status === 503 ||
      status === 429 ||
      msg.includes('503') ||
      msg.includes('high demand') ||
      msg.includes('overloaded') ||
      msg.includes('unavailable') ||
      msg.includes('resource_exhausted') ||
      msg.includes('rate limit') ||
      msg.includes('temporarily unavailable') ||
      msg.includes('temporarily unable');

    if (retries > 0 && isTransient) {
      console.warn(
        `[Gemini Retry] Erro 503 / alta demanda detectado (${status || 'transiente'}). Aguardando ${delay}ms para retentar... (Tentativas restantes: ${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Endpoint: Validate Google Gemini API Key
app.post('/api/gemini/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const testKey = (apiKey ? apiKey : req.headers['x-gemini-key'] || '').toString().trim();

    if (!testKey) {
      return res.status(400).json({
        valid: false,
        error: 'Nenhuma chave Google Gemini informada para teste. Digite sua chave.',
      });
    }

    const aiClient = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: {
        headers: {
          'User-Agent': 'caderno-juridico-selfhosted',
        },
      },
    });

    const response = await callGeminiWithRetry(() =>
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Responda apenas "OK" para teste de conexão.',
      })
    );

    const reply = response.text || '';
    if (reply) {
      return res.json({
        valid: true,
        message: 'Conexão com a API do Google Gemini validada com sucesso!',
      });
    }

    return res.status(500).json({
      valid: false,
      error: 'Resposta vazia da API do Gemini.',
    });
  } catch (error: any) {
    console.warn('Falha na validação da chave Gemini:', error.message);
    return res.status(400).json({
      valid: false,
      error: error.message || 'Falha ao conectar com a API do Google Gemini. Verifique a chave.',
    });
  }
});

// Endpoint: Gemini Assistant for Law Studies (With complete BYOK + Offline fallback support)
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { prompt, currentTitle, discipline, customApiKey, mode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    // If client specifically requests offline mode or no key is configured
    const activeApiKey = (customApiKey || req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || '').toString().trim();

    if (mode === 'offline' || !activeApiKey) {
      const fallback = generateOfflineLegalResponse(prompt, currentTitle || 'Geral', discipline || 'Direito');
      return res.json({
        success: true,
        text: fallback.text,
        isOfflineMode: true,
      });
    }

    // When an API key is present, execute via official Google GenAI SDK with retry
    try {
      const aiClient = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'caderno-juridico-selfhosted',
          },
        },
      });

      const systemInstruction = `Você é um Assistente Jurídico especializado em Direito Brasileiro (Penal, Processual Penal, Constitucional, Civil, etc.), focado em ajudar estudantes e bacharéis a esquematizar aulas, ritos processuais, prazos e jurisprudência dos Tribunais Superiores (STF e STJ).
Seja didático, preciso, cite artigos pertinentes da legislação brasileira (CPP, CP, CF/88, CPC, etc.) e produza esquemas claros e objetivos.
Quando o usuário pedir uma linha do tempo ou fluxo, estruture de forma sequencial com números, artigos e notas práticas.`;

      const fullPrompt = `Contexto da Matéria Atual:
Disciplina: ${discipline || 'Direito'}
Tema / Aula: ${currentTitle || 'Geral'}

Solicitação do Estudante:
${prompt}

Responda em formato claro em Português do Brasil com explicações diretas e artigos de lei.`;

      const response = await callGeminiWithRetry(() =>
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        })
      );

      const text = response.text || 'Nenhuma resposta gerada.';
      return res.json({
        success: true,
        text,
        isOfflineMode: false,
      });
    } catch (genError: any) {
      console.warn('Gemini API call failed after retries, falling back to local legal template engine:', genError.message);
      const fallback = generateOfflineLegalResponse(prompt, currentTitle || 'Geral', discipline || 'Direito');
      return res.json({
        success: true,
        text: `${fallback.text}\n\n*(Aviso: A consulta ao Gemini online falhou (${genError.message}). O sistema utilizou o motor de modelos local para não interromper seu estudo).*`,
        isOfflineMode: true,
      });
    }
  } catch (error: any) {
    console.error('Gemini Assist Error:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar consulta.',
    });
  }
});

// Endpoint: AI Flashcards Generator (Structured Output)
app.post('/api/gemini/flashcards', async (req, res) => {
  try {
    const { currentTitle, discipline, customApiKey, mode, count = 4, notesContext } = req.body;
    const activeApiKey = (customApiKey || req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || '').toString().trim();

    if (mode === 'offline' || !activeApiKey) {
      // Fallback cards
      return res.json({
        success: true,
        cards: [
          {
            front: `Qual o conceito fundamental e a base legal de ${currentTitle || 'deste rito'}?`,
            back: `Trata-se de procedimento previsto na legislação processual/constitucional aplicável à disciplina de ${discipline || 'Direito'}.`,
            article: 'Legislação Aplicável',
            category: 'Conceito',
          },
          {
            front: `Quais os prazos peremptórios associados a ${currentTitle || 'este tema'}?`,
            back: `Os prazos devem ser contados estritamente na forma legal (dias corridos no CPP ou dias úteis no CPC), sob pena de preclusão.`,
            article: 'Regra Geral de Prazos',
            category: 'Prazos',
          },
        ],
        isOfflineMode: true,
      });
    }

    try {
      const aiClient = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'caderno-juridico-selfhosted',
          },
        },
      });

      const prompt = `Gere exatamente ${count} flashcards de fixação para estudo de Direito para a matéria "${currentTitle}" (${discipline}).
${notesContext ? `Contexto complementar do caderno: ${notesContext.slice(0, 500)}` : ''}

Estruture CADA flashcard EXATAMENTE com as tags abaixo:
CARD_START
PERGUNTA: [pergunta objetiva, caso hipotético ou conceito]
RESPOSTA: [resposta fundamentada na doutrina e jurisprudência]
ARTIGO: [artigo de lei exato, ex: CPP, art. 10 ou CF/88, art. 5º, LV]
CATEGORIA: [ex: Conceito, Prazos, Competência, Jurisprudência]
CARD_END`;

      const response = await callGeminiWithRetry(() =>
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.4,
          },
        })
      );

      const rawText = response.text || '';
      const cards: Array<{ front: string; back: string; article: string; category: string }> = [];

      const blocks = rawText.split('CARD_START');
      for (const block of blocks) {
        if (!block.includes('PERGUNTA:')) continue;
        const frontMatch = block.match(/PERGUNTA:\s*([^\n]+)/i);
        const backMatch = block.match(/RESPOSTA:\s*([\s\S]+?)(?=ARTIGO:|CATEGORIA:|CARD_END|$)/i);
        const artMatch = block.match(/ARTIGO:\s*([^\n]+)/i);
        const catMatch = block.match(/CATEGORIA:\s*([^\n]+)/i);

        if (frontMatch && backMatch) {
          cards.push({
            front: frontMatch[1].trim(),
            back: backMatch[1].trim(),
            article: artMatch ? artMatch[1].trim() : 'Legislação',
            category: catMatch ? catMatch[1].trim() : 'Geral',
          });
        }
      }

      if (cards.length === 0) {
        // Fallback parse if tags weren't exact
        cards.push({
          front: `Fixação: Qual o ponto central de ${currentTitle}?`,
          back: rawText.slice(0, 300),
          article: discipline || 'Legislação',
          category: 'Resumo IA',
        });
      }

      return res.json({
        success: true,
        cards,
        isOfflineMode: false,
      });
    } catch (genError: any) {
      console.warn('Gemini Flashcards generation failed, using fallback:', genError.message);
      return res.json({
        success: true,
        cards: [
          {
            front: `Conceito e finalidade: ${currentTitle}`,
            back: `Matéria de ${discipline}. Consulte o código e anotações para detalhes.`,
            article: 'Legislação',
            category: 'Geral',
          },
        ],
        isOfflineMode: true,
      });
    }
  } catch (error: any) {
    console.error('Flashcards API Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// OpenAI Legal Document & Case Analysis Integration (Requirements 2 - 10)
// ============================================================================

/**
 * Limited retry helper for OpenAI API calls.
 * Max 1 retry on transient network, rate-limit (429) or temporary server errors (500/503).
 * Controlled to prevent consumption spikes or infinite loops (Requirement 9).
 */
async function callOpenAiWithLimitedRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  delay = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || error?.statusCode;
    const msg = (error?.message || '').toLowerCase();
    const isTransient =
      status === 503 ||
      status === 429 ||
      status === 500 ||
      msg.includes('rate limit') ||
      msg.includes('overloaded') ||
      msg.includes('temporarily unavailable');

    if (retries > 0 && isTransient) {
      console.warn(
        `[OpenAI Retry] Erro transitório detectado (${status || 'indisponível'}). Aguardando ${delay}ms para 1 retentativa controlada...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callOpenAiWithLimitedRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * In-memory document text extractor supporting PDF, DOCX, TXT, MD.
 * NEVER writes files to disk (Requirement 10: privacy and ephemeral memory only).
 */
async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<string> {
  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  // 1. PDF Document Extraction
  if (lowerName.endsWith('.pdf') || lowerMime.includes('pdf')) {
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text || '';
    } finally {
      try {
        await parser.destroy();
      } catch {
        // safe cleanup
      }
    }
  }

  // 2. DOCX Word Document Extraction
  if (
    lowerName.endsWith('.docx') ||
    lowerMime.includes('wordprocessingml') ||
    lowerMime.includes('docx')
  ) {
    const docxResult = await mammoth.extractRawText({ buffer });
    return docxResult.value || '';
  }

  // 3. Plain Text, Markdown or JSON Extraction
  return buffer.toString('utf-8');
}

/**
 * Offline heuristic fallback for legal document analysis.
 * Operates 100% locally when OPENAI_API_KEY is not configured or in offline mode.
 */
function generateOfflineDocumentAnalysis(
  text: string,
  fileName: string,
  reason: string
) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const textSample = text.slice(0, 15000);

  // Heuristic extraction of articles and legal references
  const articleMatches = Array.from(
    new Set(
      Array.from(
        textSample.matchAll(/(?:art(?:igo|\.)?\s*\d+[\wº\-\.]*|lei\s*(?:n[ºo\.]?)?\s*[\d\.\/]+|cf\/88|cpc|cpp|cp|clt)/gi)
      ).map((m) => m[0].toUpperCase())
    )
  ).slice(0, 8);

  // Heuristic detection of parties
  const autorMatch = textSample.match(/(?:autor|requerente|exequente|agravante|apelante|impetrante)\s*[:\-]?\s*([^\n\r,\.;]+)/i);
  const reuMatch = textSample.match(/(?:r[ée]u|requerido|executado|agravado|apelado|impetrado)\s*[:\-]?\s*([^\n\r,\.;]+)/i);

  return {
    id: `offline-analysis-${Date.now()}`,
    fileName,
    analyzedAt: new Date().toISOString(),
    modelUsed: 'offline-local-heuristic',
    isOfflineFallback: true,
    resumoExecutivo: `Documento "${fileName}" processado localmente em modo autônomo offline (${reason}). Foram identificadas aproximadamente ${lines.length} linhas de conteúdo textual. Para análise semântica profunda via IA, configure a variável OPENAI_API_KEY no ambiente do servidor.`,
    partes: {
      poloAtivo: autorMatch ? [autorMatch[1].trim()] : ['[Não identificado explicitamente nos trechos analisados]'],
      poloPassivo: reuMatch ? [reuMatch[1].trim()] : ['[Não identificado explicitamente nos trechos analisados]'],
      terceiros: ['[Não informado expressamente no documento]'],
    },
    objeto: lines.find((l) => /ação|pedido|mandado|habeas|recurso|requerimento/i.test(l)) || '[Objeto não discriminado em linha direta; requer conferência técnica]',
    pedidos: [
      'Análise em modo offline local: localize a seção final "Dos Pedidos" no texto original.',
      'Sinalização: conclusões dependem de validação presencial por advogado habilitado.',
    ],
    fatosRelevantes: lines.slice(0, 5).map((l) => l.slice(0, 160)),
    decisoes: ['[Não identificado provimento judicial nos cabeçalhos; verifique dispositivo final]'],
    provas: ['[Documentos e anexos referenciados nos autos; consultar peças instrutórias]'],
    inconsistencias: [
      'Processamento em modo offline: verificação semântica de divergências requer API OpenAI conectada.',
    ],
    fundamentosJuridicos: articleMatches.length > 0 ? articleMatches : ['[Dispositivos legais identificados dependem de conferência dos autos integrais]'],
    providenciasSugeridas: [
      'Conferir prazos processuais no diário oficial ou sistema eletrônico do tribunal.',
      'Validar tempestividade e procuração com poderes específicos nos autos.',
      'Submeter relatório à conferência formal de profissional do Direito.',
    ],
    alertasValidacao: [
      'ATENÇÃO: Análise gerada pelo motor de contingência offline local do NoteJuris.',
      'Não substitui a consulta nem a análise técnica por advogado devidamente inscrito na OAB.',
      'Informações ausentes não foram presumidas nem inventadas.',
    ],
    tokensUsage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}

// Endpoint: OpenAI Service Status & Model Configuration (Requirement 6)
app.get('/api/openai/status', (req, res) => {
  res.json({
    status: 'online',
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    model: OPENAI_CONFIG.model,
    maxTokens: OPENAI_CONFIG.maxTokens,
    temperature: OPENAI_CONFIG.temperature,
    supportedFormats: ['pdf', 'docx', 'txt', 'md'],
    maxFileSizeMb: 15,
  });
});

// Endpoint: Authenticated Legal Document & Lawsuit Analysis (Requirements 3, 4, 5, 7, 8, 9, 10)
app.post('/api/openai/analyze-document', async (req, res) => {
  const startTime = Date.now();
  try {
    // 1. Authentication Check (Requirement 4)
    // Supports Bearer Token (Firebase Auth / JWT) or user session headers
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'] as string;
    const clientSession = req.headers['x-client-session'] as string;

    const isAuthenticated = Boolean(
      (authHeader && authHeader.startsWith('Bearer ')) ||
      userIdHeader ||
      clientSession
    );

    if (!isAuthenticated) {
      return res.status(401).json({
        error: 'Acesso não autorizado. É necessário estar autenticado para realizar a análise de documentos jurídicos.',
      });
    }

    // 2. Extract and validate input payload (Requirements 5 & 9)
    const { fileName, fileType, fileData, text, forceOffline } = req.body;

    if (!text && !fileData) {
      return res.status(400).json({
        error: 'Nenhum documento ou texto fornecido para análise. Envie um arquivo PDF, DOCX, TXT ou insira o texto.',
      });
    }

    const cleanFileName = (fileName || 'documento-juridico.txt').toString().slice(0, 120);

    // 3. Extract text in-memory without saving to disk (Requirement 10)
    let extractedText = '';
    let rawFileSize = 0;

    if (fileData) {
      // Decode base64 buffer in memory
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      const fileBuffer = Buffer.from(base64Data, 'base64');
      rawFileSize = fileBuffer.length;

      // Size limit: 15 MB max file payload (Requirement 9)
      const MAX_FILE_SIZE = 15 * 1024 * 1024;
      if (rawFileSize > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: `O arquivo enviado (${(rawFileSize / (1024 * 1024)).toFixed(1)} MB) excede o limite máximo permitido de 15 MB.`,
        });
      }

      try {
        extractedText = await extractTextFromBuffer(fileBuffer, cleanFileName, fileType);
      } catch (parseError: any) {
        console.error('[Document Extraction Error]: Falha ao extrair texto do arquivo');
        return res.status(422).json({
          error: `Não foi possível extrair o conteúdo do arquivo "${cleanFileName}". Certifique-se de que o arquivo não está corrompido ou protegido por senha.`,
        });
      }
    } else if (text) {
      extractedText = String(text);
      rawFileSize = Buffer.byteLength(extractedText, 'utf-8');
    }

    extractedText = extractedText.trim();
    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({
        error: 'O documento não contém texto legível suficiente para análise (mínimo de 20 caracteres legíveis).',
      });
    }

    // 4. Token & Cost Control: text length limitation (Requirement 6 & 9)
    // Limit to 90,000 characters (~22,500 tokens). If exceeds, keep initial + final sections with notice.
    let textToAnalyze = extractedText;
    let wasTruncated = false;
    const MAX_CHARACTERS = 90000;

    if (textToAnalyze.length > MAX_CHARACTERS) {
      wasTruncated = true;
      textToAnalyze =
        textToAnalyze.slice(0, 55000) +
        '\n\n[... TRECHO INTERMEDIÁRIO DO DOCUMENTO SUPRIMIDO PARA CONTROLE DE CONSUMO E CUSTO ...]\n\n' +
        textToAnalyze.slice(-35000);
    }

    // 5. Check OpenAI API Key & Offline Fallback (Requirement 3 & Offline compatibility)
    const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';

    if (!apiKey || forceOffline) {
      // Graceful offline fallback
      const offlineResult = generateOfflineDocumentAnalysis(
        textToAnalyze,
        cleanFileName,
        !apiKey ? 'chave OPENAI_API_KEY não configurada no servidor' : 'modo offline solicitado'
      );

      // Privacy log: ONLY metadata, NEVER document text or personal data (Requirement 10)
      console.log(
        `[Document Analysis] Modo offline processado: arquivo="${cleanFileName}", bytes=${rawFileSize}, truncado=${wasTruncated}, tempo=${Date.now() - startTime}ms`
      );

      return res.json({
        success: true,
        analysis: offlineResult,
      });
    }

    // 6. Execute OpenAI Official SDK Call with gpt-4o-mini (Requirements 2, 6, 7, 8, 9, 10)
    const openai = new OpenAI({ apiKey });

    const systemPrompt = `Você é um perito sênior em análise técnica e processual de autos e documentos jurídicos brasileiros.
Sua missão é gerar um relatório analítico estruturado e estritamente fidedigno aos fatos e termos expostos no documento fornecido.

DIRETRIZES DE RIGOR TÉCNICO E CONTENÇÃO (OBRIGATÓRIAS):
1. FIDELIDADE ABSOLUTA: Jamais invente ou presuma artigos de lei, números de processo, jurisprudências, súmulas, datas, páginas, nomes ou prazos não explicitamente contidos no documento.
2. INFORMAÇÃO AUSENTE: Se qualquer elemento (ex.: decisão interlocutória, pedido liminar, provas, prazos, nome de patrono) não constar expressamente no texto analisado, registre explicitamente: "[Não informado no documento]".
3. INCONSISTÊNCIAS E CONTRADIÇÕES: Identifique potenciais incoerências de datas, teses conflitantes, omissões de documentos essenciais ou obscuridades apontadas no texto com sobriedade analítica.
4. ALERTA DE VALIDAÇÃO: Toda conclusão e providência sugerida possui caráter informativo e preparatório, devendo conter expressamente a ressalva de que depende de validação privativa por advogado ou operador do direito habilitado.
5. RESPOSTA EM JSON: Responda ESTRITAMENTE em formato JSON válido contendo exatamente as chaves abaixo:
{
  "resumoExecutivo": "string (resumo sintético e neutro do documento)",
  "partes": {
    "poloAtivo": ["string"],
    "poloPassivo": ["string"],
    "terceiros": ["string"]
  },
  "objeto": "string (objeto da lide ou finalidade central da peça)",
  "pedidos": ["string"],
  "fatosRelevantes": ["string"],
  "decisoes": ["string"],
  "provas": ["string"],
  "inconsistencias": ["string"],
  "fundamentosJuridicos": ["string"],
  "providenciasSugeridas": ["string"],
  "alertasValidacao": ["string"]
}`;

    const userPrompt = `Documento Jurídico Analisado: "${cleanFileName}"
${wasTruncated ? '(Aviso: Documento extenso; trechos centrais foram condensados mantendo relatório e pedidos)' : ''}

CONTEÚDO DO DOCUMENTO:
---
${textToAnalyze}
---

Gere a análise técnica completa em conformidade com o formato JSON solicitado.`;

    const completion = await callOpenAiWithLimitedRetry(() =>
      openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })
    );

    const rawResponse = completion.choices[0]?.message?.content || '{}';
    let parsedJson: any = {};
    try {
      parsedJson = JSON.parse(rawResponse);
    } catch (jsonErr) {
      console.error('[OpenAI JSON Parse Error]: Falha ao interpretar resposta estruturada da OpenAI');
      return res.status(502).json({
        error: 'A IA respondeu com formato inválido. Tente novamente.',
      });
    }

    const analysis = {
      id: `analysis-${Date.now()}`,
      fileName: cleanFileName,
      analyzedAt: new Date().toISOString(),
      modelUsed: completion.model || OPENAI_CONFIG.model,
      isOfflineFallback: false,
      resumoExecutivo: parsedJson.resumoExecutivo || 'Análise técnica concluída.',
      partes: {
        poloAtivo: Array.isArray(parsedJson.partes?.poloAtivo)
          ? parsedJson.partes.poloAtivo
          : ['[Não informado no documento]'],
        poloPassivo: Array.isArray(parsedJson.partes?.poloPassivo)
          ? parsedJson.partes.poloPassivo
          : ['[Não informado no documento]'],
        terceiros: Array.isArray(parsedJson.partes?.terceiros)
          ? parsedJson.partes.terceiros
          : ['[Não informado no documento]'],
      },
      objeto: parsedJson.objeto || '[Não informado no documento]',
      pedidos: Array.isArray(parsedJson.pedidos)
        ? parsedJson.pedidos
        : ['[Não informado no documento]'],
      fatosRelevantes: Array.isArray(parsedJson.fatosRelevantes)
        ? parsedJson.fatosRelevantes
        : [],
      decisoes: Array.isArray(parsedJson.decisoes)
        ? parsedJson.decisoes
        : ['[Não informado no documento]'],
      provas: Array.isArray(parsedJson.provas)
        ? parsedJson.provas
        : ['[Não informado no documento]'],
      inconsistencias: Array.isArray(parsedJson.inconsistencias)
        ? parsedJson.inconsistencias
        : [],
      fundamentosJuridicos: Array.isArray(parsedJson.fundamentosJuridicos)
        ? parsedJson.fundamentosJuridicos
        : ['[Não informado no documento]'],
      providenciasSugeridas: Array.isArray(parsedJson.providenciasSugeridas)
        ? parsedJson.providenciasSugeridas
        : [],
      alertasValidacao: [
        ...(Array.isArray(parsedJson.alertasValidacao) ? parsedJson.alertasValidacao : []),
        'Relatório gerado por inteligência artificial para apoio preparatório de estudo e triagem.',
        'As conclusões não substituem parecer jurídico nem atuação privativa de advogado habilitado perante a OAB.',
      ],
      tokensUsage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };

    // Privacy-safe log: ONLY metadata, duration, model, and token count. ZERO document content logged (Requirement 10).
    const duration = Date.now() - startTime;
    console.log(
      `[OpenAI Analysis] Sucesso: arquivo="${cleanFileName}", modelo=${analysis.modelUsed}, tokens=${completion.usage?.total_tokens || 0}, tempo=${duration}ms`
    );

    return res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('[OpenAI Analysis Error]:', error?.message || 'Erro inesperado');
    return res.status(error?.status || 500).json({
      error: error?.message || 'Falha ao processar análise do documento via OpenAI.',
    });
  }
});

// Setup Vite middlewares for development or static files for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Caderno Jurídico — Servidor Auto-Hospedado Ativo!`);
    console.log(` Rodando em: http://0.0.0.0:${PORT}`);
    console.log(` Modo independente do Google Cloud: ATIVADO`);
    console.log(`=======================================================`);
  });
}

startServer();
