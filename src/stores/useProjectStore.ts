import { create } from 'zustand';
import { ProjectConfig, AspectRatio, VideoStyleClima, SceneCut, SubtitleStyle } from '../types';

interface ProjectState {
  project: ProjectConfig;
  setTopic: (topic: string) => void;
  setReferenceUrl: (url: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setDuration: (duration: number) => void;
  setDurationMode: (mode: 'source_exact' | 'custom_cut') => void;
  setStyleClima: (style: VideoStyleClima) => void;
  setBrandColors: (primary: string, secondary: string) => void;
  setSubtitleStyle: (style: SubtitleStyle) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateScene: (index: number, scene: Partial<SceneCut>) => void;
  setScenes: (scenes: SceneCut[]) => void;
  loadDemoScenes: () => void;
}

const initialScenes: SceneCut[] = [
  {
    id: 'scene-1',
    type: 'hero_title',
    title: 'A Revolução da IA',
    subtitle: 'O Que Ninguém Te Contou',
    narration: 'Você sabia que a maioria das pessoas usa inteligência artificial do jeito completamente errado?',
    durationInSeconds: 4,
    bgGradient: 'from-indigo-900/60 via-slate-900 to-slate-950'
  },
  {
    id: 'scene-2',
    type: 'stat_card',
    statValue: '+850%',
    statLabel: 'Aumento de Retenção',
    text: 'Canais com cortes dinâmicos retêm até 8x mais atenção no YouTube e TikTok.',
    narration: 'Com técnicas de quebra de padrão a cada 4 segundos, a retenção explode.',
    durationInSeconds: 4,
    bgGradient: 'from-emerald-950/60 via-slate-900 to-slate-950'
  },
  {
    id: 'scene-3',
    type: 'terminal_scene',
    terminalCommand: 'npx saas-video-factory --generate --format 9:16',
    terminalOutput: '✔ Análise Gemini: Concluída\n✔ Roteiro Claude: Pronto\n✔ QA Visual FFmpeg: 100% Aprovado',
    narration: 'Basta um comando para o sistema analisar o nicho, roteirizar e auto-inspecionar o vídeo.',
    durationInSeconds: 5,
    bgGradient: 'from-blue-950/60 via-slate-900 to-slate-950'
  },
  {
    id: 'scene-4',
    type: 'screenshot_synthetic',
    title: 'Painel 100% Automático',
    text: 'Interface intuitiva com controle de safe zones para TikTok e YouTube.',
    narration: 'Tudo pronto e seguro para publicação com máxima taxa de clique e monetização.',
    durationInSeconds: 5,
    bgGradient: 'from-purple-950/60 via-slate-900 to-slate-950'
  }
];

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    id: 'proj_demo_01',
    topic: 'Como Criar Vídeos Virais com IA em 2026',
    referenceUrl: 'https://youtube.com/watch?v=exemplo',
    aspectRatio: '9:16',
    targetDurationSeconds: 18,
    sourceDurationSeconds: 18,
    durationMode: 'source_exact',
    styleClima: 'tecnologico',
    brand: {
      name: 'Minha Marca',
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      backgroundColor: '#080b11',
      fontFamily: 'Outfit',
    },
    audio: {
      voiceEngine: 'voice_studio',
      voiceName: 'Locutor Documentário (Grave)',
      includeBgm: true,
      bgmVolume: 0.12,
      autoDucking: true,
      subtitleStyle: 'pilula',
    },
    mandatoryTexts: ['Inscreva-se no canal', 'Link na descrição'],
    scenes: initialScenes,
    currentStep: 1,
    status: 'draft',
  },
  setTopic: (topic) => set((state) => ({ project: { ...state.project, topic } })),
  setReferenceUrl: (referenceUrl) => set((state) => ({ project: { ...state.project, referenceUrl } })),
  setAspectRatio: (aspectRatio) => set((state) => ({ project: { ...state.project, aspectRatio } })),
  setDuration: (targetDurationSeconds) => set((state) => ({ project: { ...state.project, targetDurationSeconds } })),
  setDurationMode: (durationMode) => set((state) => ({ project: { ...state.project, durationMode } })),
  setStyleClima: (styleClima) => set((state) => ({ project: { ...state.project, styleClima } })),
  setBrandColors: (primaryColor, secondaryColor) => set((state) => ({
    project: { ...state.project, brand: { ...state.project.brand, primaryColor, secondaryColor } }
  })),
  setSubtitleStyle: (subtitleStyle) => set((state) => ({
    project: { ...state.project, audio: { ...state.project.audio, subtitleStyle } }
  })),
  setStep: (step) => set((state) => ({ project: { ...state.project, currentStep: step } })),
  nextStep: () => set((state) => ({
    project: { ...state.project, currentStep: Math.min(6, state.project.currentStep + 1) }
  })),
  prevStep: () => set((state) => ({
    project: { ...state.project, currentStep: Math.max(1, state.project.currentStep - 1) }
  })),
  updateScene: (index, updatedScene) => set((state) => {
    const scenes = [...state.project.scenes];
    scenes[index] = { ...scenes[index], ...updatedScene };
    return { project: { ...state.project, scenes } };
  }),
  setScenes: (scenes) => set((state) => ({
    project: {
      ...state.project,
      scenes,
      targetDurationSeconds: scenes.reduce((acc, sc) => acc + sc.durationInSeconds, 0)
    }
  })),
  loadDemoScenes: () => set((state) => ({ project: { ...state.project, scenes: initialScenes } }))
}));
