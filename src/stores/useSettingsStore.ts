import { create } from 'zustand';

export interface ClonedVoice {
  id: string;
  name: string;
  description: string;
  sampleAudioUrl?: string;
  createdAt: string;
  engine: 'voice_studio_omni' | 'eleven_labs_clone';
  tone: 'grave' | 'dinamico' | 'suave' | 'corporativo';
}

export interface ApiKeysConfig {
  geminiApiKey: string;
  claudeApiKey: string;
  openaiApiKey: string;
  elevenLabsApiKey: string;
}

export interface HardwareOption {
  id: 'auto' | 'cuda' | 'cpu_gguf';
  label: string;
  description: string;
  available: boolean;
  recommended: boolean;
}

export interface HardwareInfo {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    architecture: string;
  };
  gpus: Array<{
    name: string;
    vendor: string;
    vramMB?: number;
    driverVersion?: string;
    cudaSupported: boolean;
    discrete: boolean;
  }>;
  ramGB: number;
  hasNvidiaCuda: boolean;
  recommendedMode: 'cuda' | 'cpu_gguf';
  activeMode: 'auto' | 'cuda' | 'cpu_gguf';
  options: HardwareOption[];
}

interface SettingsState {
  apiKeys: ApiKeysConfig;
  clonedVoices: ClonedVoice[];
  isApiSettingsOpen: boolean;
  isVoiceLabOpen: boolean;
  hardware: HardwareInfo | null;
  isLoadingHardware: boolean;
  defaultEngine: 'voicestudio_local' | 'elevenlabs';
  setDefaultEngine: (engine: 'voicestudio_local' | 'elevenlabs') => void;
  fetchHardware: () => Promise<void>;
  setHardwareMode: (mode: 'auto' | 'cuda' | 'cpu_gguf') => Promise<void>;
  setApiKeys: (keys: Partial<ApiKeysConfig>) => void;
  openApiSettings: () => void;
  closeApiSettings: () => void;
  openVoiceLab: () => void;
  closeVoiceLab: () => void;
  addClonedVoice: (voice: Omit<ClonedVoice, 'id' | 'createdAt'>) => void;
  deleteClonedVoice: (id: string) => void;
}

const defaultVoices: ClonedVoice[] = [
  {
    id: 'voice_stanley_official',
    name: 'Minha Voz Oficial (Clonada)',
    description: 'Tom firme e natural para canais de tecnologia, negócios e tutoriais.',
    createdAt: '2026-10-20',
    engine: 'voice_studio_omni',
    tone: 'grave',
  },
  {
    id: 'voice_doc_dark',
    name: 'Narrador Sombrio (Estilo VOX)',
    description: 'Voz profunda com pausas dramáticas para mistérios e fatos históricos.',
    createdAt: '2026-10-18',
    engine: 'voice_studio_omni',
    tone: 'grave',
  },
  {
    id: 'voice_viral_energetic',
    name: 'Locutor Viral (Shorts / TikTok)',
    description: 'Ritmo acelerado, dicção clara e alta energia para os primeiros 3 segundos.',
    createdAt: '2026-10-15',
    engine: 'voice_studio_omni',
    tone: 'dinamico',
  },
];

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKeys: {
    geminiApiKey: localStorage.getItem('gemini_api_key') || '',
    claudeApiKey: localStorage.getItem('claude_api_key') || '',
    openaiApiKey: localStorage.getItem('openai_api_key') || '',
    elevenLabsApiKey: localStorage.getItem('elevenlabs_api_key') || '',
  },
  clonedVoices: defaultVoices,
  isApiSettingsOpen: false,
  isVoiceLabOpen: false,
  hardware: null,
  isLoadingHardware: false,
  defaultEngine: (localStorage.getItem('default_voice_engine') as any) || 'voicestudio_local',

  setDefaultEngine: (engine) => {
    localStorage.setItem('default_voice_engine', engine);
    set({ defaultEngine: engine });
  },

  fetchHardware: async () => {
    set({ isLoadingHardware: true });
    try {
      const res = await fetch('http://localhost:3001/api/hardware/detect');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.hardware) {
          set({ hardware: data.hardware });
        }
      }
    } catch (err) {
      console.warn('[useSettingsStore] Falha ao detectar hardware:', err);
    } finally {
      set({ isLoadingHardware: false });
    }
  },

  setHardwareMode: async (mode) => {
    try {
      const res = await fetch('http://localhost:3001/api/hardware/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        set((state) => ({
          hardware: state.hardware ? { ...state.hardware, activeMode: mode } : null,
        }));
      }
    } catch (err) {
      console.error('[useSettingsStore] Erro ao salvar modo de hardware:', err);
    }
  },

  setApiKeys: (keys) =>
    set((state) => {
      const updated = { ...state.apiKeys, ...keys };
      if (keys.geminiApiKey !== undefined) localStorage.setItem('gemini_api_key', keys.geminiApiKey);
      if (keys.claudeApiKey !== undefined) localStorage.setItem('claude_api_key', keys.claudeApiKey);
      if (keys.openaiApiKey !== undefined) localStorage.setItem('openai_api_key', keys.openaiApiKey);
      if (keys.elevenLabsApiKey !== undefined) localStorage.setItem('elevenlabs_api_key', keys.elevenLabsApiKey);
      return { apiKeys: updated };
    }),
  openApiSettings: () => set({ isApiSettingsOpen: true }),
  closeApiSettings: () => set({ isApiSettingsOpen: false }),
  openVoiceLab: () => set({ isVoiceLabOpen: true }),
  closeVoiceLab: () => set({ isVoiceLabOpen: false }),
  addClonedVoice: (voiceData) =>
    set((state) => ({
      clonedVoices: [
        {
          ...voiceData,
          id: `voice_${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        },
        ...state.clonedVoices,
      ],
    })),
  deleteClonedVoice: (id) =>
    set((state) => ({
      clonedVoices: state.clonedVoices.filter((v) => v.id !== id),
    })),
}));
