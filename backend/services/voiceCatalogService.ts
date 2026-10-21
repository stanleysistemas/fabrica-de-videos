import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';
import { spawn } from 'child_process';
import { apiKeyService } from './apiKeyService';
import { voiceStudioService } from './voiceStudioService';

export interface VoiceItem {
  id: string;
  name: string;
  engine: 'voicestudio_local' | 'elevenlabs';
  group: string;
  description: string;
  sampleAudioUrl: string;
  isCloned: boolean;
}

export interface CatalogResult {
  voicestudio: VoiceItem[];
  elevenlabs: VoiceItem[];
  elevenlabsStatus: 'ok' | 'no_key' | 'error';
  elevenlabsMessage?: string;
}

const AUDIO_DIR = path.resolve(process.cwd(), 'storage', 'audio_samples');

function getElevenKey(): string {
  const entry = apiKeyService.getAllKeys().find((k) => k.id === 'elevenlabs');
  return (entry?.key || '').trim();
}

// Converte qualquer áudio gravado no navegador (webm/ogg) para WAV 44.1kHz mono normalizado
function convertToWav(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y', '-i', inputPath,
      '-ac', '1', '-ar', '44100',
      '-af', 'highpass=f=80,loudnorm=I=-18:TP=-2:LRA=11',
      outputPath,
    ]);
    let err = '';
    ff.stderr.on('data', (d) => (err += d.toString()));
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg falhou (${code}): ${err.slice(-300)}`))));
  });
}

export class VoiceCatalogService {
  public async getCatalog(): Promise<CatalogResult> {
    // 1. VoiceStudio local: somente vozes realmente clonadas (com áudio de amostra gravado)
    const vault = await voiceStudioService.listVoices();
    const voicestudio: VoiceItem[] = vault
      .filter((v) => v.sampleAudioPath && fs.existsSync(v.sampleAudioPath))
      .map((v) => ({
        id: v.id,
        name: v.name,
        engine: 'voicestudio_local' as const,
        group: 'Minhas vozes clonadas (local)',
        description: v.description,
        sampleAudioUrl: `/storage/audio_samples/${path.basename(v.sampleAudioPath as string)}`,
        isCloned: true,
      }));

    // 2. ElevenLabs: vozes reais da conta do usuário
    const key = getElevenKey();
    if (!key) {
      return { voicestudio, elevenlabs: [], elevenlabsStatus: 'no_key', elevenlabsMessage: 'Cadastre a chave do ElevenLabs em Hardware & Motores.' };
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
      if (!response.ok) {
        const body = await response.text();
        let msg = `ElevenLabs respondeu ${response.status}.`;
        try { msg = JSON.parse(body)?.detail?.message || msg; } catch {}
        return { voicestudio, elevenlabs: [], elevenlabsStatus: 'error', elevenlabsMessage: msg };
      }
      const data: any = await response.json();
      const labelGroup = (cat: string) =>
        cat === 'cloned' ? 'Minhas vozes clonadas (ElevenLabs)'
        : cat === 'professional' ? 'Vozes profissionais'
        : cat === 'generated' ? 'Vozes geradas'
        : 'Vozes padrão (premade)';

      const order = ['cloned', 'professional', 'generated', 'premade'];
      const elevenlabs: VoiceItem[] = (data.voices || [])
        .map((v: any) => ({
          id: v.voice_id,
          name: v.name,
          engine: 'elevenlabs' as const,
          group: labelGroup(v.category),
          description: v.description || Object.values(v.labels || {}).join(' • '),
          sampleAudioUrl: v.preview_url || '',
          isCloned: v.category === 'cloned',
          _cat: v.category,
        }))
        .sort((a: any, b: any) => order.indexOf(a._cat) - order.indexOf(b._cat))
        .map(({ _cat, ...rest }: any) => rest);

      return { voicestudio, elevenlabs, elevenlabsStatus: 'ok' };
    } catch (err: any) {
      return { voicestudio, elevenlabs: [], elevenlabsStatus: 'error', elevenlabsMessage: err.message };
    }
  }

  // Recebe a gravação do microfone, normaliza e clona nos destinos escolhidos
  public async cloneFromRecording(payload: {
    name: string;
    audioBase64: string;
    destinations: Array<'elevenlabs' | 'voicestudio'>;
  }) {
    await fsPromises.mkdir(AUDIO_DIR, { recursive: true });
    const stamp = Date.now();
    const rawPath = path.join(AUDIO_DIR, `rec_${stamp}.webm`);
    const wavPath = path.join(AUDIO_DIR, `voz_${stamp}.wav`);

    const base64 = payload.audioBase64.replace(/^data:[^;]+;base64,/, '');
    await fsPromises.writeFile(rawPath, Buffer.from(base64, 'base64'));
    await convertToWav(rawPath, wavPath);
    await fsPromises.unlink(rawPath).catch(() => {});

    const result: any = { wavUrl: `/storage/audio_samples/voz_${stamp}.wav`, elevenlabs: null, voicestudio: null, errors: [] as string[] };

    if (payload.destinations.includes('voicestudio')) {
      const wavBuffer = await fsPromises.readFile(wavPath);
      const cloned = await voiceStudioService.cloneVoice({
        name: payload.name,
        tone: 'natural',
        description: 'Voz clonada a partir de gravação própria no microfone.',
        sampleBase64: wavBuffer.toString('base64'),
      });
      result.voicestudio = { id: cloned.id, name: cloned.name };
    }

    if (payload.destinations.includes('elevenlabs')) {
      const key = getElevenKey();
      if (!key) {
        result.errors.push('Chave do ElevenLabs não cadastrada.');
      } else {
        try {
          const form = new FormData();
          form.append('name', payload.name);
          form.append('remove_background_noise', 'true');
          const wavBuffer = await fsPromises.readFile(wavPath);
          form.append('files', new Blob([wavBuffer], { type: 'audio/wav' }), `voz_${stamp}.wav`);
          const resp = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: { 'xi-api-key': key },
            body: form,
          });
          const body: any = await resp.json().catch(() => ({}));
          if (resp.ok) {
            result.elevenlabs = { id: body.voice_id, name: payload.name };
          } else {
            result.errors.push(`ElevenLabs: ${body?.detail?.message || body?.detail || resp.status}`);
          }
        } catch (err: any) {
          result.errors.push(`ElevenLabs: ${err.message}`);
        }
      }
    }

    return result;
  }
}

export const voiceCatalogService = new VoiceCatalogService();
