import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { videoVisionService } from './services/videoVisionService';
import { scriptDirectorService } from './services/scriptDirectorService';
import { renderService } from './services/renderService';
import { qaInspectorService } from './services/qaInspectorService';

import { hardwareService } from './services/hardwareService';
import { voiceStudioService } from './services/voiceStudioService';
import { newsScraperService } from './services/newsScraperService';
import { newsDirectorService } from './services/newsDirectorService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir arquivos do storage (MP4s, stills e assets)
app.use('/storage', express.static(path.resolve(process.cwd(), 'storage')));

// Health check e diagnóstico de ferramentas
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.2.0',
    nodeVersion: process.version,
    platform: process.platform,
    engines: {
      geminiVision: 'active',
      claudeDirector: 'active',
      ffmpegQA: 'installed',
      remotionRenderer: 'ready',
      voiceStudioLocal: 'ready',
      hardwareEngine: 'active',
      newsScraper: 'ready',
      newsDirector: 'ready',
    },
  });
});

// Endpoint: Scrape de Matéria de Blog / Notícia e Geração de Roteiro
app.post('/api/news/scrape', async (req: Request, res: Response) => {
  try {
    const { url, styleMode, targetDurationMinutes, brollChannel, themeFocus, customPrompt } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL da matéria é obrigatória' });
    }

    const article = await newsScraperService.scrapeUrl(url);
    const plan = newsDirectorService.generateVideoPlan({
      article,
      themeFocus: themeFocus || 'all',
      customPrompt,
      styleMode: styleMode || 'gamer_streamer',
      targetDurationMinutes: targetDurationMinutes ? Number(targetDurationMinutes) : 5,
      brollChannel: brollChannel || '@stanleyalvesbr',
    });

    res.json({ success: true, article, plan });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao processar matéria' });
  }
});

// Endpoint: Gerar Novo Roteiro com Foco Temático sem Raspar Novamente
app.post('/api/news/generate-plan', async (req: Request, res: Response) => {
  try {
    const { article, themeFocus, customPrompt, styleMode, selectedImageIds, targetDurationMinutes, brollChannel } = req.body;
    if (!article) {
      return res.status(400).json({ error: 'Dados do artigo são obrigatórios' });
    }

    const plan = newsDirectorService.generateVideoPlan({
      article,
      themeFocus: themeFocus || 'all',
      customPrompt,
      styleMode: styleMode || 'gamer_streamer',
      selectedImageIds,
      targetDurationMinutes: targetDurationMinutes ? Number(targetDurationMinutes) : 5,
      brollChannel: brollChannel || '@stanleyalvesbr',
    });

    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao gerar plano temático' });
  }
});

// Endpoint: Listar Histórico de Matérias Salvas no SQLite
app.get('/api/news/history', async (req: Request, res: Response) => {
  try {
    const { newsDbService } = await import('./services/newsDbService');
    const articles = newsDbService.listRecentArticles(30);
    res.json({ success: true, articles });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao consultar histórico de matérias' });
  }
});

// Endpoint: Obter Texto Bruto .TXT da Matéria
app.get('/api/news/article/:id/raw-text', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const txtPath = path.resolve(process.cwd(), 'storage', 'news_cache', `${id}.txt`);
    const fs = await import('fs');
    if (fs.existsSync(txtPath)) {
      const content = fs.readFileSync(txtPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(content);
    } else {
      res.status(404).json({ error: 'Arquivo de texto bruto não encontrado' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao carregar texto bruto' });
  }
});

// Endpoint: Detecção e status de Hardware (GPU NVIDIA CUDA / CPU GGUF)
app.get('/api/hardware/detect', async (req: Request, res: Response) => {
  try {
    const profile = await hardwareService.detectHardware();
    res.json({ success: true, hardware: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao detectar hardware' });
  }
});

// Endpoint: Salvar preferência de hardware do usuário
app.post('/api/hardware/preference', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (!['auto', 'cuda', 'cpu_gguf'].includes(mode)) {
    return res.status(400).json({ error: 'Modo inválido. Escolha: auto, cuda ou cpu_gguf' });
  }
  hardwareService.setPreference(mode);
  res.json({ success: true, activeMode: mode });
});

// Endpoint: Status do Motor VoiceStudio Local
app.get('/api/voice-studio/status', async (req: Request, res: Response) => {
  try {
    const status = await voiceStudioService.getEngineStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao consultar VoiceStudio' });
  }
});

// Endpoint: Listar Vozes do Vault Local
app.get('/api/voice-studio/voices', async (req: Request, res: Response) => {
  try {
    const voices = await voiceStudioService.listVoices();
    res.json({ success: true, voices });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao carregar vozes' });
  }
});

// Endpoint: Clonar Voz Localmente via VoiceStudio
app.post('/api/voice-studio/clone', async (req: Request, res: Response) => {
  try {
    const { name, tone, description, voiceDesignPrompt, sampleBase64, preferredMode } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nome da voz é obrigatório' });
    }

    const cloned = await voiceStudioService.cloneVoice({
      name,
      tone: tone || 'grave',
      description: description || '',
      voiceDesignPrompt,
      sampleBase64,
      preferredMode,
    });

    res.json({ success: true, voice: cloned });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao clonar voz localmente' });
  }
});

// Endpoint: Deletar Voz Local
app.delete('/api/voice-studio/voices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await voiceStudioService.deleteVoice(id);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao remover voz' });
  }
});

// Endpoint: Visão Multimodal de Vídeo (Assistir Referência do YouTube)
app.post('/api/analyze-video', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL do vídeo é obrigatória' });
    }

    const blueprint = await videoVisionService.analyzeVideo(url);
    res.json({ success: true, blueprint });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao analisar vídeo' });
  }
});

// Endpoint: Roteirista do Diretor com margem de segurança na duração
app.post('/api/generate-script', async (req: Request, res: Response) => {
  try {
    const { topic, targetDurationSeconds, styleClima, blueprint, brandName } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Tema do vídeo é obrigatório' });
    }

    const script = await scriptDirectorService.generateScript({
      topic,
      targetDurationSeconds: targetDurationSeconds || 60,
      styleClima: styleClima || 'tecnologico',
      blueprint,
      brandName,
    });

    res.json({ success: true, script });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao gerar roteiro' });
  }
});

// Endpoint: Renderização de Vídeo e Auto-Inspeção Visual (QA)
app.post('/api/render-video', async (req: Request, res: Response) => {
  try {
    const { project } = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: 'Dados do projeto inválidos' });
    }

    const renderResult = await renderService.renderProject(project);
    res.json({ success: true, renderResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha na renderização' });
  }
});

// Endpoint: Inspeção Direta de QA com FFmpeg
app.post('/api/qa-inspect', async (req: Request, res: Response) => {
  try {
    const { projectId, videoPath } = req.body;
    const report = await qaInspectorService.inspectVideo(projectId, videoPath || '');
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha no QA' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server da Fábrica de Vídeos rodando em http://localhost:${PORT}`);
});
