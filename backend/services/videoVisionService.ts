export interface VideoBlueprint {
  sourceUrl: string;
  detectedPacing: 'ultra_fast' | 'dynamic' | 'cinematic';
  averageCutDurationSeconds: number;
  hookType: 'question_provocative' | 'shocking_stat' | 'visual_mystery';
  estimatedRetentionScore: number;
  cutsTimeline: {
    startSeconds: number;
    endSeconds: number;
    visualType: 'talking_head' | 'motion_graphic' | 'terminal_screen' | 'b_roll_stat';
    energyLevel: 'high' | 'medium' | 'climax';
    hasTextOverlay: boolean;
    description: string;
  }[];
  viralTakeaways: string[];
}

export class VideoVisionService {
  /**
   * Disseca um vídeo de referência (via URL do YouTube ou arquivo local)
   * utilizando análise multimodal para gerar o Blueprint de retenção.
   */
  public async analyzeVideo(url: string): Promise<VideoBlueprint> {
    // Simulação robusta da análise frame a frame da API Gemini Vision
    const isShorts = url.includes('/shorts/') || url.includes('tiktok');

    return {
      sourceUrl: url,
      detectedPacing: isShorts ? 'ultra_fast' : 'dynamic',
      averageCutDurationSeconds: isShorts ? 3.2 : 4.5,
      hookType: 'shocking_stat',
      estimatedRetentionScore: 94,
      cutsTimeline: [
        {
          startSeconds: 0,
          endSeconds: 3.5,
          visualType: 'motion_graphic',
          energyLevel: 'high',
          hasTextOverlay: true,
          description: 'Gancho imediato com texto em caixa alta e impacto grave.',
        },
        {
          startSeconds: 3.5,
          endSeconds: 7.5,
          visualType: 'b_roll_stat',
          energyLevel: 'medium',
          hasTextOverlay: true,
          description: 'Apresentação de número de crescimento e comprovação visual.',
        },
        {
          startSeconds: 7.5,
          endSeconds: 12.0,
          visualType: 'terminal_screen',
          energyLevel: 'medium',
          hasTextOverlay: true,
          description: 'Demonstração de execução sintética sem enrolação.',
        },
        {
          startSeconds: 12.0,
          endSeconds: 16.0,
          visualType: 'motion_graphic',
          energyLevel: 'climax',
          hasTextOverlay: true,
          description: 'Chamada para ação e retenção final com safe zone preservada.',
        },
      ],
      viralTakeaways: [
        'Cortes nunca passam de 4 segundos sem troca de plano.',
        'Legenda destacada em amarelo/verde no momento da pronúncia da palavra-chave.',
        'Eliminação de introduções formais: entra direto na dor do espectador.',
        'Uso de som grave (whoosh/impact) no segundo 0.2 para travar a rolagem.',
      ],
    };
  }
}

export const videoVisionService = new VideoVisionService();
