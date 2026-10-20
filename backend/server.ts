import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { videoVisionService } from './services/videoVisionService';
import { scriptDirectorService } from './services/scriptDirectorService';
import { renderService } from './services/renderService';
import { qaInspectorService } from './services/qaInspectorService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir arquivos do storage (MP4s, stills e assets)
app.use('/storage', express.static(path.resolve(process.cwd(), 'storage')));

// Health check e diagnóstico de ferramentas
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    engines: {
      geminiVision: 'active',
      claudeDirector: 'active',
      ffmpegQA: 'installed',
      remotionRenderer: 'ready',
    },
  });
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
