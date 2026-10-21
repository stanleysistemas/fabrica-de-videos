import fs from 'fs';
import path from 'path';

export interface ApiDefinition {
  id: string;
  name: string;
  category: 'llm' | 'voice' | 'video' | 'avatar';
  categoryLabel: string;
  description: string;
  linkToGet: string;
}

export interface StoredApiKey {
  id: string;
  key: string;
  isPrimary: boolean;
  updatedAt: string;
}

export const SUPPORTED_APIS: ApiDefinition[] = [
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    category: 'llm',
    categoryLabel: 'Inteligência Artificial (LLM)',
    description: 'Modelos Gemini 1.5 Pro / Flash para visão de vídeo e roteirização.',
    linkToGet: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4 / Whisper)',
    category: 'llm',
    categoryLabel: 'Inteligência Artificial (LLM)',
    description: 'Modelos GPT-4o para criação de roteiros e Whisper para transcrição.',
    linkToGet: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude AI',
    category: 'llm',
    categoryLabel: 'Inteligência Artificial (LLM)',
    description: 'Claude 3.5 Sonnet para direção de arte e roteiros ultra humanizados.',
    linkToGet: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs API',
    category: 'voice',
    categoryLabel: 'Voz & Clonagem',
    description: 'Clonagem de voz profissional de estúdio e vozes neurais ultra realistas.',
    linkToGet: 'https://elevenlabs.io/app/speech-synthesis',
  },
  {
    id: 'pexels',
    name: 'Pexels API',
    category: 'video',
    categoryLabel: 'Vídeos de Fundo (B-Roll)',
    description: 'Banco gratuito com milhões de vídeos em Full HD e 4K sem royalties.',
    linkToGet: 'https://www.pexels.com/api/',
  },
  {
    id: 'pixabay',
    name: 'Pixabay API',
    category: 'video',
    categoryLabel: 'Vídeos de Fundo (B-Roll)',
    description: 'Banco gratuito de vídeos cinematográficos e B-Roll de gameplay.',
    linkToGet: 'https://pixabay.com/api/docs/',
  },
  {
    id: 'heygen',
    name: 'HeyGen API (Talking Photo)',
    category: 'avatar',
    categoryLabel: 'Avatar & Lip-Sync',
    description: 'Animação facial e sincronia labial perfeita a partir de foto estática.',
    linkToGet: 'https://app.heygen.com/settings?nav=API',
  },
  {
    id: 'replicate',
    name: 'Replicate API (LatentSync ByteDance)',
    category: 'avatar',
    categoryLabel: 'Avatar & Lip-Sync',
    description: 'Execução do modelo ByteDance LatentSync em GPU A100 em nuvem.',
    linkToGet: 'https://replicate.com/account/api-tokens',
  },
];

class ApiKeyService {
  private configPath: string;

  constructor() {
    this.configPath = path.resolve(process.cwd(), 'storage', 'api_keys.json');
    this.ensureConfig();
  }

  private ensureConfig() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, JSON.stringify({ entries: {} }, null, 2), 'utf8');
    }
  }

  private readRawData(): any {
    this.ensureConfig();
    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return { entries: {} };
    }
  }

  private writeRawData(data: any) {
    fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Lista todas as APIs com seus valores salvos e metadados
  public getAllKeys() {
    const raw = this.readRawData();
    const entries = raw.entries || {};

    return SUPPORTED_APIS.map((def) => {
      const saved = entries[def.id] || {};
      const keyVal = saved.key || '';
      return {
        ...def,
        key: keyVal,
        maskedKey: keyVal ? (keyVal.length > 8 ? `${keyVal.slice(0, 4)}••••${keyVal.slice(-4)}` : '••••••••') : '',
        isConfigured: Boolean(keyVal && keyVal.trim().length > 0),
        isPrimary: Boolean(saved.isPrimary),
        updatedAt: saved.updatedAt || null,
      };
    });
  }

  // Grava ou atualiza uma chave de API
  public saveKey(id: string, key: string, isPrimary: boolean) {
    const raw = this.readRawData();
    if (!raw.entries) raw.entries = {};

    // Se marcou como principal, desmarca outras da mesma categoria
    const targetDef = SUPPORTED_APIS.find((a) => a.id === id);
    if (isPrimary && targetDef) {
      SUPPORTED_APIS.filter((a) => a.category === targetDef.category).forEach((catApi) => {
        if (raw.entries[catApi.id]) {
          raw.entries[catApi.id].isPrimary = false;
        }
      });
    }

    raw.entries[id] = {
      key: key.trim(),
      isPrimary: Boolean(isPrimary),
      updatedAt: new Date().toISOString(),
    };

    // Sincroniza também no formato plano legado para stockVideoService
    if (id === 'pexels') raw.pexelsApiKey = key.trim();
    if (id === 'pixabay') raw.pixabayApiKey = key.trim();
    if (id === 'heygen') raw.heygenApiKey = key.trim();
    if (id === 'replicate') raw.replicateApiToken = key.trim();

    this.writeRawData(raw);
    return this.getAllKeys();
  }

  // Remove/Limpa uma chave de API
  public deleteKey(id: string) {
    const raw = this.readRawData();
    if (raw.entries && raw.entries[id]) {
      delete raw.entries[id];
    }
    if (id === 'pexels') delete raw.pexelsApiKey;
    if (id === 'pixabay') delete raw.pixabayApiKey;
    if (id === 'heygen') delete raw.heygenApiKey;
    if (id === 'replicate') delete raw.replicateApiToken;

    this.writeRawData(raw);
    return this.getAllKeys();
  }
}

export const apiKeyService = new ApiKeyService();
