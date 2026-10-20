# Arquitetura Técnica Oficial e Stack de Ferramentas: SaaS Fábrica de Vídeos IA

> **Localização do Projeto:** `e:\SISTEMAS\CRIAR VIDEOS\saas_videos\`  
> **Status:** Documento Oficial de Início de Desenvolvimento  
> **Versão:** 1.0.0  
> **Público:** Desenvolvedores, IAs e Arquitetos de Software

---

## 1. Verificação Prévia do Ambiente Local (Host Diagnóstico)

Antes de iniciar qualquer código, verificamos as dependências do sistema operacional:

| Componente | Versão Detectada no Sistema | Status | Utilidade no SaaS |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.20.0` | ✅ Pronto (Atende > v22) | Execução do Remotion, HyperFrames e API Web |
| **NPM** | `11.19.0` | ✅ Pronto | Gerenciamento de pacotes Node |
| **Python** | `3.14.7` | ✅ Pronto | Whisper, scripts de IA e VoiceStudio microservices |
| **FFmpeg** | `9.0.2-full_build` | ✅ Pronto no PATH | Processamento de áudio/vídeo, cortes e QA Visual |
| **Google Chrome** | `C:\Program Files\Google\Chrome` | ✅ Pronto | Renderizador Headless (Chromium/Puppeteer) |

---

## 2. Stack Tecnológica Completa

A arquitetura foi desenhada para ser modular, de altíssimo desempenho e sem custos desnecessários de infraestrutura no início.

```mermaid
graph TB
    subgraph Frontend_App [Frontend - Vite + React 19 + TypeScript]
        Dashboard[Painel de Controle / Dashboard]
        WizardFlow[Wizard de Criação em 6 Etapas]
        RemotionPlayerView[@remotion/player - Preview Interativo em 60 FPS]
        SceneEditor[Ajustes de Safe Zone, Cores e Tipografia]
    end

    subgraph Backend_Gateway [Backend & Orquestrador - Node.js / Express]
        API[API REST & WebSockets para Progresso em Tempo Real]
        QueueManager[Fila de Renderização & Tarefas Assíncronas]
        DB[(Banco de Dados SQLite / Drizzle ORM)]
    end

    subgraph AI_Intelligence [Motores de Inteligência e Visão]
        GeminiVision[Google Gemini 1.5/2.0 API: Visão Multimodal de Vídeo]
        ClaudeBrain[Claude 3.5 Sonnet: Roteirista & Diretor de Cena]
        WhisperAudio[Faster-Whisper: Timestamps no Nível da Palavra]
        VoiceStudioEngine[VoiceStudio / OmniVoice: Vozes Locais & Clonagem]
    end

    subgraph Rendering_Core [Motores de Renderização e QA]
        RemotionEngine[@remotion/renderer: Renderização Programática MP4]
        HyperFramesEngine[HyperFrames CLI: Renderização de HTML/CSS]
        FFmpegWorker[FFmpeg 9.0.2: Mixagem, Ducking e Extração de Stills]
        QAInspector[Agente de QA Visual: Inspeção Automática de Erros]
    end

    Frontend_App <--> API
    API --> QueueManager
    QueueManager --> GeminiVision
    QueueManager --> ClaudeBrain
    QueueManager --> WhisperAudio
    QueueManager --> VoiceStudioEngine
    QueueManager --> RemotionEngine
    RemotionEngine --> FFmpegWorker
    FFmpegWorker --> QAInspector
    QAInspector --> Storage[(Armazenamento Local por Projeto)]
    Storage --> Frontend_App
```

### 2.1. Frontend (Interface Web do Usuário)
- **Bundler & Framework:** **Vite** com **React 19** e **TypeScript**.
- **Estilização:** **Tailwind CSS** com design moderno (dark mode elegante, glassmorphism sutil, tipografia Inter/Outfit e micro-animações).
- **Player de Vídeo Nativo:** **`@remotion/player`**, permitindo reproduzir a timeline do vídeo no navegador em tempo real com controle de velocidade, pausa e scrubber sem renderizar arquivo MP4 a cada clique.
- **Ícones:** **Lucide React**.
- **Gerenciamento de Estado:** **Zustand** (leve, reativo e ideal para sincronizar o estado da timeline do vídeo com os controles da interface).

### 2.2. Backend & Orquestração
- **Servidor API:** **Node.js com Express e TypeScript** (rápido, tipado e com integração nativa às bibliotecas do Remotion).
- **Banco de Dados:** **SQLite com Drizzle ORM** (armazenamento local rápido, sem necessidade de configurar bancos externos como Docker/Postgres no início, com fácil migração futura).
- **Fila Assíncrona:** Fila leve de processamento concorrente em memória/SQLite para gerenciar múltiplos renders sem travar a interface.

### 2.3. Motores Gráficos & Composição de Vídeo
- **Remotion Core (`@remotion/renderer` + `@remotion/bundler`):**
  - Motor central de composição matemática.
  - Suporte completo a **Vertical (1080x1920 - 9:16)**, **Horizontal (1920x1080 - 16:9)** e **Quadrado (1080x1080 - 1:1)**.
- **Biblioteca de Componentes Visuais (Importados do `OpenMontage`):**
  - `ScreenshotScene`: Transforma capturas estáticas de sites/SaaS em gravações animadas com cursor humano, pulsos de clique e caixas de destaque.
  - `TerminalScene`: Gravação sintética de linha de comando com syntax highlighting.
  - `BarChart`, `LineChart`, `PieChart`, `KPIGrid`: Gráficos animados orientados a dados.
  - `ComparisonCard`: Comparativos lado a lado de produtos.
- **Biblioteca de Motion (Catálogo `awesome-opus5-5-videos`):**
  - Módulos de animação pura em Canvas, Three.js, SVG e GSAP injetados dinamicamente sem erro de layout.

### 2.4. Áudio, Narração e Foley
- **Transcrições e Legendas:** `faster-whisper` em Python / subprocesso com timestamps por palavra.
- **Vozes Locais Ilimitadas:** Conexão com o backend do `VoiceStudio` (OmniVoice) para clonagem de voz e *Voice Design* gratuito.
- **Vozes Rápidas em Massa:** `Edge-TTS` para geração instantânea de vídeos curtos.
- **Mixagem de Áudio:** FFmpeg com filtro `sidechain` para *auto-ducking* (o volume da música abaixa suavemente quando a voz fala).

### 2.5. Inteligência de Roteiro e Análise de Vídeo
- **Visão Multimodal:** API do Google Gemini (para ingerir a URL do YouTube de referência, assistir aos quadros visuais e extrair o Blueprint da retenção).
- **Roteirização e Direção:** Claude 3.5 Sonnet / OpenAI GPT-4o (para transformar o Blueprint em roteiro autoral inédito com +15% de duração de segurança).

---

## 3. Estrutura de Pastas Oficial do Projeto (`saas_videos`)

A estrutura dentro de `e:\SISTEMAS\CRIAR VIDEOS\saas_videos\` será organizada no modelo **Monorepo Limpo**:

```text
saas_videos/
├── package.json                   # Dependências globais e scripts de inicialização
├── tsconfig.json                  # Configuração global de TypeScript
├── .env.example                   # Chaves de API (Gemini, Claude, etc.)
│
├── frontend/                      # Aplicação Web (Painel do Usuário)
│   ├── index.html
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/            # Componentes de UI (Botões, Modais, Cards)
│   │   ├── wizard/                # As 6 Etapas do Assistente de Criação
│   │   │   ├── Step1Topic.tsx     # Tema & Link de Referência
│   │   │   ├── Step2Format.tsx    # Formato (9:16 vs 16:9) e Duração
│   │   │   ├── Step3Brand.tsx     # Cores, Logo e Tipografia
│   │   │   ├── Step4Assets.tsx    # Upload de Arquivos Próprios
│   │   │   ├── Step5Audio.tsx     # Voz, Música e Estilo de Legenda
│   │   │   └── Step6Review.tsx    # Aprovação Prévia do Storyboard
│   │   ├── player/                # Remotion Player com controles interativos
│   │   └── stores/                # Estados Zustand do Projeto
│   └── tailwind.config.js
│
├── backend/                       # Servidor de API e Orquestração
│   ├── src/
│   │   ├── server.ts              # Ponto de entrada Express
│   │   ├── routes/                # Rotas REST (/api/projects, /api/render, /api/analyze)
│   │   ├── services/
│   │   │   ├── geminiVision.ts    # Analisador de vídeo de referência
│   │   │   ├── claudeScript.ts    # Gerador de roteiro autoral com margem de tempo
│   │   │   ├── whisperService.ts  # Transcrição fonética palavra por palavra
│   │   │   └── qaInspector.ts     # Auto-Inspeção Visual via FFmpeg
│   │   ├── queue/                 # Fila de renderização assíncrona
│   │   └── db/                    # Esquema SQLite e operações de banco
│
├── remotion/                      # Composições de Vídeo (Remotion Studio)
│   ├── Root.tsx                   # Registro de Composições
│   ├── compositions/
│   │   ├── ExplainerVideo.tsx     # Vídeos explicativos / institucionais
│   │   ├── ShortsTikTok.tsx       # Vídeos verticais de alta retenção
│   │   └── ScreenDemoVideo.tsx    # Demos de SaaS com capturas animadas
│   ├── scenes/                    # Componentes visuais portados do OpenMontage
│   │   ├── ScreenshotScene.tsx    # Navegação simulada com cursor
│   │   ├── TerminalScene.tsx      # Terminal animado
│   │   ├── BarChartScene.tsx      # Gráficos de barras animados
│   │   └── StatCardScene.tsx      # Cards de métricas numéricas
│   ├── subtitles/                 # Estilos de Legenda (Pílula, Karaokê, Caixa)
│   └── templates/                 # Moldes de motion de awesome-opus5-5-videos
│
└── storage/                       # Diretório Isolado de Armazenamento
    └── projects/                  # Cada vídeo possui sua pasta hermética
        └── {project_id}/
            ├── assets/            # Imagens, logos e áudios enviados
            ├── script.json        # Roteiro e storyboard aprovado
            ├── stills/            # Fotos extraídas pelo FFmpeg para QA
            └── output.mp4         # Vídeo final entregue ao usuário
```

---

## 4. Contrato de Dados Central: `ProjectConfig` (Schema JSON)

Toda a fábrica opera a partir de um contrato JSON estrito que trafega entre o Frontend, as IAs e o Motor de Renderização:

```json
{
  "projectId": "proj_98a7fbc2",
  "title": "Como Funciona a IA em 60 Segundos",
  "targetFormat": {
    "aspectRatio": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 60,
    "targetDurationSeconds": 60,
    "scriptSafetyBufferSeconds": 10
  },
  "brand": {
    "primaryColor": "#6366F1",
    "secondaryColor": "#10B981",
    "backgroundColor": "#090D16",
    "fontFamily": "Inter",
    "logoUrl": "/storage/projects/proj_98a7fbc2/assets/logo.png"
  },
  "audio": {
    "voiceEngine": "voice_studio_local",
    "voiceId": "narrador_documentario_01",
    "bgMusicTrack": "cinematic_ambient_03.mp3",
    "bgMusicVolume": 0.12,
    "autoDucking": true,
    "subtitleStyle": "pilula",
    "subtitleSafeZoneY": 1440
  },
  "scenes": [
    {
      "sceneId": "scene_01",
      "type": "hero_title",
      "durationInFrames": 180,
      "text": "O Segredo Que Mudou Tudo",
      "narration": "Você sabia que 90% das pessoas usam IA da forma errada?",
      "visualDirective": "zoom_in_ken_burns",
      "sfx": "sub_bass_impact.mp3"
    },
    {
      "sceneId": "scene_02",
      "type": "screenshot_synthetic",
      "durationInFrames": 360,
      "backgroundImage": "dashboard_print.png",
      "simulatedCursor": {
        "start": [0.1, 0.9],
        "end": [0.55, 0.42],
        "clickAtFrame": 120
      },
      "narration": "Com apenas um clique, o sistema analisa a tela inteira."
    }
  ],
  "qaStatus": {
    "stillsExtracted": 6,
    "inspected": true,
    "safeZoneViolations": 0,
    "textOverlapErrors": 0,
    "readyForDelivery": true
  }
}
```

---

## 5. Roteiro de Execução Técnica (Sprints de Desenvolvimento)

- **Sprint 1 — Fundação do Projeto (`saas_videos/`):**
  - Inicialização do monorepo e instalação dos pacotes essenciais (`remotion`, `@remotion/player`, `@remotion/renderer`, `express`, `drizzle-orm`, `zustand`, `lucide-react`).
- **Sprint 2 — Integração do Remotion Player & Componentes de Cena:**
  - Importação e validação dos componentes visuais do `OpenMontage` (`ScreenshotScene`, `TerminalScene`, `StatCard`).
  - Criação dos componentes de legenda com safe zone calculada para 9:16 e 16:9.
- **Sprint 3 — Interface do Usuário (Wizard em 6 Etapas):**
  - Implementação dos formulários guiados de tema, formato, brand kit, upload de ativos e aprovação de storyboard.
- **Sprint 4 — Motores de IA & Ingestão de Referência:**
  - Conexão do serviço de visão Gemini com a extração do Blueprint de vídeo e o gerador de roteiro autoral Claude.
- **Sprint 5 — Worker de Renderização & Auto-Inspeção Visual (QA com FFmpeg):**
  - Pipeline de exportação em MP4 e rotina de validação visual de frames antes da entrega.
