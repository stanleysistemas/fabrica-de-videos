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

interface SettingsState {
  apiKeys: ApiKeysConfig;
  clonedVoices: ClonedVoice[];
  isApiSettingsOpen: boolean;
  isVoiceLabOpen: boolean;
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
