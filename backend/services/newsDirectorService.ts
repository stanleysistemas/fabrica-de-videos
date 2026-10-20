import { ScrapedArticle } from './newsScraperService';

export interface NewsSceneDraft {
  id: string;
  order: number;
  type: 'ken_burns_news' | 'avatar_intro' | 'avatar_outro';
  heading: string;
  narration: string;
  durationInSeconds: number;
  associatedImageId?: string;
  associatedImageUrl?: string;
  kenBurnsEffect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode: 'full_image' | 'webcam_streamer';
  avatarVoiceId?: string;
}

export interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
  totalDurationSeconds: number;
  scenes: NewsSceneDraft[];
  suggestedVoiceId: string;
  styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
}

class NewsDirectorService {
  public generateVideoPlan(params: {
    article: ScrapedArticle;
    styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
    selectedImageIds?: string[];
  }): NewsVideoPlan {
    const { article, styleMode, selectedImageIds } = params;

    // Filtrar imagens se o usuário tiver selecionado ou usar todas
    const availableImages = selectedImageIds && selectedImageIds.length > 0
      ? article.images.filter(img => selectedImageIds.includes(img.id))
      : article.images;

    const scenes: NewsSceneDraft[] = [];
    const isGamer = styleMode === 'gamer_streamer';

    // 1. Cena de Gancho (Hook - Primeiros 3 a 5 segundos)
    const hookNarration = isGamer
      ? `Atenção jogadores! As novidades oficiais de ${article.title.slice(0, 50)} acabam de explodir na comunidade e mudam tudo no jogo!`
      : `Novidades oficiais confirmadas: ${article.title.slice(0, 65)}. Confira agora os principais destaques revelados.`;

    const hookDuration = this.calculateDurationWithSafetyMargin(hookNarration, 4);

    scenes.push({
      id: `scene_hook_${Date.now()}`,
      order: 1,
      type: 'avatar_intro',
      heading: 'BOMBA NOVO LANÇAMENTO',
      narration: hookNarration,
      durationInSeconds: hookDuration,
      associatedImageId: availableImages[0]?.id,
      associatedImageUrl: availableImages[0]?.url,
      kenBurnsEffect: 'zoom_in',
      layoutMode: 'webcam_streamer',
    });

    // 2. Cenas Centrais com as Imagens da Matéria
    const paragraphs = article.paragraphs.length > 0
      ? article.paragraphs.slice(0, Math.min(availableImages.length, 4))
      : [article.description];

    paragraphs.forEach((p, idx) => {
      const img = availableImages[idx % availableImages.length];
      const sceneNarration = isGamer
        ? `Olha esse detalhe: ${p.slice(0, 140)}! Isso aqui vai mexer diretamente no meta competitivo.`
        : `${p.slice(0, 150)}. Os desenvolvedores ressaltam que o foco está na estabilidade e equilíbrio.`;

      const duration = this.calculateDurationWithSafetyMargin(sceneNarration, 6);
      const effects: ('zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right')[] = ['zoom_in', 'pan_left', 'zoom_out', 'pan_right'];

      scenes.push({
        id: `scene_body_${idx + 1}_${Date.now()}`,
        order: idx + 2,
        type: 'ken_burns_news',
        heading: `DESTAQUE #${idx + 1}`,
        narration: sceneNarration,
        durationInSeconds: duration,
        associatedImageId: img?.id,
        associatedImageUrl: img?.url,
        kenBurnsEffect: effects[idx % effects.length],
        layoutMode: idx % 2 === 0 ? 'full_image' : 'webcam_streamer',
      });
    });

    // 3. Cena de Encerramento (Call to Action / Like & Comentário)
    const outroNarration = isGamer
      ? `E você, curtiu essas mudanças? Deixa nos comentários qual classe você vai montar primeiro e já se inscreve no canal para não perder nada!`
      : `Compartilhe sua opinião nos comentários e inscreva-se para acompanhar todas as atualizações em primeira mão.`;

    const outroDuration = this.calculateDurationWithSafetyMargin(outroNarration, 4);

    scenes.push({
      id: `scene_outro_${Date.now()}`,
      order: scenes.length + 1,
      type: 'avatar_outro',
      heading: 'DEIXE SUA OPINIÃO',
      narration: outroNarration,
      durationInSeconds: outroDuration,
      associatedImageId: availableImages[availableImages.length - 1]?.id,
      associatedImageUrl: availableImages[availableImages.length - 1]?.url,
      kenBurnsEffect: 'zoom_out',
      layoutMode: 'webcam_streamer',
    });

    const totalDurationSeconds = scenes.reduce((acc, sc) => acc + sc.durationInSeconds, 0);

    return {
      id: `plan_${Date.now()}`,
      articleId: article.id,
      title: article.title,
      totalDurationSeconds,
      scenes,
      suggestedVoiceId: 'Minha Voz Oficial (Clonada)',
      styleMode,
    };
  }

  // Regra Obrigatória: Duração real com margem de segurança de fala (+15%)
  private calculateDurationWithSafetyMargin(text: string, minDuration: number): number {
    const words = text.split(/\s+/).length;
    // Média de fala: ~2.5 palavras por segundo em português
    const baseSeconds = Math.max(minDuration, Math.round(words / 2.5));
    // Aplicação da margem de segurança de +15% para pausas e respiração natural
    return Math.round(baseSeconds * 1.15);
  }
}

export const newsDirectorService = new NewsDirectorService();
