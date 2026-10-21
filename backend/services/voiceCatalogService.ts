import { apiKeyService } from './apiKeyService';
import { voiceStudioService } from './voiceStudioService';

export interface VoiceItem {
  id: string;
  name: string;
  engine: 'voicestudio_local' | 'elevenlabs';
  categoryLabel: string;
  tone: string;
  description: string;
  sampleAudioUrl: string;
  isCustomCloned?: boolean;
}

export class VoiceCatalogService {
  // Lista de vozes do ElevenLabs com URLs oficiais de áudio preview
  private elevenLabsCuratedVoices: VoiceItem[] = [
    {
      id: 'pNInz6obpgDQGcFmaJgB', // Adam
      name: 'Adam (Profundo & Confiante)',
      engine: 'elevenlabs',
      categoryLabel: 'ElevenLabs Nuvem',
      tone: 'grave',
      description: 'Tom firme, confiante e cinematográfico. Excelente para narração épica e tech.',
      sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/pNInz6obpgDQGcFmaJgB/sample.mp3',
    },
    {
      id: 'ErXwobaYiN019PkySvjV', // Antoni
      name: 'Antoni (Gamer & Dinâmico)',
      engine: 'elevenlabs',
      categoryLabel: 'ElevenLabs Nuvem',
      tone: 'dinamico',
      description: 'Ritmo enérgico, dicção clara e casual. Perfeito para notícias de games e lives.',
      sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/ErXwobaYiN019PkySvjV/sample.mp3',
    },
    {
      id: '21m00Tcm4TlvDq8ikWAM', // Rachel
      name: 'Rachel (Noticiosa & Calma)',
      engine: 'elevenlabs',
      categoryLabel: 'ElevenLabs Nuvem',
      tone: 'suave',
      description: 'Voz feminina clara e profissional, padrão de telejornais e reportagens.',
      sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/21m00Tcm4TlvDq8ikWAM/sample.mp3',
    },
    {
      id: 'onwK4e9ZLuTAKqWW03F9', // Daniel
      name: 'Daniel (Documentário Sério)',
      engine: 'elevenlabs',
      categoryLabel: 'ElevenLabs Nuvem',
      tone: 'grave',
      description: 'Voz madura e detalhista para dossiês e matérias investigativas.',
      sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/onwK4e9ZLuTAKqWW03F9/sample.mp3',
    },
  ];

  // Obter todas as vozes (VoiceStudio local + ElevenLabs)
  public async getCatalog(): Promise<{ voicestudio: VoiceItem[]; elevenlabs: VoiceItem[] }> {
    const localVault = await voiceStudioService.listVoices();

    const localVoices: VoiceItem[] = [
      {
        id: 'voice_stanley_official',
        name: 'Minha Voz Oficial (Clonada - Stanley Alves)',
        engine: 'voicestudio_local',
        categoryLabel: 'VoiceStudio Local (Custo $0)',
        tone: 'grave',
        description: 'Voz personalizada com o bordão "Fala moçada! Segura o controle..." calibrada para games e tech.',
        sampleAudioUrl: '/storage/audio_samples/stanley_voice_preview.mp3',
        isCustomCloned: true,
      },
      ...localVault.map((v) => ({
        id: v.id,
        name: v.name,
        engine: 'voicestudio_local' as const,
        categoryLabel: 'VoiceStudio Local (Custo $0)',
        tone: v.tone,
        description: v.description,
        sampleAudioUrl: '/storage/audio_samples/sample_generic.mp3',
        isCustomCloned: false,
      })),
    ];

    // Se houver chave do ElevenLabs cadastrada, podemos tentar consultar as vozes da conta do usuário
    let elevenVoices = [...this.elevenLabsCuratedVoices];
    const keys = apiKeyService.getAllKeys();
    const elevenKey = keys.find((k) => k.id === 'elevenlabs')?.key;

    if (elevenKey && elevenKey.trim().length > 10) {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': elevenKey.trim() },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.voices && Array.isArray(data.voices)) {
            const apiVoices: VoiceItem[] = data.voices.slice(0, 8).map((v: any) => ({
              id: v.voice_id,
              name: `${v.name} (${v.category || 'Conta'})`,
              engine: 'elevenlabs',
              categoryLabel: 'ElevenLabs Nuvem',
              tone: v.labels?.accent || 'neutro',
              description: v.labels?.description || `Voz ${v.name} da sua conta ElevenLabs`,
              sampleAudioUrl: v.preview_url || '',
              isCustomCloned: v.category === 'cloned',
            }));
            if (apiVoices.length > 0) {
              elevenVoices = apiVoices;
            }
          }
        }
      } catch (err) {
        console.warn('[VoiceCatalog] Falha ao consultar vozes dinâmicas do ElevenLabs, usando catálogo curado:', err);
      }
    }

    return {
      voicestudio: localVoices,
      elevenlabs: elevenVoices,
    };
  }
}

export const voiceCatalogService = new VoiceCatalogService();
