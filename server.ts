import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: Gemini Assistant for Law Studies
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { prompt, taskType, context, currentTitle, discipline } = req.body;

    if (!prompt && !taskType) {
      return res.status(400).json({ error: 'Prompt ou tipo de tarefa obrigatório.' });
    }

    if (!aiClient) {
      // If server does not have API key loaded in env yet, provide fallback sample generation
      return res.status(200).json({
        success: true,
        text: `Assistente Jurídico:\n\nPara o tema "${currentTitle || 'Processo Penal'}" em ${discipline || 'Direito'}:\n\nSugestão estruturada:\n1. Notícia do Crime (CPP, art. 5º)\n2. Diligências Preliminares e Perícias (CPP, art. 6º)\n3. Oitiva de Testemunhas e Investigado (CPP, arts. 202 e 185)\n4. Relatório Conclusivo e Remessa ao Juízo/MP (CPP, art. 10)\n\n(Dica: a chave GEMINI_API_KEY está sendo configurada no ambiente para respostas automáticas em tempo real).`,
        structuredTimeline: [
          {
            stepNumber: '01',
            article: 'CPP, art. 5º',
            title: 'Notícia-Crime e Instauração',
            detail: 'Comunicação da infração penal à autoridade policial para início das investigações.',
            notes: 'Pode ser de ofício, por requisição do MP ou requerimento da vítima.',
            type: 'conceito',
          },
          {
            stepNumber: '02',
            article: 'CPP, arts. 6º e 158',
            title: 'Diligências e Exame Pericial',
            detail: 'Preservação de vestígios e realização de perícias técnicas indispensáveis.',
            notes: 'Exame de corpo de delito quando a infração deixar vestígios.',
            type: 'procedimento',
          },
          {
            stepNumber: '03',
            article: 'CPP, art. 10',
            title: 'Relatório Final da Autoridade',
            detail: 'Conclusão das apurações policiais e remessa formal dos autos.',
            notes: 'Prazo: 10 dias indiciado preso ou 30 dias indiciado solto.',
            type: 'procedimento',
          },
        ],
      });
    }

    const systemInstruction = `Você é um Assistente Jurídico especializado em Direito Brasileiro (Penal, Processual Penal, Constitucional, Civil, etc.), focado em ajudar estudantes e bacharéis a esquematizar aulas, ritos processuais, prazos e jurisprudência dos Tribunais Superiores (STF e STJ).
Seja didático, preciso, cite artigos pertinentes da legislação brasileira (CPP, CP, CF/88, CPC, etc.) e produza esquemas claros e objetivos.
Quando o usuário pedir uma linha do tempo ou fluxo, estruture de forma sequencial com números, artigos e notas práticas.`;

    const fullPrompt = `Contexto da Matéria Atual:
Disciplina: ${discipline || 'Direito'}
Tema / Aula: ${currentTitle || 'Geral'}
${context ? `Detalhes adicionais do caderno: ${context}` : ''}

Solicitação do Estudante:
${prompt}

Responda em formato claro em Português do Brasil com explicações diretas e artigos de lei.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Nenhuma resposta gerada.';

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar consulta com o Google Gemini.',
    });
  }
});

// Setup Vite middlewares for development or static files for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
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
    console.log(`Caderno Jurídico server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
