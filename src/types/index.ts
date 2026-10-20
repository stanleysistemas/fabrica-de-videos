export type AspectRatio = '9:16' | '16:9' | '1:1';

export type SubtitleStyle = 'pilula' | 'karaoke' | 'caixa';

export type VideoStyleClima = 
  | 'tecnologico' 
  | 'minimalista' 
  | 'energetico' 
  | 'elegante' 
  | 'documentario_vox';

export interface SceneCut {
  id: string;
  type: 'hero_title' | 'screenshot_synthetic' | 'terminal_scene' | 'stat_card' | 'text_card' | 'ken_burns_news';
  title?: string;
  subtitle?: string;
  text?: string;
  narration: string;
  durationInSeconds: number;
  statValue?: string;
  statLabel?: string;
  terminalCommand?: string;
  terminalOutput?: string;
  screenshotUrl?: string;
  bgGradient?: string;
  imageUrl?: string;
  associatedImageUrl?: string;
  kenBurnsEffect?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode?: 'full_image' | 'webcam_streamer';
}

export interface BrandKit {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface AudioSettings {
  voiceEngine: 'voice_studio' | 'edge_tts' | 'eleven_labs';
  voiceName: string;
  includeBgm: boolean;
  bgmVolume: number;
  autoDucking: boolean;
  subtitleStyle: SubtitleStyle;
}

export interface ProjectConfig {
  id: string;
  topic: string;
  referenceUrl?: string;
  aspectRatio: AspectRatio;
  targetDurationSeconds: number;
  sourceDurationSeconds?: number;
  durationMode: 'source_exact' | 'custom_cut';
  styleClima: VideoStyleClima;
  brand: BrandKit;
  audio: AudioSettings;
  mandatoryTexts: string[];
  scenes: SceneCut[];
  currentStep: number;
  status: 'draft' | 'analyzing' | 'script_ready' | 'rendering' | 'qa_check' | 'completed';
}
