import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

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
