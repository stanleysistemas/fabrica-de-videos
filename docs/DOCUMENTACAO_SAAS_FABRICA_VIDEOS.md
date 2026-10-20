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
| **Passo 1** | **Sidebar / Menu Geral Modular** | ✅ **Concluído** | Menu lateral retrátil com navegação limpa, rodapé de hardware e separação de módulos. |
| **Passo 2** | **Módulo Notícia / URL to Video** | ✅ **Concluído** | Web-Scraper de matérias (Call of Duty / blogs), download de fotos HD, Diretor de Roteiro IA com margem de segurança (+15%), painel de aprovação humana e animação Ken Burns 2.5D no Remotion. |
| **Passo 3** | **Avatar Studio (Clone HeyGen via REA)** | ⏳ **Próximo** | **Engenharia reversa da interface do HeyGen (`app.heygen.com/home`)** para criar o estúdio universal de avatares para **qualquer nicho** (Gamer, Corporativo, Notícias, Saúde, Finanças, Educativo). Inclui timeline de fala, poses, enquadramentos (círculo, meio-corpo, tela cheia) e suporte dual (API HeyGen oficial + motor local LivePortrait a custo zero). |
| **Passo 4** | **Thumbnail Studio Viral** | ⏳ Planejado | Criação de capas com recorte automático do avatar escolhido, luz de contorno (rim light) e títulos de alto clique. |
| **Passo 5** | **Conector ComfyUI Local & Modelos Livres** | ⏳ Planejado | Conexão REST com ComfyUI em `localhost:8188` e APIs gratuitas de imagem (Google Imagen 3 / Pollinations). |

---

## 3. Arquitetura de Vídeos Longos: Modelo Hayashii / Streamer Gameplay

Inspirado na referência de maior audiência do YouTube brasileiro de Call of Duty ([Hayashii - Vídeo de Referência](https://www.youtube.com/watch?v=dvXbEAH79JI)), esta arquitetura viabiliza vídeos de **3 a 15 minutos** sem risco de conteúdo repetitivo ou perda de retenção.

### 3.1. As 5 Camadas de Composição no Remotion:

```
┌────────────────────────────────────────────────────────────────────────┐
│  VÍDEO FINAL ESTILO HAYASHII (1080p Horizontal 16:9)                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [CAMADA 1: GAMEPLAY CONTÍNUA EM MOVIMENTO]                           │
│  Vídeo fluido de gameplay de fundo sem cortes bruscos, puxado          │
│  diretamente das lives do canal @stanleyalvesbr (áudio original        │
│  removido para evitar ruídos e manter custo $0 e 0% copyright).        │
│                                                                        │
│  [CAMADA 2: DESTAQUES OFICIAIS COM ANIMAÇÃO KEN BURNS]                │
│  No momento exato em que o roteiro cita uma arma, operador ou         │
│  equipamento, a imagem HD oficial da Activision entra na tela com      │
│  zoom suave e desfoque de fundo (duração: 4 a 6 segundos).             │
│                                                                        │
│  [CAMADA 3: NARRADOR / AVATAR NA WEBCAM]       [CAMADA 4: STREAMER]    │
│  O apresentador (Stanley Gamer) narrando a     ┌──────────────────┐    │
│  matéria inteira na webcam no canto inferior   │ 🎙️ Stanley Gamer │    │
│  com animação labial e gestos naturais.        │ [Webcam no Canto]│    │
│                                                └──────────────────┘    │
│  [CAMADA 5: LEGENDAS & MARCADORES SEGUROS]                            │
│  Legenda estilo pílula/karaokê na safe zone inferior.                 │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Fluxo de Entrada em 3 Etapas:
1. **Definição Prévia de Duração e Formato:**
   * O usuário escolhe antes de tudo a duração pretendida:
     * ⏱️ **3 Minutos (Notícia Expressa):** ~20 tomadas visuais.
     * ⏱️ **5 Minutos (Matéria Padrão YouTube):** ~35 tomadas visuais.
     * ⏱️ **8 a 12 Minutos (Dossiê Completo de Lançamento):** Cobertura detalhada de todas as categorias de armas e operadores.
2. **Seleção de B-Roll (Gameplay de Fundo):**
   * Link de live/vídeo do canal `@stanleyalvesbr` ou arquivo `.mp4` local da máquina (com extração de vídeo sem áudio).
3. **Extração Irrestrita da Matéria & Roteiro Dimensionado:**
   * Download de todas as fotos (sem teto artificial de 10 fotos).
   * Roteiro expandido para cobrir toda a extensão do tempo escolhido com a margem de +15% de segurança de fala.

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
