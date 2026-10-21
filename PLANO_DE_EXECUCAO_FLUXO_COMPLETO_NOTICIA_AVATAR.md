# Plano de Execução do Fluxo Completo: Notícia Universal para Vídeo com Avatar e Lip-Sync

> **Documento Oficial de Governança e Checklist de Entregas**  
> **Regra de Ouro:** Cada etapa é desenvolvida e testada individualmente. O status só muda para `[X] CONCLUÍDO` após a validação e autorização expressa do usuário.

---

## 1. Visão Geral do Fluxo End-to-End

```mermaid
graph TD
    A[1. Link da Notícia Universal<br/>Gamer, Política, Geral, etc.] --> B[2. Scraper Exclusivo do Site<br/>Baixa fotos e vídeos reais da página]
    B --> C{Página tem fotos/vídeos?}
    C -->|Sim| D[Usa exclusivamente as mídias da página]
    C -->|Não| E[Pausa o fluxo: Permite buscar vídeos na internet<br/>APIs Pexels/Pixabay/YouTube cadastradas]
    D --> F[3. Escolha do Avatar e da Voz]
    E --> F
    F --> G[4. Geração do Roteiro com Gancho Forte]
    G --> H[5. Síntese de Voz & Lip-Sync<br/>Opção A: HeyGen API | Opção B: LatentSync]
    H --> I[6. Painel de Escolha e Aprovação do Criador]
    I --> J[7. Composição Final no Remotion]
    J --> K[Abertura: Avatar Tela Cheia no Estúdio]
    J --> L[Corpo do Vídeo: Avatar Sempre na Webcam]
    K --> M[8. Renderização Final do Vídeo MP4]
    L --> M
```

---

## 2. Checklist de Execução por Etapas

| Etapa | Descrição Detalhada | Status | Validação do Usuário |
| :---: | :--- | :---: | :---: |
| **Etapa 1** | **Ingestão Universal da Notícia & Download Estrito de Mídias:**<br/>- Aceita qualquer link (Gamer, Política, Notícia Geral, etc.).<br/>- Extrai e faz download real de fotos e vídeos da matéria.<br/>- **Regra Rígida:** Não inclui nada fora do site. Se faltar mídia, pausa e exibe campo para vídeos da web com cadastro de APIs gratuitas (Pexels / Pixabay). | `[ ] A FAZER` | *Aguardando início* |
| **Etapa 2** | **Seleção de Avatar, Voz & Geração do Roteiro com Gancho:**<br/>- Seleção do avatar (ex: Stanley no estúdio / close-up).<br/>- Seleção da voz (clonada no VoiceStudio ou neural).<br/>- Roteiro com **Abertura de Gancho** e divisão das falas por cena. | `[ ] A FAZER` | *Aguardando Etapa 1* |
| **Etapa 3** | **Síntese de Áudio, Lip-Sync & Painel de Escolha:**<br/>- Geração dos áudios de cada cena.<br/>- Execução do Lip-Sync via **HeyGen API** ou **LatentSync**.<br/>- Painel para o criador escutar, assistir e escolher o que aprovar antes de juntar tudo. | `[ ] A FAZER` | *Aguardando Etapa 2* |
| **Etapa 4** | **Composição Visual com Regras Estritas de Câmera:**<br/>- **Início:** Avatar em **tela cheia** no estúdio dando o gancho da matéria.<br/>- **Restante do Vídeo:** Avatar **sempre fixo no quadro de webcam** no canto da tela, enquanto as fotos/vídeos da notícia passam no centro. | `[ ] A FAZER` | *Aguardando Etapa 3* |
| **Etapa 5** | **Renderização Final do Vídeo & Teste Completo:**<br/>- Compilação do vídeo final de alta definição e entrega para download. | `[ ] A FAZER` | *Aguardando Etapa 4* |

---

## 3. Guia Passo a Passo: Como se Cadastrar nas 2 Opções de Lip-Sync

### Opção A: API do HeyGen (TalkingPhoto API)

O HeyGen permite transformar a sua foto estática em um vídeo falante com lip-sync de estúdio através de sua API oficial.

#### Passo a Passo para se Cadastrar e Pegar a API Key:
1. **Acessar o Site:**
   - Entre em: [https://app.heygen.com](https://app.heygen.com)
2. **Criar a Conta:**
   - Clique em **"Sign Up"** (você pode entrar com sua conta Google com 1 clique).
   - Você ganha créditos gratuitos de teste ao criar a conta.
3. **Acessar as Configurações de Desenvolvedor (API):**
   - No menu lateral esquerdo inferior, clique no seu perfil / foto e acesse **"Settings"** (ou acesse direto: `https://app.heygen.com/settings?nav=API`).
   - Clique na aba **"API"**.
4. **Gerar a Chave de API (API Key):**
   - Clique no botão **"Generate API Key"** ou **"Create New Token"**.
   - Copie a chave gerada (ela começa normalmente com caracteres alfanuméricos longos).
5. **Cadastrar no nosso SaaS:**
   - No painel da Fábrica de Vídeos, você cola essa chave no campo **"HeyGen API Key"** na tela de configurações.

---

### Opção B: LatentSync via Replicate (ByteDance Latent Diffusion)

O LatentSync da ByteDance (presente no seu diretório `E:\SISTEMAS\CRIAR VIDEOS\LatentSync`) possui um worker na nuvem no **Replicate**, que roda em GPUs NVIDIA A100 sem consumir seu computador e custa frações de centavos por segundo de vídeo gerado.

#### Passo a Passo para se Cadastrar e Pegar o Token:
1. **Acessar o Replicate:**
   - Entre em: [https://replicate.com](https://replicate.com)
2. **Criar a Conta:**
   - Clique em **"Sign In"** ou **"Get Started"** e faça login com sua conta do **GitHub** (recomendado, é instantâneo).
3. **Pegar o Token de API (API Token):**
   - Acesse a página de tokens: [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
   - Você verá o seu token padrão (ou clique em **"Create Token"** e dê o nome `fabrica-de-videos`).
   - O token começa com `r8_...`. Copie esse código.
4. **Cadastrar no nosso SaaS:**
   - No painel da Fábrica de Vídeos, você cola esse código no campo **"Replicate Token (LatentSync)"**.

---

### Opção B2: APIs de Vídeos Gratuitos (Pexels & Pixabay - Fallback)

Caso a matéria raspada não tenha fotos nem vídeos:

1. **Pexels API (100% Gratuita):**
   - Cadastro: [https://www.pexels.com/api/](https://www.pexels.com/api/)
   - Clique em **"Get Started"** -> Crie sua conta -> Clique em **"Generate API Key"**.
   - Permite buscar e baixar vídeos em Full HD e 4K sem pagar nada e sem limite restritivo.
2. **Pixabay API (100% Gratuita):**
   - Cadastro: [https://pixabay.com/api/docs/](https://pixabay.com/api/docs/)
   - Crie a conta -> Acesse a documentação e sua chave pessoal estará em destaque verde.
