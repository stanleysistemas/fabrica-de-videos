# Documentação Técnica e Arquitetural: SaaS Fábrica de Vídeos IA

> **Status:** Especificação Técnica de Produto & Engenharia  
> **Versão:** 1.0.0  
> **Origem dos Ativos Integrados:** `OpenMontage`, `awesome-opus5-5-videos`, `VOX`, `VoiceStudio`, `MoneyPrinterTurbo` e `E:\SISTEMAS\saas_videos\`

---

## 1. Visão Geral do SaaS e Proposta de Valor

O objetivo é transformar a coleção de ferramentas e repositórios existentes em uma **plataforma SaaS unificada de geração e edição programática de vídeos**, permitindo a criadores, times de marketing e desenvolvedores produzirem vídeos de alta retenção sem necessidade de gravação tradicional ou softwares manuais como Premiere/CapCut.

### As 6 Linhas de Produção da Fábrica:
1. **Linha 1 — Vídeo de Referência Viral (Multimodal & Blueprint):**  
   Análise de vídeos virais de concorrentes (YouTube/TikTok), extração de blueprint de retenção e recriação de roteiro com +15% de margem de fala e preview Remotion.
2. **Linha 2 — Notícia / Artigo para Vídeo (URL to Video):**  
   Extração inteligente de blogs e portais (ex: Call of Duty, portais tech/games), download de imagens HD, animação Ken Burns 2.5D, roteirização com gancho e painel de aprovação do usuário.
3. **Linha 3 — Avatar Studio & Apresentador Virtual (Talking Head / Streamer Layout):**  
   Gestão de avatares com base em fotos foto-realistas (ex: streamer gamer de meia idade no estúdio com monitores e microfone), com sincronia labial e layout de webcam alternada.
4. **Linha 4 — Laboratório de Vozes (VoiceStudio & Voice Vault):**  
   Clonagem local com 5s de áudio ou Voice Design por texto com custo $0 na máquina (aceleração Intel i5-13500 20T GGUF ou NVIDIA CUDA) com fallback ElevenLabs.
5. **Linha 5 — Thumbnail Studio Viral:**  
   Composição de capas de alto clique (CTR) com recorte do avatar, iluminação de contorno (rim light), títulos chamativos e conexão com APIs gratuitas / ComfyUI local.
6. **Linha 6 — Demos Sintéticas & Motion Graphics (`OpenMontage` + `awesome-opus5-5-videos` + `VOX`):**  
   Cenas com terminal, gráficos animados, mockups de celular e efeitos sonoros ASMR de papel, fita e cliques de teclado.

---

## 2. Roteiro de Execução Ordenado (Um Passo por Vez)

| Etapa | Módulo | Status | Descrição e Escopo |
| :--- | :--- | :--- | :--- |
| **Passo 1** | **Sidebar / Menu Geral Modular** | 🟡 **Em Execução** | Estruturação de menu lateral retrátil com navegação limpa para evitar sobrecarga de opções. |
| **Passo 2** | **Módulo Notícia / URL to Video** | ⏳ Próximo | Scraper de matérias (Call of Duty / notícias), extração de fotos, roteiro IA com aprovação e Ken Burns. |
| **Passo 3** | **Avatar Studio (Apresentador Gamer)** | ⏳ Planejado | Cadastro de avatares (foto do streamer), associação de voz e cenas de webcam intercaladas no Remotion. |
| **Passo 4** | **Thumbnail Studio Viral** | ⏳ Planejado | Criação de capas com recorte automático, textos de impacto e integração com APIs de imagem. |
| **Passo 5** | **Conector ComfyUI Local & REA HeyGen** | ⏳ Planejado | Estudo de engenharia reversa no estúdio HeyGen e conector opcional com ComfyUI em `localhost:8188`. |

---

## 2. Diagnóstico dos Novos Componentes Analisados

### 2.1. `OpenMontage` (O Salto Quântico em Arquitetura de Produção)
Diferente de sistemas que apenas colocam zoom em imagens estáticas, o `OpenMontage` traz:
- **Corpus de Vídeo Real (`backlot`):** Sistema de recuperação e montagem de clipes com movimento nativo.
- **`remotion-composer` Avançado:** Biblioteca de componentes de cena pronta para uso:
  - `ScreenshotScene`: Transforma capturas de tela estáticas em demos animadas com cursores e cliques.
  - `TerminalScene`: Gera animações de linha de comando com sintaxe colorida sem emuladores.
  - `BarChart`, `LineChart`, `PieChart`, `KPIGrid`: Gráficos de dados animados orientados a métricas de negócio.
  - `ComparisonCard`: Comparativos lado a lado (ex: Seu Produto vs Concorrente).
- **13 Pipelines Prontos (`pipeline_defs`):** `clip-factory.yaml`, `screen-demo.yaml`, `animated-explainer.yaml`, `documentary-montage.yaml`, `podcast-repurpose.yaml`, `localization-dub.yaml`.

### 2.2. `awesome-opus5-5-videos` (O Motor de Animação e Repertório Visual)
- **703 Prompts Curados de Animação em Código:**
  - 58 Motion Graphics de alto impacto.
  - 16 Explainers dinâmicos.
  - 14 Cenas 3D em Three.js/WebGL/GLSL.
- **O que melhora no SaaS:** Elimina o risco de "alucinação visual" das LLMs. Em vez de pedir para o modelo inventar uma animação do zero (o que frequentemente gera erros de sintaxe ou layouts desajustados), o SaaS injeta o molde estruturado já testado desse repositório, trocando apenas as variáveis do cliente (título, cores, métricas e dados).

### 2.3. O Estado Atual em `E:\SISTEMAS\saas_videos\`
- **`temp_init`**: Contém o scaffolding inicial de um projeto web em **Vite + React 19 + TypeScript + Oxlint**.
- **`ARQUITETURA_GERADOR_VIDEOS.md`**: Documento de especificação técnica já estruturado com:
  - Foco em formatos Vertical (9:16) e Horizontal (16:9).
  - Estilos de legenda inteligentes via Remotion (`Pilula`, `Karaoke`, `Caixa`).
  - Pipeline de áudio com Whisper em português.
  - Fila assíncrona com BullMQ/Redis e renderizador Remotion Headless.

---

## 3. Arquitetura Integrada do SaaS

```mermaid
graph TB
    subgraph Frontend [Camada Web & Cliente - Vite / React / TypeScript]
        UI[Painel SaaS - Dashboard]
        Player[@remotion/player - Preview Interativo em Tempo Real]
        TemplateGallery[Catálogo: 703 Moldes Opus + 13 Pipelines OpenMontage]
        ConfigPanel[Configurador de Safe Zones 9:16 e 16:9 / Paleta / Tipografia]
    end

    subgraph API_Gateway [Camada de Orquestração - Node.js / Express / Fastify]
        Router[API REST & Webhooks]
        Queue[Fila de Tarefas - BullMQ + Redis]
        AuthDB[Autenticação & Armazenamento SQLite / PostgreSQL]
    end

    subgraph Engines [Motores Especializados de Execução]
        WhisperWorker[Motor de Áudio & Whisper: Word-level Timestamps PT-BR]
        VoiceStudioWorker[Motor de Voz: OmniVoice / Voice Design / Edge-TTS]
        CodePromptDirector[Diretor de Cena: LLM + Injeção de Templates Opus 5.5]
        AssetManager[Backlot OpenMontage: Busca B-Rolls / Imagens / SFX]
    end

    subgraph RenderEngine [Motor de Renderização Headless]
        RemotionBundler[@remotion/bundler + Chromium Headless]
        FFmpegCore[FFmpeg: Jump-cuts, Blur Background, Mixagem de Áudio]
        StorageOut[Armazenamento Local / S3 / Cloudflare R2]
    end

    UI --> Router
    Router --> Queue
    Queue --> WhisperWorker
    Queue --> VoiceStudioWorker
    Queue --> CodePromptDirector
    Queue --> AssetManager
    
    WhisperWorker --> RemotionBundler
    VoiceStudioWorker --> RemotionBundler
    CodePromptDirector --> RemotionBundler
    AssetManager --> RemotionBundler
    
    RemotionBundler --> FFmpegCore
    FFmpegCore --> StorageOut
    StorageOut --> UI
    RemotionBundler -.->|Feedback de Stills| Player
```

---

## 4. O Que Melhora ao Unir os Componentes

| Antes (Apenas Legendas / Básico) | Com `OpenMontage` + `awesome-opus5-5-videos` |
| :--- | :--- |
| Vídeos dependiam exclusivamente de gravação com câmera ou voz humana. | Criação de vídeos 100% autônomos sem câmera (demos de software e explainers). |
| Layouts limitados a texto sobreposto em imagens estáticas. | Animações dinâmicas de gráficos, Three.js, partículas e telas de código interativas. |
| O LLM tentava adivinhar como criar motion graphics do zero. | 703 receitas prontas de animação com validação matemática de timeline. |
| Gravação de demonstrações de produto exigia gravação de tela manual. | `ScreenshotScene` anima prints automaticamente com cursores e cliques virtuais. |
| Apenas formato padrão. | Controle nativo de proporção: 9:16 (Shorts/TikTok), 16:9 (YouTube) e 1:1 (Anúncios). |

---

## 5. Roteiro de Desenvolvimento (Fases)

### Fase 1: Interface e Player Interativo (`saas_videos/temp_init`)
- Integrar `@remotion/player` no projeto Vite existente.
- Criar o visualizador de timeline responsivo com chave seletora 9:16 vs 16:9.
- Importar os componentes visuais de `OpenMontage/remotion-composer/src/components` (`StatCard`, `TerminalScene`, `ScreenshotScene`, `BarChart`).

### Fase 2: Módulo de Transcrição e Legendas
- Configurar worker local com `faster-whisper` forçado para o idioma português (`pt`).
- Conectar o resultado JSON aos componentes de legenda (`Pilula`, `Karaoke`, `Caixa`) com cálculo automático de safe zone.

### Fase 3: Catálogo de Templates & Prompts de Diretor
- Importar o acervo de prompts de `awesome-opus5-5-videos/prompts` em formato estruturado no banco de dados.
- Criar a galeria "Escolha um estilo visual" na interface para o usuário preencher apenas as variáveis do seu negócio.

### Fase 4: Renderizador Headless em Segundo Plano
- Implementar o endpoint de renderização com BullMQ e Remotion Renderer CLI.
- Adicionar o gerador de *stills* (1 frame por segundo) para aprovação rápida antes do render final de alta resolução.
- Geração final de arquivo `.mp4` otimizado via FFmpeg.
