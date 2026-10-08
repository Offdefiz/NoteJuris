# ⚖️ Caderno Jurídico — Servidor Próprio & Auto-Hospedado

Um ambiente de estudos jurídicos completo, interativo e visual (linhas do tempo processuais, fluxogramas de ritos, flashcards de repetição espaçada e fichamentos), projetado para rodar de forma **100% independente do Google Cloud e do Google AI Studio**.

---

## 🚀 Como Baixar e Executar no seu Servidor

Você pode baixar este projeto e executá-lo em qualquer máquina ou servidor (Linux, macOS, Windows, VPS, Raspberry Pi ou Docker).

### Pré-requisitos
- **Node.js** (versão 18 ou superior) e **npm**; ou
- **Docker** e **Docker Compose** (opcional, para execução em container).

---

### Opção 1: Executando com Node.js (Recomendado para uso rápido)

1. **Baixe ou clone o projeto** para o seu computador/servidor:
   ```bash
   git clone <URL_DO_REPOSITORIO> caderno-juridico
   cd caderno-juridico
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em: **`http://localhost:3000`**.

4. **Para produção (Servidor Linux / VPS / PM2)**:
   ```bash
   # Compilar os arquivos do frontend
   npm run build

   # Iniciar o servidor de produção
   npm start
   ```

---

### Opção 2: Executando com Docker & Docker Compose (Ideal para VPS / Home Server)

O projeto já inclui um `Dockerfile` e `docker-compose.yml` prontos para produção.

1. **Suba o container com um comando**:
   ```bash
   docker compose up -d --build
   ```

2. **Acesse no navegador**:
   ```
   http://seu-servidor-ou-ip:3000
   ```

3. **Para parar o container**:
   ```bash
   docker compose down
   ```

---

## 🔒 100% Autônomo e Independente de Nuvem

- **Sem Dependência da Google Cloud:** O aplicativo não requer Firebase ou serviços externos da Google Cloud para funcionar.
- **Autenticação Local:** O sistema de login e perfis é gerenciado de forma independente pelo próprio aplicativo com armazenamento local no navegador.
- **Backup e Restauração em 1 Clique:**
  - Clique no ícone de **Download / Exportar** na barra superior.
  - Selecione **"Backup de Todo o Caderno"** para baixar um arquivo `.json` com todas as suas matérias, disciplinas, fluxogramas e flashcards.
  - Você pode levar esse arquivo para qualquer outro navegador ou servidor e restaurá-lo instantaneamente.

---

## 🤖 Como Funciona a Inteligência Artificial / Assistente

O assistente foi desenhado com total flexibilidade para você nunca ficar preso a uma plataforma:

1. **Modo Offline (Sem Dependência de IA ou Internet):**
   - Ativo por padrão se nenhuma chave for configurada.
   - Gera esquemas estruturados instantâneos (linhas do tempo, fluxogramas, jurisprudência, prazos críticos e questões com gabarito) usando o motor de templates jurídicos embutido no servidor.

2. **Chave Própria (BYOK - Bring Your Own Key):**
   - Caso queira respostas dinâmicas em tempo real com a IA do Google Gemini, você pode:
     - Adicionar `GEMINI_API_KEY="sua_chave"` no arquivo `.env` do seu servidor; OU
     - Clicar no botão **⚙️ Configurações** dentro do assistente na interface e colar sua chave pessoal. Ela ficará salva com segurança apenas no seu navegador.

---

## 📂 Estrutura dos Arquivos

```
├── Dockerfile              # Imagem Docker de produção
├── docker-compose.yml      # Configuração para subir em 1 comando
├── server.ts               # Servidor Express independente com API de backup e status
├── src/
│   ├── components/         # Linha do tempo, fluxograma, flashcards, barra de navegação
│   ├── context/            # Autenticação local e controle de tema (claro/escuro)
│   ├── data/               # Dados jurídicos iniciais e matérias padrão
│   ├── types/              # Definições TypeScript
│   └── App.tsx             # Aplicação principal
├── package.json
└── README.md
```

Pronto para estudar e organizar suas matérias com total privacidade e independência!
