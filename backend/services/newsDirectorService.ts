import { ScrapedArticle, ContentSection } from './newsScraperService';

export interface NewsSceneDraft {
  id: string;
  order: number;
  type: 'ken_burns_news' | 'avatar_intro' | 'avatar_outro' | 'gameplay_broll';
  heading: string;
  subheading?: string;
  narration: string;
  durationInSeconds: number;
  associatedImageId?: string;
  associatedImageUrl?: string;
  kenBurnsEffect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode: 'full_image' | 'webcam_streamer' | 'gameplay_with_webcam';
  category?: string;
}

export type ThemeFocusType = 'all' | 'weapons' | 'operators' | 'equipment' | 'custom';

export interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
  themeFocus: ThemeFocusType;
  customPrompt?: string;
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
    themeFocus?: ThemeFocusType;
    customPrompt?: string;
    styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
    targetDurationMinutes?: number;
    selectedImageIds?: string[];
    brollChannel?: string;
  }): NewsVideoPlan {
    const {
      article,
      themeFocus = 'all',
      customPrompt,
      styleMode,
      targetDurationMinutes = 5,
      selectedImageIds,
      brollChannel = '@stanleyalvesbr',
    } = params;

    const isGamer = styleMode === 'gamer_streamer';

    // 1. Filtrar Seções com Base no Foco Temático Escolhido pelo Usuário
    let filteredSections: ContentSection[] = [...article.sections];

    if (themeFocus === 'weapons') {
      filteredSections = article.sections.filter(
        (s) =>
          s.category === 'fuzis_e_armas' ||
          s.category === 'submetralhadoras' ||
          s.category === 'snipers_e_escopetas' ||
          s.category === 'armeiro'
      );
    } else if (themeFocus === 'operators') {
      filteredSections = article.sections.filter((s) => s.category === 'operadores');
    } else if (themeFocus === 'equipment') {
      filteredSections = article.sections.filter(
        (s) => s.category === 'equipamentos_e_vantagens' || s.category === 'armeiro'
      );
    } else if (themeFocus === 'custom' && customPrompt) {
      const keywords = customPrompt.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      filteredSections = article.sections.filter((s) => {
        const fullSec = `${s.heading} ${s.subheading || ''} ${s.content}`.toLowerCase();
        return keywords.some((k) => fullSec.includes(k));
      });
    }

    // Se o filtro ficou muito restrito, fazer fallback para todas as seções
    if (filteredSections.length === 0) {
      filteredSections = article.sections;
    }

    // Filtrar imagens associadas ao tema
    let availableImages = selectedImageIds && selectedImageIds.length > 0
      ? article.images.filter((img) => selectedImageIds.includes(img.id))
      : article.images;

    if (availableImages.length === 0) {
      availableImages = article.images;
    }

    const scenes: NewsSceneDraft[] = [];

    // Duração alvo em segundos (de 1 a 15 minutos) com limite de 900s
    const targetSeconds = Math.min(900, Math.max(60, targetDurationMinutes * 60));

    // 2. Cena 1: Abertura / Gancho com Apresentação do Foco
    let hookHeading = 'BOMBA: GUIA COMPLETO';
    let hookSubheading = 'Lançamento Oficial';
    let hookNarration = '';

    if (themeFocus === 'weapons') {
      hookHeading = 'ARSENAL COMPLETO DE MW4';
      hookSubheading = 'Todas as Armas & Acessórios Apex';
      hookNarration = isGamer
        ? `Fala galera! Atenção porque a Activision liberou o catálogo oficial com todas as armas do novo Call of Duty! Nós vamos passar fuzil por fuzil, submetralhadoras, snipers e os novos Acessórios Apex secretos que mudam completamente o meta. Fica ligado até o fim!`
        : `Olá a todos. Sejam muito bem-vindos. No vídeo de hoje faremos uma análise técnica aprofundada de todo o arsenal de armas, calibres e conversões Apex de Modern Warfare 4.`;
    } else if (themeFocus === 'operators') {
      hookHeading = 'TODOS OS 33 OPERADORES';
      hookSubheading = 'Facções & Desbloqueios';
      hookNarration = isGamer
        ? `Fala comunidade gamer! Hoje o foco é nos 33 operadores de lançamento de Modern Warfare 4! Vamos ver as skins, as forças especiais e como desbloquear cada um na Campanha e na DMZ sem perder tempo!`
        : `Bem-vindos. Hoje vamos detalhar todos os 33 operadores disponíveis no lançamento de Modern Warfare 4 e seus respectivos critérios de desbloqueio.`;
    } else if (themeFocus === 'equipment') {
      hookHeading = 'EQUIPAMENTOS & VANTAGENS';
      hookSubheading = 'Séries de Baixas & Armeiro 2.0';
      hookNarration = isGamer
        ? `Fala esquadrão! Hoje vamos analisar as melhores séries de baixas, equipamentos táticos e o novo sistema de vantagens do multiplayer de Modern Warfare 4!`
        : `Olá. Sejam bem-vindos à nossa cobertura sobre o sistema de vantagens, melhorias de campo e equipamentos táticos de Modern Warfare 4.`;
    } else {
      hookNarration = isGamer
        ? `Fala galera! Atenção total porque foram reveladas as informações oficiais completas de ${article.title.slice(0, 45)}! Nós vamos conferir todas as armas, operadores e novidades do multiplayer juntos agora!`
        : `Olá a todos. Sejam muito bem-vindos. Hoje vamos analisar o guia oficial de lançamento: ${article.title.slice(0, 50)}.`;
    }

    const hookDuration = this.calculateDurationWithSafetyMargin(hookNarration, 8);

    scenes.push({
      id: `scene_hook_${Date.now()}`,
      order: 1,
      type: 'avatar_intro',
      heading: hookHeading,
      subheading: hookSubheading,
      narration: hookNarration,
      durationInSeconds: hookDuration,
      associatedImageId: availableImages[0]?.id,
      associatedImageUrl: availableImages[0]?.url,
      kenBurnsEffect: 'zoom_in',
      layoutMode: 'webcam_streamer',
    });

    let currentDuration = hookDuration;
    let sceneOrder = 2;

    const effects: ('zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right')[] = [
      'zoom_in',
      'pan_left',
      'zoom_out',
      'pan_right',
    ];

    // 3. Iterar sobre as seções reais até cobrir o tempo alvo do vídeo
    let sIdx = 0;
    let imgIdx = 0;

    while (currentDuration < targetSeconds - 20 && sIdx < filteredSections.length) {
      const section = filteredSections[sIdx];
      const img = availableImages[imgIdx % Math.max(1, availableImages.length)];
      const effect = effects[sceneOrder % effects.length];

      // A cada 3 cenas, intercalar uma tomada com foco no gameplay da live de @stanleyalvesbr
      const isGameplayInterlude = sceneOrder % 3 === 0;

      let heading = section.subheading || section.heading || `ARMA / DESTAQUE #${sceneOrder}`;
      let narration = '';

      if (isGameplayInterlude) {
        heading = `GAMEPLAY: ${section.subheading || section.heading}`;
        narration = isGamer
          ? `Prestem atenção na movimentação na live de fundo do canal @stanleyalvesbr! É com essa velocidade de mira e posicionamento que vamos dominar as partidas usando esse armamento.`
          : `Como podemos observar na demonstração prática de gameplay, a movimentação fluida favorece combates táticos dinâmicos.`;
      } else {
        // Narração específica da arma / operador
        narration = isGamer
          ? `Olha esse detalhe oficial sobre a ${section.subheading || section.heading}: ${section.content}! Isso aqui impacta diretamente o combate e a escolha da sua classe.`
          : `Em relação a ${section.subheading || section.heading}: ${section.content}. Essa configuração traz alto impacto tático.`;
      }

      const duration = this.calculateDurationWithSafetyMargin(narration, 8);

      scenes.push({
        id: `scene_body_${sceneOrder}_${Date.now()}`,
        order: sceneOrder,
        type: isGameplayInterlude ? 'gameplay_broll' : 'ken_burns_news',
        heading,
        subheading: section.subheading,
        narration,
        durationInSeconds: duration,
        associatedImageId: img?.id,
        associatedImageUrl: img?.url,
        kenBurnsEffect: effect,
        layoutMode: 'webcam_streamer',
        category: section.category,
      });

      currentDuration += duration;
      sceneOrder++;
      sIdx++;
      if (!isGameplayInterlude) imgIdx++;
    }

    // 4. Cena de Encerramento (Call to Action / Like & Comentário)
    const outroNarration = isGamer
      ? `E agora eu quero a sua opinião sincera: qual dessas armas ou operadores você vai testar primeiro no lançamento? Deixa seu comentário, esmaga o botão de like, se inscreve no canal e até o próximo vídeo!`
      : `Chegamos ao fim da nossa cobertura detalhada. Compartilhe suas impressões nos comentários, deixe seu like e inscreva-se para acompanhar as próximas análises.`;

    const outroDuration = this.calculateDurationWithSafetyMargin(outroNarration, 8);

    scenes.push({
      id: `scene_outro_${Date.now()}`,
      order: sceneOrder,
      type: 'avatar_outro',
      heading: 'INSCREVA-SE & COMENTE',
      subheading: 'Qual Arma Você Vai Usar?',
      narration: outroNarration,
      durationInSeconds: outroDuration,
      associatedImageId: availableImages[availableImages.length - 1]?.id,
      associatedImageUrl: availableImages[availableImages.length - 1]?.url,
      kenBurnsEffect: 'zoom_out',
      layoutMode: 'webcam_streamer',
    });

    currentDuration += outroDuration;

    return {
      id: `plan_${Date.now()}`,
      articleId: article.id,
      title: article.title,
      themeFocus,
      customPrompt,
      targetDurationMinutes,
      totalDurationSeconds: currentDuration,
      scenes,
      suggestedVoiceId: 'voice_hayashii_streamer',
      styleMode,
      brollSource: {
        channel: brollChannel,
        label: `Gameplay ao vivo canal ${brollChannel}`,
      },
    };
  }

  // Calcula duração baseada na média de palavras faladas em português + 15% de margem
  private calculateDurationWithSafetyMargin(text: string, minimumSeconds: number): number {
    const words = text.split(/\s+/).filter(Boolean).length;
    // Média de fala fluida natural: ~2.4 palavras por segundo
    const baseDuration = words / 2.4;
    // Margem de segurança de +15% para pausas naturais e respiração
    const totalDuration = Math.round(baseDuration * 1.15);
    return Math.max(minimumSeconds, totalDuration);
  }
}

export const newsDirectorService = new NewsDirectorService();
