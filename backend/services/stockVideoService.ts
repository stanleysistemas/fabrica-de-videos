import fs from 'fs';
import path from 'path';

export interface StockVideoResult {
  id: string;
  source: 'pexels' | 'pixabay';
  title: string;
  previewUrl: string;
  videoUrl: string;
  duration: number;
  width: number;
  height: number;
}

interface ApiKeysConfig {
  pexelsApiKey?: string;
  pixabayApiKey?: string;
  heygenApiKey?: string;
  replicateApiToken?: string;
}

class StockVideoService {
  private configPath: string;

  constructor() {
    this.configPath = path.resolve(process.cwd(), 'storage', 'api_keys.json');
    this.ensureConfig();
  }

  private ensureConfig() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, JSON.stringify({}, null, 2), 'utf8');
    }
  }

  public getKeys(): ApiKeysConfig {
    this.ensureConfig();
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch {
      return {};
    }
  }

  public saveKeys(keys: Partial<ApiKeysConfig>) {
    const current = this.getKeys();
    const updated = { ...current, ...keys };
    fs.writeFileSync(this.configPath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  }

  // Buscar vídeos gratuitos no Pexels
  public async searchPexels(query: string, perPage = 10): Promise<StockVideoResult[]> {
    const keys = this.getKeys();
    const apiKey = keys.pexelsApiKey || process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return [];
    }

    try {
      const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`, {
        headers: { Authorization: apiKey },
      });
      if (!res.ok) return [];

      const data = await res.json();
      const results: StockVideoResult[] = (data.videos || []).map((v: any) => {
        // Encontrar arquivo de vídeo em HD
        const file = v.video_files?.find((f: any) => f.quality === 'hd' && f.width >= 1280) || v.video_files?.[0];
        return {
          id: `pexels_${v.id}`,
          source: 'pexels',
          title: `Pexels: ${query} (${v.duration}s)`,
          previewUrl: v.image,
          videoUrl: file?.link || '',
          duration: v.duration || 15,
          width: file?.width || 1920,
          height: file?.height || 1080,
        };
      });

      return results;
    } catch (err: any) {
      console.warn('[StockVideoService] Erro ao buscar no Pexels:', err.message);
      return [];
    }
  }

  // Buscar vídeos gratuitos no Pixabay
  public async searchPixabay(query: string, perPage = 10): Promise<StockVideoResult[]> {
    const keys = this.getKeys();
    const apiKey = keys.pixabayApiKey || process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      return [];
    }

    try {
      const res = await fetch(`https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}&video_type=all`,);
      if (!res.ok) return [];

      const data = await res.json();
      const results: StockVideoResult[] = (data.hits || []).map((h: any) => {
        const videoMedium = h.videos?.medium || h.videos?.large || h.videos?.small;
        return {
          id: `pixabay_${h.id}`,
          source: 'pixabay',
          title: `Pixabay: ${h.tags || query} (${h.duration}s)`,
          previewUrl: h.userImageURL || `https://i.vimeocdn.com/video/${h.picture_id}_640x360.jpg`,
          videoUrl: videoMedium?.url || '',
          duration: h.duration || 15,
          width: videoMedium?.width || 1280,
          height: videoMedium?.height || 720,
        };
      });

      return results;
    } catch (err: any) {
      console.warn('[StockVideoService] Erro ao buscar no Pixabay:', err.message);
      return [];
    }
  }

  // Busca combinada
  public async searchVideos(query: string): Promise<StockVideoResult[]> {
    const [pexels, pixabay] = await Promise.all([
      this.searchPexels(query, 8),
      this.searchPixabay(query, 8),
    ]);
    return [...pexels, ...pixabay];
  }
}

export const stockVideoService = new StockVideoService();
