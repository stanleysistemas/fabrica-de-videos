import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { hardwareService } from './hardwareService';

export interface ClonedVoiceRecord {
  id: string;
  name: string;
  engine: 'voicestudio_local' | 'elevenlabs';
  tone: string;
  description: string;
  sampleAudioPath?: string;
  voiceDesignPrompt?: string;
  accelerationMode: 'cuda' | 'cpu_gguf';
  createdAt: string;
}

class VoiceStudioService {
  private voiceStudioRoot: string;
  private voicesDbPath: string;

  constructor() {
    this.voiceStudioRoot = path.resolve(process.cwd(), '..', 'VoiceStudio');
    this.voicesDbPath = path.resolve(process.cwd(), 'storage', 'voices_vault.json');
    this.ensureStorage();
  }

  private async ensureStorage() {
    await fsPromises.mkdir(path.resolve(process.cwd(), 'storage', 'audio_samples'), { recursive: true });
    if (!fs.existsSync(this.voicesDbPath)) {
      const defaultVoices: ClonedVoiceRecord[] = [
        {
          id: 'voice_vs_marcus',
          name: 'Marcus Prime (Documentário)',
          engine: 'voicestudio_local',
          tone: 'grave',
          description: 'Voz profunda calibrada para autoridade, história e retenção narrativa estilo Vox.',
          accelerationMode: 'cpu_gguf',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'voice_vs_elena',
          name: 'Elena Tech (Dinâmica)',
          engine: 'voicestudio_local',
          tone: 'dinamico',
          description: 'Entonação ágil e moderna ideal para canais dark de tecnologia, curiosidades e finanças.',
          accelerationMode: 'cpu_gguf',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'voice_vs_rafael',
          name: 'Rafael Mistério (Investigativo)',
          engine: 'voicestudio_local',
          tone: 'misterioso',
          description: 'Sussurrado de alta fidelidade para histórias de terror, mistérios reais e conspirações.',
          accelerationMode: 'cpu_gguf',
          createdAt: new Date().toISOString(),
        },
      ];
      await fsPromises.writeFile(this.voicesDbPath, JSON.stringify(defaultVoices, null, 2), 'utf8');
    }
  }

  public async getEngineStatus() {
    const hw = await hardwareService.detectHardware();
    const voiceStudioExists = fs.existsSync(this.voiceStudioRoot);
    const backendExists = fs.existsSync(path.join(this.voiceStudioRoot, 'backend'));
    const omniVoiceExists = fs.existsSync(path.join(this.voiceStudioRoot, 'omnivoice'));

    const effectiveMode = hw.activeMode === 'auto' ? hw.recommendedMode : hw.activeMode;

    return {
      name: 'VoiceStudio OmniVoice Engine',
      isIntegrated: true,
      directoryExists: voiceStudioExists,
      backendReady: backendExists && omniVoiceExists,
      hardware: {
        cpu: hw.cpu.model,
        threads: hw.cpu.threads,
        hasNvidiaCuda: hw.hasNvidiaCuda,
        activeMode: effectiveMode,
        recommendation: hw.recommendedMode,
      },
      supportedFeatures: [
        'Clonagem com 5 segundos de áudio',
        'Voice Design (criar voz via descrição de texto)',
        'Síntese offline com custo zero',
        'Aceleração multi-core CPU (GGUF/AVX2) e NVIDIA CUDA',
      ],
    };
  }

  public async listVoices(): Promise<ClonedVoiceRecord[]> {
    await this.ensureStorage();
    try {
      const data = await fsPromises.readFile(this.voicesDbPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public async cloneVoice(payload: {
    name: string;
    tone: string;
    description: string;
    voiceDesignPrompt?: string;
    sampleBase64?: string;
    preferredMode?: 'auto' | 'cuda' | 'cpu_gguf';
  }): Promise<ClonedVoiceRecord> {
    await this.ensureStorage();
    const hw = await hardwareService.detectHardware();
    const mode = (payload.preferredMode && payload.preferredMode !== 'auto') 
      ? payload.preferredMode 
      : hw.recommendedMode;

    const voiceId = `voice_vs_${Date.now()}`;
    let sampleAudioPath: string | undefined = undefined;

    if (payload.sampleBase64) {
      const buffer = Buffer.from(payload.sampleBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
      const filename = `${voiceId}_sample.wav`;
      sampleAudioPath = path.resolve(process.cwd(), 'storage', 'audio_samples', filename);
      await fsPromises.writeFile(sampleAudioPath, buffer);
    }

    const newVoice: ClonedVoiceRecord = {
      id: voiceId,
      name: payload.name,
      engine: 'voicestudio_local',
      tone: payload.tone || 'grave',
      description: payload.description || 'Voz clonada localmente via VoiceStudio OmniVoice.',
      voiceDesignPrompt: payload.voiceDesignPrompt,
      sampleAudioPath,
      accelerationMode: mode,
      createdAt: new Date().toISOString(),
    };

    const currentVoices = await this.listVoices();
    currentVoices.unshift(newVoice);
    await fsPromises.writeFile(this.voicesDbPath, JSON.stringify(currentVoices, null, 2), 'utf8');

    return newVoice;
  }

  public async deleteVoice(id: string): Promise<boolean> {
    const currentVoices = await this.listVoices();
    const filtered = currentVoices.filter(v => v.id !== id);
    await fsPromises.writeFile(this.voicesDbPath, JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  }
}

export const voiceStudioService = new VoiceStudioService();
