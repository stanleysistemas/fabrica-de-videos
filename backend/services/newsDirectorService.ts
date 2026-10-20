import { ScrapedArticle } from './newsScraperService';

export interface NewsSceneDraft {
  id: string;
  order: number;
  type: 'ken_burns_news' | 'avatar_intro' | 'avatar_outro' | 'gameplay_broll';
  heading: string;
  narration: string;
  durationInSeconds: number;
  associatedImageId?: string;
  associatedImageUrl?: string;
  kenBurnsEffect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode: 'full_image' | 'webcam_streamer' | 'gameplay_with_webcam';
  avatarVoiceId?: string;
}

export interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
  targetDurationMinutes: number;
  totalDurationSeconds: number;
  scenes: NewsSceneDraft[];
  suggestedVoiceId: string;
  styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
  brollSource?: {
    channel: string;
    label: string;
  };
}

class NewsDirectorService {
  public generateVideoPlan(params: {
    article: ScrapedArticle;
    styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
    targetDurationMinutes?: number;
    selectedImageIds?: string[];
    brollChannel?: string;
  }): NewsVideoPlan {
    const { article, styleMode, targetDurationMinutes = 5, selectedImageIds, brollChannel } = params;

    // Imagens selecionadas ou todas as disponíveis
    const availableImages = selectedImageIds && selectedImageIds.length > 0
      ? article.images.filter(img => selectedImageIds.includes(img.id))
      : article.images;

    const scenes: NewsSceneDraft[] = [];
    const isGamer = styleMode === 'gamer_streamer';

    // Duração alvo em segundos (de 1 a 15 minutos)
    const targetSeconds = Math.min(900, Math.max(60, targetDurationMinutes * 60));
    // Duração média de cada tomada: ~7 segundos para ritmo dinâmico estilo Hayashii
    const estimatedSceneCount = Math.max(6, Math.round(targetSeconds / 7));

    // 1. Cena de Abertura / Gancho Viral (0 a 10s)
    const hookNarration = isGamer
      ? `Fala galera! Atenção porque as novidades oficiais de ${article.title.slice(0, 48)} acabam de ser confirmadas e nós vamos dissecar cada detalhe aqui hoje!`
      : `Olá a todos. Sejam bem-vindos a esta cobertura completa sobre ${article.title.slice(0, 55)}. Vamos analisar todos os pontos anunciados.`;

    const hookDuration = this.calculateDurationWithSafetyMargin(hookNarration, 6);

    scenes.push({
      id: `scene_hook_${Date.now()}`,
      order: 1,
      type: 'avatar_intro',
      heading: 'BOMBA: NOVIDADES OFICIAIS',
      narration: hookNarration,
      durationInSeconds: hookDuration,
      associatedImageId: availableImages[0]?.id,
      associatedImageUrl: availableImages[0]?.url,
      kenBurnsEffect: 'zoom_in',
      layoutMode: 'webcam_streamer',
    });

    // 2. Construção das Cenas de Conteúdo e Gameplay Dimensionadas para o Tempo Alvo
    const paragraphs = article.paragraphs.length > 0
      ? article.paragraphs
      : [article.description];

    const effects: ('zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right')[] = [
      'zoom_in', 'pan_left', 'zoom_out', 'pan_right'
    ];

    let currentAccumulatedDuration = hookDuration;
    let pIdx = 0;
    let imgIdx = 0;
    let sceneOrder = 2;

    while (currentAccumulatedDuration < targetSeconds - 15 && sceneOrder < estimatedSceneCount) {
      const p = paragraphs[pIdx % paragraphs.length];
      const img = availableImages[imgIdx % Math.max(1, availableImages.length)];
      const effect = effects[sceneOrder % effects.length];

      // Alternar entre foco no gameplay da live e foco na imagem oficial com Ken Burns
      const isGameplayFocus = sceneOrder % 3 === 0;

      let narrationText = '';
      let heading = '';

      if (isGameplayFocus) {
        heading = `GAMEPLAY & ANÁLISE #${sceneOrder - 1}`;
        narrationText = isGamer
          ? `Vocês estão vendo essa movimentação na gameplay de fundo? É exatamente com essa fluidez que o jogo promete rodar nas ranqueadas.`
          : `Como podemos observar na demonstração prática de gameplay, a taxa de resposta e a mecânica de tiro foram aprimoradas.`;
      } else {
        heading = `DESTAQUE OFICIAL #${sceneOrder - 1}`;
        narrationText = isGamer
          ? `Olha esse detalhe oficial: ${p.slice(0, 160)}! Isso aqui vai mudar diretamente a montagem das classes.`
          : `${p.slice(0, 170)}. Este ajuste foi pensado para garantir equilíbrio entre os jogadores.`;
      }

      const duration = this.calculateDurationWithSafetyMargin(narrationText, 7);

      scenes.push({
        id: `scene_body_${sceneOrder}_${Date.now()}`,
        order: sceneOrder,
        type: isGameplayFocus ? 'gameplay_broll' : 'ken_burns_news',
        heading,
        narration: narrationText,
        durationInSeconds: duration,
        associatedImageId: img?.id,
        associatedImageUrl: img?.url,
        kenBurnsEffect: effect,
        layoutMode: 'webcam_streamer',
      });

      currentAccumulatedDuration += duration;
      sceneOrder++;
      pIdx++;
      if (!isGameplayFocus) imgIdx++;
    }

    // 3. Cena de Encerramento (Call to Action / Like e Inscrição)
    const outroNarration = isGamer
      ? `E agora eu quero saber a sua opinião sincera nos comentários: o que você achou dessas mudanças? Deixa aquele likezão monstro, se inscreve no canal e até o próximo vídeo!`
      : `Muito obrigado por acompanhar este resumo completo. Deixe seu comentário com suas impressões e inscreva-se para os próximos conteúdos.`;

    const outroDuration = this.calculateDurationWithSafetyMargin(outroNarration, 7);

    scenes.push({
      id: `scene_outro_${Date.now()}`,
      order: scenes.length + 1,
      type: 'avatar_outro',
      heading: 'DEIXE SEU FEEDBACK',
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
      targetDurationMinutes,
      totalDurationSeconds,
      scenes,
      suggestedVoiceId: 'Minha Voz Oficial (Clonada)',
      styleMode,
      brollSource: {
        channel: brollChannel || '@stanleyalvesbr',
        label: 'Gameplay de Live do Canal @stanleyalvesbr',
      },
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
