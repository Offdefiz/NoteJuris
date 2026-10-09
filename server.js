// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import mammoth from "mammoth";
import { createRequire } from "module";
dotenv.config();
var require2 = createRequire(import.meta.url);
var pdfModule = require2("pdf-parse");
var PDFParse = pdfModule.PDFParse || pdfModule;
var OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0.1,
  maxTokens: 3500
};
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "50mb" }));
var DATA_DIR = path.resolve(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create data directory:", err);
  }
}
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    serverMode: "self-hosted",
    appName: "Caderno Jur\xEDdico",
    independent: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    openAiModel: OPENAI_CONFIG.model,
    port: PORT,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/storage/backup", (req, res) => {
  try {
    const { backupData } = req.body;
    if (!backupData) {
      return res.status(400).json({ error: "Dados de backup vazios." });
    }
    const backupFilePath = path.join(DATA_DIR, "caderno-backup-latest.json");
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf-8");
    return res.json({
      success: true,
      message: "Backup salvo com sucesso no disco do servidor local.",
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Erro ao salvar backup no disco do servidor:", err);
    return res.status(500).json({ error: err.message || "Falha ao salvar backup no servidor." });
  }
});
app.get("/api/storage/backup", (req, res) => {
  try {
    const backupFilePath = path.join(DATA_DIR, "caderno-backup-latest.json");
    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({ error: "Nenhum backup encontrado no disco do servidor." });
    }
    const content = fs.readFileSync(backupFilePath, "utf-8");
    const parsed = JSON.parse(content);
    return res.json({
      success: true,
      backupData: parsed
    });
  } catch (err) {
    console.error("Erro ao ler backup do disco do servidor:", err);
    return res.status(500).json({ error: err.message || "Falha ao recuperar backup." });
  }
});
function generateOfflineLegalResponse(prompt, currentTitle, discipline) {
  const p = prompt.toLowerCase();
  if (p.includes("linha do tempo") || p.includes("tempo") || p.includes("etapas") || p.includes("procedimento")) {
    return {
      text: `### \u23F1\uFE0F Linha do Tempo Processual Esquematizada

**Disciplina:** ${discipline || "Direito Processual"}
**Tema:** ${currentTitle || "Procedimento Legal"}

1. **Fase Postulat\xF3ria / Instaura\xE7\xE3o**
   - In\xEDcio formal com provoca\xE7\xE3o ou not\xEDcia qualificada.
   - An\xE1lise de admissibilidade e pressupostos processuais.

2. **Fase Probat\xF3ria e Instru\xE7\xE3o**
   - Realiza\xE7\xE3o de per\xEDcias, oitiva de testemunhas e declara\xE7\xF5es das partes.
   - Observ\xE2ncia estrita do contradit\xF3rio e da ampla defesa (CF/88, art. 5\xBA, LV).

3. **Alega\xE7\xF5es Finais e Delibera\xE7\xE3o**
   - Apresenta\xE7\xE3o de memoriais pelas partes.
   - Prazos legais preclusivos.

4. **Decis\xE3o / Senten\xE7a e Recursos Cab\xEDveis**
   - Motiva\xE7\xE3o fundamentada das decis\xF5es judiciais (CF/88, art. 93, IX).
   - Abertura de prazo recursal.

*(Gerado localmente pelo motor aut\xF4nomo do Caderno Jur\xEDdico)*`
    };
  }
  if (p.includes("fluxograma") || p.includes("fluxo") || p.includes("ramifica")) {
    return {
      text: `### \u{1F500} Fluxograma Did\xE1tico do Tema: ${currentTitle}

**Ponto de Partida:**
- Ato deflagrador inicial formalizado perante a autoridade competente.

**Ramifica\xE7\xE3o Hipot\xE9tica:**
- **Hip\xF3tese A:** Requisitos preenchidos integralmente \u2794 Prosseguimento imediato do rito regular.
- **Hip\xF3tese B:** V\xEDcio san\xE1vel constatado \u2794 Intima\xE7\xE3o para emenda/corre\xE7\xE3o em prazo espec\xEDfico.
- **Hip\xF3tese C:** In\xE9pcia ou aus\xEAncia manifesta de justa causa \u2794 Rejei\xE7\xE3o liminar ou arquivamento motivado.

**Desfecho:**
- Homologa\xE7\xE3o final ou oferecimento de pe\xE7a acusat\xF3ria/inicial com remessa ao \xF3rg\xE3o competente.

*(Gerado no modo aut\xF4nomo do servidor)*`
    };
  }
  if (p.includes("jurisprud\xEAncia") || p.includes("s\xFAmula") || p.includes("stf") || p.includes("stj")) {
    return {
      text: `### \u2696\uFE0F Jurisprud\xEAncia e Entendimento dos Tribunais Superiores

**Tema Analisado:** ${currentTitle}

- **S\xFAmulas Vinculantes:** Observ\xE2ncia cogente por todos os \xF3rg\xE3os judiciais e administrativos.
- **Padr\xE3o Decis\xF3rio STJ:** Interpreta\xE7\xE3o final da legisla\xE7\xE3o infraconstitucional com foco na proporcionalidade e estrita legalidade.
- **Repercuss\xE3o Geral STF:** Validade dos atos instrut\xF3rios frente \xE0s garantias fundamentais da Constitui\xE7\xE3o da Rep\xFAblica de 1988.

**Recomenda\xE7\xE3o de Estudo:**
Revise os informativos recentes publicados sobre ${discipline || "a disciplina"}.

*(Gerado no modo aut\xF4nomo do servidor)*`
    };
  }
  if (p.includes("pegadinha") || p.includes("prazo")) {
    return {
      text: `### \u26A0\uFE0F Prazos Cr\xEDticos & Pegadinhas de Concursos/OAB

**Tema:** ${currentTitle}

1. **Contagem dos Prazos:** Aten\xE7\xE3o \xE0 contagem em dias corridos vs. dias \xFAteis a depender do ramo do direito (Processo Penal = dias corridos nos termos do art. 798 do CPP; Processo Civil = dias \xFAteis conforme CPC, art. 219).
2. **Prazos Perempt\xF3rios:** Prazos para oferecimento de den\xFAncia, defesas preliminares e recursos n\xE3o admitem prorroga\xE7\xE3o arbitr\xE1ria.
3. **Reserva de Jurisdi\xE7\xE3o:** Medidas cautelares constritivas (intercepta\xE7\xE3o telef\xF4nica, busca e apreens\xE3o domiciliar) dependem estritamente de pr\xE9via ordem judicial fundamentada.

*(Gerado no modo aut\xF4nomo do servidor)*`
    };
  }
  return {
    text: `### \u{1F4DA} Guia Estruturado de Estudo: ${currentTitle}

**Disciplina:** ${discipline || "Direito"}

**Conceitos Fundamentais:**
- O estudo de ${currentTitle} exige aten\xE7\xE3o \xE0 principiologia constitucional aplic\xE1vel, aos artigos expressos na legisla\xE7\xE3o e \xE0 sequ\xEAncia cronol\xF3gica dos atos procedimentais.

**Dica Pr\xE1tica para Caderno:**
- Utilize os blocos de fluxograma do seu caderno para registrar os prazos fatais e exce\xE7\xF5es doutrin\xE1rias.
- Adicione flashcards com perguntas diretas para refor\xE7ar a fixa\xE7\xE3o antes das provas.

*(Modo servidor local ativo)*`
  };
}
async function callGeminiWithRetry(fn, retries = 3, delay = 2e3) {
  try {
    return await fn();
  } catch (error) {
    const status = error?.status || error?.statusCode || error?.response?.status;
    const msg = (error?.message || "").toLowerCase();
    const isTransient = status === 503 || status === 429 || msg.includes("503") || msg.includes("high demand") || msg.includes("overloaded") || msg.includes("unavailable") || msg.includes("resource_exhausted") || msg.includes("rate limit") || msg.includes("temporarily unavailable") || msg.includes("temporarily unable");
    if (retries > 0 && isTransient) {
      console.warn(
        `[Gemini Retry] Erro 503 / alta demanda detectado (${status || "transiente"}). Aguardando ${delay}ms para retentar... (Tentativas restantes: ${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
app.post("/api/gemini/validate-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const testKey = (apiKey ? apiKey : req.headers["x-gemini-key"] || "").toString().trim();
    if (!testKey) {
      return res.status(400).json({
        valid: false,
        error: "Nenhuma chave Google Gemini informada para teste. Digite sua chave."
      });
    }
    const aiClient = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: {
        headers: {
          "User-Agent": "caderno-juridico-selfhosted"
        }
      }
    });
    const response = await callGeminiWithRetry(
      () => aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: 'Responda apenas "OK" para teste de conex\xE3o.'
      })
    );
    const reply = response.text || "";
    if (reply) {
      return res.json({
        valid: true,
        message: "Conex\xE3o com a API do Google Gemini validada com sucesso!"
      });
    }
    return res.status(500).json({
      valid: false,
      error: "Resposta vazia da API do Gemini."
    });
  } catch (error) {
    console.warn("Falha na valida\xE7\xE3o da chave Gemini:", error.message);
    return res.status(400).json({
      valid: false,
      error: error.message || "Falha ao conectar com a API do Google Gemini. Verifique a chave."
    });
  }
});
app.post("/api/gemini/assist", async (req, res) => {
  try {
    const { prompt, currentTitle, discipline, customApiKey, mode } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt \xE9 obrigat\xF3rio." });
    }
    const activeApiKey = (customApiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || "").toString().trim();
    if (mode === "offline" || !activeApiKey) {
      const fallback = generateOfflineLegalResponse(prompt, currentTitle || "Geral", discipline || "Direito");
      return res.json({
        success: true,
        text: fallback.text,
        isOfflineMode: true
      });
    }
    try {
      const aiClient = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "caderno-juridico-selfhosted"
          }
        }
      });
      const systemInstruction = `Voc\xEA \xE9 um Assistente Jur\xEDdico especializado em Direito Brasileiro (Penal, Processual Penal, Constitucional, Civil, etc.), focado em ajudar estudantes e bachar\xE9is a esquematizar aulas, ritos processuais, prazos e jurisprud\xEAncia dos Tribunais Superiores (STF e STJ).
Seja did\xE1tico, preciso, cite artigos pertinentes da legisla\xE7\xE3o brasileira (CPP, CP, CF/88, CPC, etc.) e produza esquemas claros e objetivos.
Quando o usu\xE1rio pedir uma linha do tempo ou fluxo, estruture de forma sequencial com n\xFAmeros, artigos e notas pr\xE1ticas.`;
      const fullPrompt = `Contexto da Mat\xE9ria Atual:
Disciplina: ${discipline || "Direito"}
Tema / Aula: ${currentTitle || "Geral"}

Solicita\xE7\xE3o do Estudante:
${prompt}

Responda em formato claro em Portugu\xEAs do Brasil com explica\xE7\xF5es diretas e artigos de lei.`;
      const response = await callGeminiWithRetry(
        () => aiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: fullPrompt,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        })
      );
      const text = response.text || "Nenhuma resposta gerada.";
      return res.json({
        success: true,
        text,
        isOfflineMode: false
      });
    } catch (genError) {
      console.warn("Gemini API call failed after retries, falling back to local legal template engine:", genError.message);
      const fallback = generateOfflineLegalResponse(prompt, currentTitle || "Geral", discipline || "Direito");
      return res.json({
        success: true,
        text: `${fallback.text}

*(Aviso: A consulta ao Gemini online falhou (${genError.message}). O sistema utilizou o motor de modelos local para n\xE3o interromper seu estudo).*`,
        isOfflineMode: true
      });
    }
  } catch (error) {
    console.error("Gemini Assist Error:", error);
    return res.status(500).json({
      error: error.message || "Erro ao processar consulta."
    });
  }
});
app.post("/api/gemini/flashcards", async (req, res) => {
  try {
    const { currentTitle, discipline, customApiKey, mode, count = 4, notesContext } = req.body;
    const activeApiKey = (customApiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || "").toString().trim();
    if (mode === "offline" || !activeApiKey) {
      return res.json({
        success: true,
        cards: [
          {
            front: `Qual o conceito fundamental e a base legal de ${currentTitle || "deste rito"}?`,
            back: `Trata-se de procedimento previsto na legisla\xE7\xE3o processual/constitucional aplic\xE1vel \xE0 disciplina de ${discipline || "Direito"}.`,
            article: "Legisla\xE7\xE3o Aplic\xE1vel",
            category: "Conceito"
          },
          {
            front: `Quais os prazos perempt\xF3rios associados a ${currentTitle || "este tema"}?`,
            back: `Os prazos devem ser contados estritamente na forma legal (dias corridos no CPP ou dias \xFAteis no CPC), sob pena de preclus\xE3o.`,
            article: "Regra Geral de Prazos",
            category: "Prazos"
          }
        ],
        isOfflineMode: true
      });
    }
    try {
      const aiClient = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "caderno-juridico-selfhosted"
          }
        }
      });
      const prompt = `Gere exatamente ${count} flashcards de fixa\xE7\xE3o para estudo de Direito para a mat\xE9ria "${currentTitle}" (${discipline}).
${notesContext ? `Contexto complementar do caderno: ${notesContext.slice(0, 500)}` : ""}

Estruture CADA flashcard EXATAMENTE com as tags abaixo:
CARD_START
PERGUNTA: [pergunta objetiva, caso hipot\xE9tico ou conceito]
RESPOSTA: [resposta fundamentada na doutrina e jurisprud\xEAncia]
ARTIGO: [artigo de lei exato, ex: CPP, art. 10 ou CF/88, art. 5\xBA, LV]
CATEGORIA: [ex: Conceito, Prazos, Compet\xEAncia, Jurisprud\xEAncia]
CARD_END`;
      const response = await callGeminiWithRetry(
        () => aiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.4
          }
        })
      );
      const rawText = response.text || "";
      const cards = [];
      const blocks = rawText.split("CARD_START");
      for (const block of blocks) {
        if (!block.includes("PERGUNTA:")) continue;
        const frontMatch = block.match(/PERGUNTA:\s*([^\n]+)/i);
        const backMatch = block.match(/RESPOSTA:\s*([\s\S]+?)(?=ARTIGO:|CATEGORIA:|CARD_END|$)/i);
        const artMatch = block.match(/ARTIGO:\s*([^\n]+)/i);
        const catMatch = block.match(/CATEGORIA:\s*([^\n]+)/i);
        if (frontMatch && backMatch) {
          cards.push({
            front: frontMatch[1].trim(),
            back: backMatch[1].trim(),
            article: artMatch ? artMatch[1].trim() : "Legisla\xE7\xE3o",
            category: catMatch ? catMatch[1].trim() : "Geral"
          });
        }
      }
      if (cards.length === 0) {
        cards.push({
          front: `Fixa\xE7\xE3o: Qual o ponto central de ${currentTitle}?`,
          back: rawText.slice(0, 300),
          article: discipline || "Legisla\xE7\xE3o",
          category: "Resumo IA"
        });
      }
      return res.json({
        success: true,
        cards,
        isOfflineMode: false
      });
    } catch (genError) {
      console.warn("Gemini Flashcards generation failed, using fallback:", genError.message);
      return res.json({
        success: true,
        cards: [
          {
            front: `Conceito e finalidade: ${currentTitle}`,
            back: `Mat\xE9ria de ${discipline}. Consulte o c\xF3digo e anota\xE7\xF5es para detalhes.`,
            article: "Legisla\xE7\xE3o",
            category: "Geral"
          }
        ],
        isOfflineMode: true
      });
    }
  } catch (error) {
    console.error("Flashcards API Error:", error);
    return res.status(500).json({ error: error.message });
  }
});
async function callOpenAiWithLimitedRetry(fn, retries = 1, delay = 2e3) {
  try {
    return await fn();
  } catch (error) {
    const status = error?.status || error?.statusCode;
    const msg = (error?.message || "").toLowerCase();
    const isTransient = status === 503 || status === 429 || status === 500 || msg.includes("rate limit") || msg.includes("overloaded") || msg.includes("temporarily unavailable");
    if (retries > 0 && isTransient) {
      console.warn(
        `[OpenAI Retry] Erro transit\xF3rio detectado (${status || "indispon\xEDvel"}). Aguardando ${delay}ms para 1 retentativa controlada...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callOpenAiWithLimitedRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
async function extractTextFromBuffer(buffer, fileName, mimeType) {
  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();
  if (lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text || "";
    } finally {
      try {
        await parser.destroy();
      } catch {
      }
    }
  }
  if (lowerName.endsWith(".docx") || lowerMime.includes("wordprocessingml") || lowerMime.includes("docx")) {
    const docxResult = await mammoth.extractRawText({ buffer });
    return docxResult.value || "";
  }
  return buffer.toString("utf-8");
}
function generateOfflineDocumentAnalysis(text, fileName, reason) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const textSample = text.slice(0, 15e3);
  const articleMatches = Array.from(
    new Set(
      Array.from(
        textSample.matchAll(/(?:art(?:igo|\.)?\s*\d+[\wº\-\.]*|lei\s*(?:n[ºo\.]?)?\s*[\d\.\/]+|cf\/88|cpc|cpp|cp|clt)/gi)
      ).map((m) => m[0].toUpperCase())
    )
  ).slice(0, 8);
  const autorMatch = textSample.match(/(?:autor|requerente|exequente|agravante|apelante|impetrante)\s*[:\-]?\s*([^\n\r,\.;]+)/i);
  const reuMatch = textSample.match(/(?:r[ée]u|requerido|executado|agravado|apelado|impetrado)\s*[:\-]?\s*([^\n\r,\.;]+)/i);
  return {
    id: `offline-analysis-${Date.now()}`,
    fileName,
    analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
    modelUsed: "offline-local-heuristic",
    isOfflineFallback: true,
    resumoExecutivo: `Documento "${fileName}" processado localmente em modo aut\xF4nomo offline (${reason}). Foram identificadas aproximadamente ${lines.length} linhas de conte\xFAdo textual. Para an\xE1lise sem\xE2ntica profunda via IA, configure a vari\xE1vel OPENAI_API_KEY no ambiente do servidor.`,
    partes: {
      poloAtivo: autorMatch ? [autorMatch[1].trim()] : ["[N\xE3o identificado explicitamente nos trechos analisados]"],
      poloPassivo: reuMatch ? [reuMatch[1].trim()] : ["[N\xE3o identificado explicitamente nos trechos analisados]"],
      terceiros: ["[N\xE3o informado expressamente no documento]"]
    },
    objeto: lines.find((l) => /ação|pedido|mandado|habeas|recurso|requerimento/i.test(l)) || "[Objeto n\xE3o discriminado em linha direta; requer confer\xEAncia t\xE9cnica]",
    pedidos: [
      'An\xE1lise em modo offline local: localize a se\xE7\xE3o final "Dos Pedidos" no texto original.',
      "Sinaliza\xE7\xE3o: conclus\xF5es dependem de valida\xE7\xE3o presencial por advogado habilitado."
    ],
    fatosRelevantes: lines.slice(0, 5).map((l) => l.slice(0, 160)),
    decisoes: ["[N\xE3o identificado provimento judicial nos cabe\xE7alhos; verifique dispositivo final]"],
    provas: ["[Documentos e anexos referenciados nos autos; consultar pe\xE7as instrut\xF3rias]"],
    inconsistencias: [
      "Processamento em modo offline: verifica\xE7\xE3o sem\xE2ntica de diverg\xEAncias requer API OpenAI conectada."
    ],
    fundamentosJuridicos: articleMatches.length > 0 ? articleMatches : ["[Dispositivos legais identificados dependem de confer\xEAncia dos autos integrais]"],
    providenciasSugeridas: [
      "Conferir prazos processuais no di\xE1rio oficial ou sistema eletr\xF4nico do tribunal.",
      "Validar tempestividade e procura\xE7\xE3o com poderes espec\xEDficos nos autos.",
      "Submeter relat\xF3rio \xE0 confer\xEAncia formal de profissional do Direito."
    ],
    alertasValidacao: [
      "ATEN\xC7\xC3O: An\xE1lise gerada pelo motor de conting\xEAncia offline local do NoteJuris.",
      "N\xE3o substitui a consulta nem a an\xE1lise t\xE9cnica por advogado devidamente inscrito na OAB.",
      "Informa\xE7\xF5es ausentes n\xE3o foram presumidas nem inventadas."
    ],
    tokensUsage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    }
  };
}
app.get("/api/openai/status", (req, res) => {
  res.json({
    status: "online",
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    model: OPENAI_CONFIG.model,
    maxTokens: OPENAI_CONFIG.maxTokens,
    temperature: OPENAI_CONFIG.temperature,
    supportedFormats: ["pdf", "docx", "txt", "md"],
    maxFileSizeMb: 15
  });
});
app.post("/api/openai/analyze-document", async (req, res) => {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers["x-user-id"];
    const clientSession = req.headers["x-client-session"];
    const isAuthenticated = Boolean(
      authHeader && authHeader.startsWith("Bearer ") || userIdHeader || clientSession
    );
    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Acesso n\xE3o autorizado. \xC9 necess\xE1rio estar autenticado para realizar a an\xE1lise de documentos jur\xEDdicos."
      });
    }
    const { fileName, fileType, fileData, text, forceOffline } = req.body;
    if (!text && !fileData) {
      return res.status(400).json({
        error: "Nenhum documento ou texto fornecido para an\xE1lise. Envie um arquivo PDF, DOCX, TXT ou insira o texto."
      });
    }
    const cleanFileName = (fileName || "documento-juridico.txt").toString().slice(0, 120);
    let extractedText = "";
    let rawFileSize = 0;
    if (fileData) {
      const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      const fileBuffer = Buffer.from(base64Data, "base64");
      rawFileSize = fileBuffer.length;
      const MAX_FILE_SIZE = 15 * 1024 * 1024;
      if (rawFileSize > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: `O arquivo enviado (${(rawFileSize / (1024 * 1024)).toFixed(1)} MB) excede o limite m\xE1ximo permitido de 15 MB.`
        });
      }
      try {
        extractedText = await extractTextFromBuffer(fileBuffer, cleanFileName, fileType);
      } catch (parseError) {
        console.error("[Document Extraction Error]: Falha ao extrair texto do arquivo");
        return res.status(422).json({
          error: `N\xE3o foi poss\xEDvel extrair o conte\xFAdo do arquivo "${cleanFileName}". Certifique-se de que o arquivo n\xE3o est\xE1 corrompido ou protegido por senha.`
        });
      }
    } else if (text) {
      extractedText = String(text);
      rawFileSize = Buffer.byteLength(extractedText, "utf-8");
    }
    extractedText = extractedText.trim();
    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({
        error: "O documento n\xE3o cont\xE9m texto leg\xEDvel suficiente para an\xE1lise (m\xEDnimo de 20 caracteres leg\xEDveis)."
      });
    }
    let textToAnalyze = extractedText;
    let wasTruncated = false;
    const MAX_CHARACTERS = 9e4;
    if (textToAnalyze.length > MAX_CHARACTERS) {
      wasTruncated = true;
      textToAnalyze = textToAnalyze.slice(0, 55e3) + "\n\n[... TRECHO INTERMEDI\xC1RIO DO DOCUMENTO SUPRIMIDO PARA CONTROLE DE CONSUMO E CUSTO ...]\n\n" + textToAnalyze.slice(-35e3);
    }
    const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "";
    if (!apiKey || forceOffline) {
      const offlineResult = generateOfflineDocumentAnalysis(
        textToAnalyze,
        cleanFileName,
        !apiKey ? "chave OPENAI_API_KEY n\xE3o configurada no servidor" : "modo offline solicitado"
      );
      console.log(
        `[Document Analysis] Modo offline processado: arquivo="${cleanFileName}", bytes=${rawFileSize}, truncado=${wasTruncated}, tempo=${Date.now() - startTime}ms`
      );
      return res.json({
        success: true,
        analysis: offlineResult
      });
    }
    const openai = new OpenAI({ apiKey });
    const systemPrompt = `Voc\xEA \xE9 um perito s\xEAnior em an\xE1lise t\xE9cnica e processual de autos e documentos jur\xEDdicos brasileiros.
Sua miss\xE3o \xE9 gerar um relat\xF3rio anal\xEDtico estruturado e estritamente fidedigno aos fatos e termos expostos no documento fornecido.

DIRETRIZES DE RIGOR T\xC9CNICO E CONTEN\xC7\xC3O (OBRIGAT\xD3RIAS):
1. FIDELIDADE ABSOLUTA: Jamais invente ou presuma artigos de lei, n\xFAmeros de processo, jurisprud\xEAncias, s\xFAmulas, datas, p\xE1ginas, nomes ou prazos n\xE3o explicitamente contidos no documento.
2. INFORMA\xC7\xC3O AUSENTE: Se qualquer elemento (ex.: decis\xE3o interlocut\xF3ria, pedido liminar, provas, prazos, nome de patrono) n\xE3o constar expressamente no texto analisado, registre explicitamente: "[N\xE3o informado no documento]".
3. INCONSIST\xCANCIAS E CONTRADI\xC7\xD5ES: Identifique potenciais incoer\xEAncias de datas, teses conflitantes, omiss\xF5es de documentos essenciais ou obscuridades apontadas no texto com sobriedade anal\xEDtica.
4. ALERTA DE VALIDA\xC7\xC3O: Toda conclus\xE3o e provid\xEAncia sugerida possui car\xE1ter informativo e preparat\xF3rio, devendo conter expressamente a ressalva de que depende de valida\xE7\xE3o privativa por advogado ou operador do direito habilitado.
5. RESPOSTA EM JSON: Responda ESTRITAMENTE em formato JSON v\xE1lido contendo exatamente as chaves abaixo:
{
  "resumoExecutivo": "string (resumo sint\xE9tico e neutro do documento)",
  "partes": {
    "poloAtivo": ["string"],
    "poloPassivo": ["string"],
    "terceiros": ["string"]
  },
  "objeto": "string (objeto da lide ou finalidade central da pe\xE7a)",
  "pedidos": ["string"],
  "fatosRelevantes": ["string"],
  "decisoes": ["string"],
  "provas": ["string"],
  "inconsistencias": ["string"],
  "fundamentosJuridicos": ["string"],
  "providenciasSugeridas": ["string"],
  "alertasValidacao": ["string"]
}`;
    const userPrompt = `Documento Jur\xEDdico Analisado: "${cleanFileName}"
${wasTruncated ? "(Aviso: Documento extenso; trechos centrais foram condensados mantendo relat\xF3rio e pedidos)" : ""}

CONTE\xDADO DO DOCUMENTO:
---
${textToAnalyze}
---

Gere a an\xE1lise t\xE9cnica completa em conformidade com o formato JSON solicitado.`;
    const completion = await callOpenAiWithLimitedRetry(
      () => openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    );
    const rawResponse = completion.choices[0]?.message?.content || "{}";
    let parsedJson = {};
    try {
      parsedJson = JSON.parse(rawResponse);
    } catch (jsonErr) {
      console.error("[OpenAI JSON Parse Error]: Falha ao interpretar resposta estruturada da OpenAI");
      return res.status(502).json({
        error: "A IA respondeu com formato inv\xE1lido. Tente novamente."
      });
    }
    const analysis = {
      id: `analysis-${Date.now()}`,
      fileName: cleanFileName,
      analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
      modelUsed: completion.model || OPENAI_CONFIG.model,
      isOfflineFallback: false,
      resumoExecutivo: parsedJson.resumoExecutivo || "An\xE1lise t\xE9cnica conclu\xEDda.",
      partes: {
        poloAtivo: Array.isArray(parsedJson.partes?.poloAtivo) ? parsedJson.partes.poloAtivo : ["[N\xE3o informado no documento]"],
        poloPassivo: Array.isArray(parsedJson.partes?.poloPassivo) ? parsedJson.partes.poloPassivo : ["[N\xE3o informado no documento]"],
        terceiros: Array.isArray(parsedJson.partes?.terceiros) ? parsedJson.partes.terceiros : ["[N\xE3o informado no documento]"]
      },
      objeto: parsedJson.objeto || "[N\xE3o informado no documento]",
      pedidos: Array.isArray(parsedJson.pedidos) ? parsedJson.pedidos : ["[N\xE3o informado no documento]"],
      fatosRelevantes: Array.isArray(parsedJson.fatosRelevantes) ? parsedJson.fatosRelevantes : [],
      decisoes: Array.isArray(parsedJson.decisoes) ? parsedJson.decisoes : ["[N\xE3o informado no documento]"],
      provas: Array.isArray(parsedJson.provas) ? parsedJson.provas : ["[N\xE3o informado no documento]"],
      inconsistencias: Array.isArray(parsedJson.inconsistencias) ? parsedJson.inconsistencias : [],
      fundamentosJuridicos: Array.isArray(parsedJson.fundamentosJuridicos) ? parsedJson.fundamentosJuridicos : ["[N\xE3o informado no documento]"],
      providenciasSugeridas: Array.isArray(parsedJson.providenciasSugeridas) ? parsedJson.providenciasSugeridas : [],
      alertasValidacao: [
        ...Array.isArray(parsedJson.alertasValidacao) ? parsedJson.alertasValidacao : [],
        "Relat\xF3rio gerado por intelig\xEAncia artificial para apoio preparat\xF3rio de estudo e triagem.",
        "As conclus\xF5es n\xE3o substituem parecer jur\xEDdico nem atua\xE7\xE3o privativa de advogado habilitado perante a OAB."
      ],
      tokensUsage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      }
    };
    const duration = Date.now() - startTime;
    console.log(
      `[OpenAI Analysis] Sucesso: arquivo="${cleanFileName}", modelo=${analysis.modelUsed}, tokens=${completion.usage?.total_tokens || 0}, tempo=${duration}ms`
    );
    return res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("[OpenAI Analysis Error]:", error?.message || "Erro inesperado");
    return res.status(error?.status || 500).json({
      error: error?.message || "Falha ao processar an\xE1lise do documento via OpenAI."
    });
  }
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(` Caderno Jur\xEDdico \u2014 Servidor Auto-Hospedado Ativo!`);
    console.log(` Rodando em: http://0.0.0.0:${PORT}`);
    console.log(` Modo independente do Google Cloud: ATIVADO`);
    console.log(`=======================================================`);
  });
}
startServer();
