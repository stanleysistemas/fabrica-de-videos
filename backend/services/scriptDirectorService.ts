import { VideoBlueprint } from './videoVisionService';
import { SceneCut, VideoStyleClima } from '../../src/types';

export interface ScriptRequest {
  topic: string;
  targetDurationSeconds: number;
  styleClima: VideoStyleClima;
  blueprint?: VideoBlueprint;
  brandName?: string;
}

export interface GeneratedScript {
  title: string;
  hookSummary: string;
  targetDurationSeconds: number;
  plannedTotalSeconds: number; // Sempre maior que o contratado (Regra dos +15%)
  hookScore: number;
  alternateHooks: string[];
  scenes: SceneCut[];
}

export class ScriptDirectorService {
  /**
   * Transforma a intenção do usuário e o Blueprint do vídeo de referência
   * em um roteiro autoral cena a cena com margem de segurança na duração.
   */
  public async generateScript(req: ScriptRequest): Promise<GeneratedScript> {
    const { topic, targetDurationSeconds, styleClima, blueprint, brandName = 'SaaS Factory' } = req;

    // Regra de Ouro: +15% de margem de segurança no planejamento
    const safetyBufferRatio = 1.15;
    const plannedTotalSeconds = Math.round(targetDurationSeconds * safetyBufferRatio);

    // Duração média por cena com base no ritmo detectado
    const averageSceneTime = blueprint?.averageCutDurationSeconds || (targetDurationSeconds <= 60 ? 4 : 5);
    const sceneCount = Math.max(3, Math.round(plannedTotalSeconds / averageSceneTime));

    const scenes: SceneCut[] = [];

    // Cena 1: O Gancho Fatal (Hook)
    scenes.push({
      id: `scene-gen-1`,
      type: 'hero_title',
      title: `${topic.split(' ')[0] || 'O Segredo'} Revelado`,
      subtitle: 'O Que Ninguém Te Mostrou',
      narration: `Se você ainda não conhece essa estratégia sobre ${topic}, você está deixando dinheiro na mesa.`,
      durationInSeconds: 4,
      bgGradient: 'from-indigo-950 via-slate-900 to-slate-950',
    });

    // Cena 2: A Prova / O Dado de Retenção
    scenes.push({
      id: `scene-gen-2`,
      type: 'stat_card',
      statValue: '+840%',
      statLabel: 'Eficiência Comprovada',
      text: `Mais de 10.000 criadores já utilizam essa estrutura para acelerar resultados.`,
      narration: `Os canais que aplicam essa metodologia crescem mais de oito vezes mais rápido.`,
      durationInSeconds: 4,
      bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    });

    // Cena 3: A Execução Prática / Terminal ou Demonstração
    scenes.push({
      id: `scene-gen-3`,
      type: styleClima === 'tecnologico' ? 'terminal_scene' : 'screenshot_synthetic',
      title: 'Execução 100% Automática',
      terminalCommand: `npx ${brandName.toLowerCase().replace(/\s+/g, '-')}-pipeline --deploy`,
      terminalOutput: '✔ Processando cortes\n✔ Inserindo B-rolls\n✔ Renderizando 60 FPS',
      text: 'Visualização da esteira em tempo real com renderização matemática.',
      narration: `Tudo é gerado em código limpo, sem precisar de gravação manual ou softwares pesados.`,
      durationInSeconds: 5,
      bgGradient: 'from-blue-950 via-slate-900 to-slate-950',
    });

    // Cenas intermediárias adicionais para bater a minutagem exata
    const remainingTime = plannedTotalSeconds - (4 + 4 + 5 + 4);
    if (remainingTime > 4) {
      scenes.push({
        id: `scene-gen-extra`,
        type: 'text_card',
        title: 'Como Implementar Agora',
        text: 'Três passos simples que você pode executar hoje mesmo.',
        narration: `Basta definir o tema, escolher o formato vertical ou horizontal e deixar a esteira rodar.`,
        durationInSeconds: Math.max(4, remainingTime),
        bgGradient: 'from-purple-950 via-slate-900 to-slate-950',
      });
    }

    // Cena Final: Chamada para Ação (CTA)
    scenes.push({
      id: `scene-gen-final`,
      type: 'hero_title',
      title: 'Pronto Para Escalar?',
      subtitle: 'Acesse o link oficial na descrição',
      narration: `Gostou desse conteúdo? Curta o vídeo e acesse o link fixado para começar hoje mesmo.`,
      durationInSeconds: 4,
      bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    });

    const calculatedPlanned = scenes.reduce((acc, sc) => acc + sc.durationInSeconds, 0);

    return {
      title: topic,
      hookSummary: `Gancho de impacto baseado no arquétipo ${blueprint?.hookType || 'shocking_stat'}`,
      targetDurationSeconds,
      plannedTotalSeconds: calculatedPlanned,
      hookScore: 92,
      alternateHooks: [
        `"Pare de fazer ${topic} do jeito tradicional..."`,
        `"Isso aqui vai mudar o jeito que você vê ${topic} para sempre..."`,
        `"O teste de 60 segundos que provou que ${topic} funciona..."`,
      ],
      scenes,
    };
  }
}

export const scriptDirectorService = new ScriptDirectorService();
