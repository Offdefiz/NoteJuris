// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
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
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const text = response.text || "Nenhuma resposta gerada.";
      return res.json({
        success: true,
        text,
        isOfflineMode: false
      });
    } catch (genError) {
      console.warn("Gemini API call failed, falling back to local legal template engine:", genError.message);
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
