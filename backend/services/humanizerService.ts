import { apiKeyService } from './apiKeyService';

export interface HumanizeOptions {
  text: string;
  style: 'gamer_streamer' | 'vox_documentary' | 'tech_capsule';
}

class HumanizerService {
  public async humanizeText(options: HumanizeOptions): Promise<{ originalText: string; humanizedText: string; appliedStyle: string }> {
    const { text, style } = options;
    if (!text || !text.trim()) {
      return { originalText: text, humanizedText: text, appliedStyle: style };
    }

    // 1. Tentar com OpenAI se configurada
    const openaiKey = apiKeyService.getAllKeys().find((k) => k.id === 'openai')?.key;
    if (openaiKey && openaiKey.trim()) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: this.getSystemPrompt(style),
              },
              {
                role: 'user',
                content: `Humanize e reescreva este texto bruto da notícia mantendo 100% dos fatos, nomes e armas:\n\n${text}`,
              },
            ],
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim()) {
            return {
              originalText: text,
              humanizedText: content.trim(),
              appliedStyle: style,
            };
          }
        }
      } catch (err) {
        console.warn('[Humanizer] Falha na API OpenAI, tentando regra local:', err);
      }
    }

    // 2. Fallback: Transformação local baseada nos princípios do humanizer/SKILL.md
    const humanized = this.localHumanizeRule(text, style);
    return {
      originalText: text,
      humanizedText: humanized,
      appliedStyle: style,
    };
  }

  private getSystemPrompt(style: string): string {
    const baseDirectives = `
Você é o motor Humanizer profissional da Fábrica de Vídeos.
Sua missão: Transformar texto bruto de portais ou notícias frias em fala humana 100% natural, removendo tom robótico de IA.
Diretrizes inegociáveis:
- NÃO invente fatos ou dados. Mantenha armas, datas, nomes e detalhes reais da matéria.
- Elimine clichês de IA ("não apenas X, mas também Y", "vale ressaltar", "é importante notar", "no cenário atual").
- Use frases diretas, variando frases curtas com frases médias.
- Divida em parágrafos claros prontos para locução.
`;

    if (style === 'gamer_streamer') {
      return `${baseDirectives}
ESTILO: Gamer / Streamer (Canal Stanley Alves).
- Tom empolgado, focado na jogabilidade, armas e impacto prático nas partidas multiplayer.
- Use linguagem falada natural de criador de conteúdo de games ("se liga nisso", "olha que absurdo", "dá uma olhada nessa arma", "aqui a gameplay muda completamente").`;
    }

    if (style === 'vox_documentary') {
      return `${baseDirectives}
ESTILO: Documentário Estilo VOX / Investigativo.
- Tom cinematográfico, ritmo ágil e direto aos fatos.
- Apresente o contexto com perguntas retóricas e dados de impacto ("Mas por que essa mudança importa agora?").`;
    }

    return `${baseDirectives}
ESTILO: Pílula Tech / Notícia Ágil.
- Tom claro, moderno, dinâmico e focado nas novidades e especificações práticas.`;
  }

  private localHumanizeRule(text: string, style: string): string {
    let clean = text
      // Remove clichês robóticos
      .replace(/não apenas ([^,]+), mas também ([^.]+)\./gi, '$1 e $2.')
      .replace(/vale ressaltar que/gi, 'Olha só:')
      .replace(/é importante notar que/gi, 'Preste atenção:')
      .replace(/no que tange a/gi, 'Sobre')
      .replace(/em suma,/gi, 'Resumindo:')
      .replace(/de acordo com informações,/gi, '')
      .replace(/\s+/g, ' ');

    if (style === 'gamer_streamer') {
      clean = clean
        .replace(/os jogadores podem/gi, 'a gente pode')
        .replace(/está disponível/gi, 'já tá liberado')
        .replace(/oferece vantagens/gi, 'dá uma vantagem absurda nas partidas');
    }

    return clean.trim();
  }
}

export const humanizerService = new HumanizerService();
