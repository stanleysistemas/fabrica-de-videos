import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, Link, Check, RefreshCw, Copy, Search, 
  Gamepad2, Image as ImageIcon, Film, X, AlertTriangle,
  Tv, Smartphone, Clock, User, Mic, Globe2, ArrowRight, ArrowLeft,
  Upload, CheckCircle2, Video, Play, Pause, Square, Volume2, Camera,
  Radio, RotateCcw, Save, Filter, Wand2, Clapperboard, HeartHandshake,
  ArrowUp, ArrowDown, Edit3, Trash2, Layers, Download
} from 'lucide-react';

export interface IntroPreset {
  id: string;
  name: string;
  hookPhrase: string;
  readingGuide: string;
  isDefault: boolean;
  updatedAt?: string;
}

export interface OutroPreset {
  id: string;
  name: string;
  outroPhrase: string;
  isDefault: boolean;
  updatedAt?: string;
}

export interface NewsSceneDraft {
  id: string;
  order: number;
  type: 'ken_burns_news' | 'avatar_intro' | 'avatar_outro' | 'gameplay_broll';
  heading: string;
  subheading?: string;
  narration: string;
  durationInSeconds: number;
  associatedImageId?: string;
  associatedImageUrl?: string;
  kenBurnsEffect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode: 'full_image' | 'webcam_streamer' | 'gameplay_with_webcam' | 'avatar_fullscreen';
  category?: string;
  audioUrl?: string;
  lipSyncVideoUrl?: string;
}

export interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
  themeFocus: string;
  customPrompt?: string;
  targetDurationMinutes: number;
  totalDurationSeconds: number;
  scenes: NewsSceneDraft[];
  suggestedVoiceId: string;
  styleMode: string;
  brollSource?: {
    channel: string;
    label: string;
  };
}

interface ScrapedImage {
  id: string;
  url: string;
  alt: string;
  category?: string;
  isCover: boolean;
}

interface ContentSection {
  id?: string;
  heading: string;
  subheading?: string;
  content: string;
  category: string;
}

interface ScrapedArticle {
  id: string;
  sourceUrl: string;
  siteName: string;
  title: string;
  description: string;
  sections: ContentSection[];
  paragraphs: string[];
  fullText: string;
  images: ScrapedImage[];
  fullTextPath?: string;
  jsonPath?: string;
}

interface StockVideoItem {
  id: string;
  source: 'pexels' | 'pixabay';
  title: string;
  previewUrl: string;
  videoUrl: string;
  duration: number;
  width: number;
  height: number;
}

interface AvatarOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'setup_fullscreen' | 'webcam_corner' | 'custom';
}

interface VoiceItem {
  id: string;
  name: string;
  engine: 'voicestudio_local' | 'elevenlabs';
  group: string;
  description: string;
  sampleAudioUrl: string;
  isCloned: boolean;
}

export const NewsToVideoView: React.FC = () => {
  // Controle de Tela (1 = Configurações Prévia, 2 = Texto Capturado e Mídias, 3 = Direção & Decupagem de Cenas)
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);

  // === TELA 3: ESTADOS DO PLANO DE CENAS, ROTEIRO E LIP-SYNC ===
  const [videoPlan, setVideoPlan] = useState<NewsVideoPlan | null>(null);
  const [scenes, setScenes] = useState<NewsSceneDraft[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [activePreviewSceneAudioId, setActivePreviewSceneAudioId] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [targetSceneIdForImagePicker, setTargetSceneIdForImagePicker] = useState<string | null>(null);
  const [sceneLipSyncStatus, setSceneLipSyncStatus] = useState<Record<string, { loading: boolean; videoUrl?: string }>>({});
  const [isRenderingFinalVideo, setIsRenderingFinalVideo] = useState(false);
  const [renderedVideoResult, setRenderedVideoResult] = useState<any | null>(null);

  // === TELA 1: ESTADOS DE CONFIGURAÇÃO PRÉVIA ===
  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical'>('horizontal'); // 16:9 ou 9:16
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5); // 1, 3, 5, 10, 15 min
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('avatar_stanley_setup');
  const [voiceEngine, setVoiceEngine] = useState<'voicestudio_local' | 'elevenlabs'>('voicestudio_local');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('voice_vs_1792608137918');
  const [language, setLanguage] = useState<string>('pt-BR'); // pt-BR, en-US, es-ES
  const [lipSyncEngine, setLipSyncEngine] = useState<'heygen' | 'latentsync'>('heygen');

  // Catálogo Real de Vozes (ElevenLabs e VoiceStudio)
  const [voiceCatalog, setVoiceCatalog] = useState<{
    voicestudio: VoiceItem[];
    elevenlabs: VoiceItem[];
    elevenlabsStatus: string;
    elevenlabsMessage?: string;
  }>({
    voicestudio: [],
    elevenlabs: [],
    elevenlabsStatus: 'loading',
  });
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Player de Áudio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modal de Gravação de Voz via Microfone
  const [showVoiceCloneModal, setShowVoiceCloneModal] = useState(false);
  const [cloneVoiceName, setCloneVoiceName] = useState('Minha Voz Oficial (Stanley Alves)');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [cloneDestinations, setCloneDestinations] = useState<Array<'voicestudio' | 'elevenlabs'>>(['voicestudio', 'elevenlabs']);
  const [isCloningVoice, setIsCloningVoice] = useState(false);
  const [cloneFeedback, setCloneFeedback] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Modal para assistir ao vídeo de Lip-Sync gerado em tela cheia
  const [expandedLipSyncVideo, setExpandedLipSyncVideo] = useState<{ url: string; heading: string } | null>(null);

  // Flag se o texto já foi humanizado nesta sessão
  const [hasHumanized, setHasHumanized] = useState(false);

  // Lista de Avatares Cadastrados
  const [avatarsList, setAvatarsList] = useState<AvatarOption[]>([
    {
      id: 'avatar_stanley_setup',
      name: 'Stanley Alves (Estúdio Gamer Completo)',
      description: 'Câmera Inteligente: Tela cheia na abertura (0-8s) ➔ Webcam no canto com borda neon.',
      imageUrl: 'http://localhost:3001/storage/avatars/avatar_stanley_setup.jpg',
      type: 'setup_fullscreen',
    },
    {
      id: 'avatar_stanley_webcam',
      name: 'Stanley Alves (Webcam Gamer Close-Up)',
      description: 'Close-up direto com microfone e iluminação profissional de streamer.',
      imageUrl: 'http://localhost:3001/storage/avatars/avatar_stanley_webcam.jpg',
      type: 'webcam_corner',
    },
  ]);

  // Modal para criar/cadastrar avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatarName, setNewAvatarName] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [avatarErrorAlert, setAvatarErrorAlert] = useState(false);

  // === TELA 2: ESTADOS DE CONTEÚDO CAPTURADO & MÍDIAS ===
  const [isLoadingScrape, setIsLoadingScrape] = useState(false);
  const [article, setArticle] = useState<ScrapedArticle | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [rawTextSearch, setRawTextSearch] = useState('');
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [editedFullText, setEditedFullText] = useState<string>('');

  // Presets de Bordão & Abertura (Inicializados e Persistidos no SQLite)
  const [introPresets, setIntroPresets] = useState<IntroPreset[]>([
    {
      id: 'preset_gamer',
      name: '🎮 Gamer / Gameplay Descontraído (CoD)',
      hookPhrase: 'Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo...',
      readingGuide: 'Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo! Sejam muito bem-vindos ao canal! Hoje nós vamos analisar todas as novidades, armas e estratégias do lançamento...',
      isDefault: true,
    },
    {
      id: 'preset_politica_tech',
      name: '⚡ Opinião / Política / Tech',
      hookPhrase: 'Fala pessoal! Hoje vamos analisar os bastidores e o que ninguém te contou sobre isso...',
      readingGuide: 'Sejam todos muito bem-vindos! No vídeo de hoje nós vamos dissecar os bastidores, as decisões que estão em jogo e como essa pauta impacta diretamente o seu dia a dia. Compartilhe esse vídeo com seus amigos e participe da discussão!',
      isDefault: false,
    },
  ]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_gamer');
  const [customHookPhrase, setCustomHookPhrase] = useState<string>('Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo...');
  const [customReadingGuide, setCustomReadingGuide] = useState<string>('Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo! Sejam muito bem-vindos ao canal! Hoje nós vamos analisar todas as novidades, armas e estratégias do lançamento...');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetSavedFeedback, setPresetSavedFeedback] = useState(false);
  const [showNewPresetModal, setShowNewPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Vídeo de Fundo Contínuo (B-Roll)
  const [brollVideoSource, setBrollVideoSource] = useState<string>('@stanleyalvesbr');
  const [selectedStockVideo, setSelectedStockVideo] = useState<StockVideoItem | null>(null);

  // Modal de Stock Videos
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('gameplay 4k');
  const [isSearchingStock, setIsSearchingStock] = useState(false);
  const [stockVideos, setStockVideos] = useState<StockVideoItem[]>([]);

  // Carregar presets de abertura do SQLite
  const loadIntroPresets = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/settings/intro-presets');
      if (res.ok) {
        const data = await res.json();
        if (data.presets && data.presets.length > 0) {
          setIntroPresets(data.presets);
          const defaultPreset = data.presets.find((p: IntroPreset) => p.isDefault) || data.presets[0];
          setSelectedPresetId(defaultPreset.id);
          setCustomHookPhrase(defaultPreset.hookPhrase);
          setCustomReadingGuide(defaultPreset.readingGuide);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar presets de abertura:', err);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = introPresets.find((x) => x.id === presetId);
    if (p) {
      setCustomHookPhrase(p.hookPhrase);
      setCustomReadingGuide(p.readingGuide);
    }
  };

  const handleSaveCurrentPreset = async () => {
    if (!customHookPhrase.trim()) {
      alert('Informe a frase de abertura/gancho.');
      return;
    }
    setIsSavingPreset(true);
    try {
      const current = introPresets.find((p) => p.id === selectedPresetId);
      const res = await fetch('http://localhost:3001/api/settings/intro-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPresetId,
          name: current?.name || 'Preset Personalizado',
          hookPhrase: customHookPhrase.trim(),
          readingGuide: customReadingGuide.trim() || customHookPhrase.trim(),
          isDefault: true,
        }),
      });
      if (res.ok) {
        setPresetSavedFeedback(true);
        setTimeout(() => setPresetSavedFeedback(false), 2500);
        await loadIntroPresets();
      }
    } catch (err) {
      console.error('Erro ao salvar preset:', err);
      alert('Erro ao salvar preset no banco.');
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleCreateNewPreset = async () => {
    if (!newPresetName.trim() || !customHookPhrase.trim()) {
      alert('Informe o nome do preset e a frase de abertura.');
      return;
    }
    setIsSavingPreset(true);
    try {
      const res = await fetch('http://localhost:3001/api/settings/intro-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPresetName.trim(),
          hookPhrase: customHookPhrase.trim(),
          readingGuide: customReadingGuide.trim() || customHookPhrase.trim(),
          isDefault: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await loadIntroPresets();
        if (data.preset?.id) {
          setSelectedPresetId(data.preset.id);
        }
        setShowNewPresetModal(false);
        setNewPresetName('');
      }
    } catch (err) {
      console.error('Erro ao criar preset:', err);
    } finally {
      setIsSavingPreset(false);
    }
  };

  // Presets de Encerramento (CTA / Seguir / Like) persistidos no SQLite
  const [outroPresets, setOutroPresets] = useState<OutroPreset[]>([
    {
      id: 'outro_gamer',
      name: '🎮 Gamer / Inscrição e Like',
      outroPhrase:
        'E você, o que achou dessa novidade? Deixa nos comentários qual arma você vai testar primeiro, esmaga o botão de like, se inscreve no canal @stanleyalvesbr e até o próximo vídeo!',
      isDefault: true,
    },
    {
      id: 'outro_tech',
      name: '⚡ Tech / Comunidade & Opinião',
      outroPhrase:
        'Qual a sua opinião técnica sobre esse lançamento? Comente aqui embaixo, não esquece de deixar aquele like fortalecedor e ativar o sininho para mais análises completas como essa!',
      isDefault: false,
    },
  ]);
  const [selectedOutroPresetId, setSelectedOutroPresetId] = useState<string>('outro_gamer');
  const [customOutroPhrase, setCustomOutroPhrase] = useState<string>(
    'E você, o que achou dessa novidade? Deixa nos comentários qual arma você vai testar primeiro, esmaga o botão de like, se inscreve no canal @stanleyalvesbr e até o próximo vídeo!'
  );
  const [isSavingOutroPreset, setIsSavingOutroPreset] = useState(false);
  const [outroSavedFeedback, setOutroSavedFeedback] = useState(false);

  // Tipo de Formato do Vídeo (Live Streamer vs VOX vs Noticiário Ágil)
  const [videoFormatType, setVideoFormatType] = useState<'live_streamer' | 'vox_documentary' | 'tech_capsule'>('live_streamer');

  // Estado da Humanizer
  const [isHumanizingText, setIsHumanizingText] = useState(false);
  const [humanizeFeedback, setHumanizeFeedback] = useState<string | null>(null);

  // Carregar presets de encerramento do SQLite
  const loadOutroPresets = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/settings/outro-presets');
      if (res.ok) {
        const data = await res.json();
        if (data.presets && data.presets.length > 0) {
          setOutroPresets(data.presets);
          const defaultPreset = data.presets.find((p: OutroPreset) => p.isDefault) || data.presets[0];
          setSelectedOutroPresetId(defaultPreset.id);
          setCustomOutroPhrase(defaultPreset.outroPhrase);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar presets de encerramento:', err);
    }
  };

  const handleSelectOutroPreset = (presetId: string) => {
    setSelectedOutroPresetId(presetId);
    const p = outroPresets.find((x) => x.id === presetId);
    if (p) {
      setCustomOutroPhrase(p.outroPhrase);
    }
  };

  const handleSaveCurrentOutroPreset = async () => {
    if (!customOutroPhrase.trim()) {
      alert('Informe a frase de encerramento.');
      return;
    }
    setIsSavingOutroPreset(true);
    try {
      const current = outroPresets.find((p) => p.id === selectedOutroPresetId);
      const res = await fetch('http://localhost:3001/api/settings/outro-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOutroPresetId,
          name: current?.name || 'Preset Personalizado',
          outroPhrase: customOutroPhrase.trim(),
          isDefault: true,
        }),
      });
      if (res.ok) {
        setOutroSavedFeedback(true);
        setTimeout(() => setOutroSavedFeedback(false), 2500);
        await loadOutroPresets();
      }
    } catch (err) {
      console.error('Erro ao salvar preset de encerramento:', err);
      alert('Erro ao salvar preset no banco.');
    } finally {
      setIsSavingOutroPreset(false);
    }
  };

  // Disparar o Humanizer para polir o texto recortado
  const handleHumanizeText = async () => {
    if (!editedFullText.trim()) {
      alert('Não há texto no editor para humanizar.');
      return;
    }
    setIsHumanizingText(true);
    setHumanizeFeedback(null);
    try {
      const res = await fetch('http://localhost:3001/api/text/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editedFullText,
          style: videoFormatType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.humanizedText) {
          setEditedFullText(data.humanizedText);
          setHasHumanized(true);
          setHumanizeFeedback('Texto humanizado com sucesso!');
          setTimeout(() => setHumanizeFeedback(null), 3000);
        }
      }
    } catch (err) {
      console.error('Erro ao humanizar texto:', err);
      alert('Erro de conexão com o serviço de humanização.');
    } finally {
      setIsHumanizingText(false);
    }
  };

  // Carregar catálogo real de vozes
  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const res = await fetch('http://localhost:3001/api/voices/catalog');
      if (res.ok) {
        const data = await res.json();
        setVoiceCatalog({
          voicestudio: data.voicestudio || [],
          elevenlabs: data.elevenlabs || [],
          elevenlabsStatus: data.elevenlabsStatus || 'ok',
          elevenlabsMessage: data.elevenlabsMessage,
        });

        // 1. Prioridade máxima: Voz clonada do Stanley no VoiceStudio
        const stanleyVoice = (data.voicestudio || []).find(
          (v: VoiceItem) => v.isCloned || v.id === 'voice_vs_1792608137918' || v.name.toLowerCase().includes('stanley')
        );

        if (stanleyVoice) {
          setVoiceEngine('voicestudio_local');
          setSelectedVoiceId(stanleyVoice.id);
        } else {
          // 2. Se não houver Stanley no VoiceStudio, busca voz clonada no ElevenLabs ou primeira disponível
          const pickDefaultVoice = (list: VoiceItem[]) => {
            if (!list || list.length === 0) return '';
            const cloned = list.find(
              (v) => v.isCloned || v.name.toLowerCase().includes('clonad') || v.name.toLowerCase().includes('stanley')
            );
            return cloned ? cloned.id : list[0].id;
          };

          if (voiceEngine === 'elevenlabs' && data.elevenlabs?.length > 0) {
            setSelectedVoiceId(pickDefaultVoice(data.elevenlabs));
          } else if (data.voicestudio?.length > 0) {
            setVoiceEngine('voicestudio_local');
            setSelectedVoiceId(pickDefaultVoice(data.voicestudio));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar catálogo de vozes:', err);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  useEffect(() => {
    loadVoices();
    loadIntroPresets();
    loadOutroPresets();
  }, []);

  // Quando troca o motor de voz (VoiceStudio vs ElevenLabs), seleciona prioritariamente a voz clonada
  useEffect(() => {
    const activeList = voiceEngine === 'voicestudio_local' ? voiceCatalog.voicestudio : voiceCatalog.elevenlabs;
    if (activeList.length > 0) {
      const cloned = activeList.find(
        (v) => v.isCloned || v.name.toLowerCase().includes('clonad') || v.name.toLowerCase().includes('stanley')
      );
      setSelectedVoiceId(cloned ? cloned.id : activeList[0].id);
    } else {
      setSelectedVoiceId('');
    }
    // Para áudio se estiver tocando
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  }, [voiceEngine, voiceCatalog]);

  // Tocar / Pausar Amostra da Voz Selecionada
  const handleTogglePlaySample = () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const activeList = voiceEngine === 'voicestudio_local' ? voiceCatalog.voicestudio : voiceCatalog.elevenlabs;
    const currentVoice = activeList.find((v) => v.id === selectedVoiceId);

    if (currentVoice?.sampleAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(currentVoice.sampleAudioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.warn('Erro ao tocar áudio:', e);
        setIsPlayingAudio(false);
      });
    } else {
      alert('Esta voz ainda não possui um áudio de amostra cadastrado.');
    }
  };

  // Iniciar Gravação pelo Microfone do Navegador
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        // Converter para Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudioBase64(reader.result as string);
        };

        // Desligar tracks do microfone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedAudioUrl(null);
      setCloneFeedback(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o seu microfone. Verifique as permissões do navegador.');
    }
  };

  // Parar Gravação
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Enviar Gravação para Clonar a Voz
  const handleSaveClonedVoice = async () => {
    if (!cloneVoiceName.trim() || !recordedAudioBase64) {
      alert('Grave ao menos um áudio e informe o nome da voz.');
      return;
    }
    if (cloneDestinations.length === 0) {
      alert('Selecione ao menos um destino para clonar (VoiceStudio ou ElevenLabs).');
      return;
    }

    setIsCloningVoice(true);
    setCloneFeedback(null);

    try {
      const res = await fetch('http://localhost:3001/api/voices/clone-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cloneVoiceName.trim(),
          audioBase64: recordedAudioBase64,
          destinations: cloneDestinations,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCloneFeedback('Voz clonada e cadastrada com sucesso!');
        await loadVoices();
        setTimeout(() => {
          setShowVoiceCloneModal(false);
          setCloneFeedback(null);
          setRecordedAudioUrl(null);
          setRecordedAudioBase64(null);
        }, 1500);
      } else {
        setCloneFeedback(data.error || 'Falha ao clonar voz.');
      }
    } catch (err: any) {
      console.error('Erro ao clonar voz:', err);
      setCloneFeedback('Erro de conexão ao enviar gravação.');
    } finally {
      setIsCloningVoice(false);
    }
  };

  // Buscar vídeos em Pexels / Pixabay
  const handleSearchStockVideos = async () => {
    if (!stockSearchQuery.trim()) return;
    setIsSearchingStock(true);
    try {
      const res = await fetch(`http://localhost:3001/api/stock-videos/search?q=${encodeURIComponent(stockSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setStockVideos(data.videos || []);
      }
    } catch (err) {
      console.error('Erro ao buscar vídeos:', err);
    } finally {
      setIsSearchingStock(false);
    }
  };

  // Ação de Cadastrar Novo Avatar
  const handleCreateAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvatarName.trim()) return;

    const newId = `avatar_${Date.now()}`;
    const newAvatar: AvatarOption = {
      id: newId,
      name: newAvatarName.trim(),
      description: 'Avatar cadastrado pelo usuário.',
      imageUrl: newAvatarUrl.trim() || 'http://localhost:3001/storage/avatars/avatar_stanley_webcam.jpg',
      type: 'custom',
    };

    setAvatarsList((prev) => [...prev, newAvatar]);
    setSelectedAvatarId(newId);
    setNewAvatarName('');
    setNewAvatarUrl('');
    setShowAvatarModal(false);
    setAvatarErrorAlert(false);
  };

  // Disparo da Raspagem da Notícia (Transição da Tela 1 para Tela 2)
  // Sanitizador de pontuação: garante espaçamento adequado após pontos, vírgulas e interrogações
  const cleanPunctuationSpaces = (text: string) => {
    if (!text) return '';
    return text
      .replace(/([.?!,;:])([A-Za-zÀ-ÖØ-öø-ÿ0-9])/g, '$1 $2')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleFixPunctuationSpaces = () => {
    if (!editedFullText) return;
    const cleaned = cleanPunctuationSpaces(editedFullText);
    setEditedFullText(cleaned);
  };

  const handleScrapeNews = async () => {
    if (!url.trim()) return;

    if (!selectedAvatarId || avatarsList.length === 0) {
      setAvatarErrorAlert(true);
      setShowAvatarModal(true);
      return;
    }

    setIsLoadingScrape(true);
    setAvatarErrorAlert(false);

    try {
      const activePreset = introPresets.find((p) => p.id === selectedPresetId);
      const res = await fetch('http://localhost:3001/api/news/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          styleMode: videoFormatType,
          targetDurationMinutes,
          brollChannel: brollVideoSource,
          themeFocus: 'all',
          lipSyncEngine,
          voiceEngine,
          selectedVoiceId,
          customHookHeading: activePreset?.name || 'BOMBA: NOTÍCIA OFICIAL',
          customHookNarration: customHookPhrase,
          customOutroNarration: customOutroPhrase,
          videoFormatType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.article) {
          setArticle(data.article);
          const sanitizedText = cleanPunctuationSpaces(data.article.fullText || '');
          setEditedFullText(sanitizedText);
          setSelectedImageIds(data.article.images.map((img: ScrapedImage) => img.id));
          setCurrentScreen(2);
        }
      } else {
        alert('Falha ao raspar a notícia. Verifique se a URL é válida e acessível.');
      }
    } catch (err) {
      console.error('[NewsToVideo] Erro ao raspar matéria:', err);
      alert('Erro de conexão ao raspar matéria.');
    } finally {
      setIsLoadingScrape(false);
    }
  };

  // Alternar seleção de imagem
  const toggleImageSelection = (imgId: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]
    );
  };

  // Selecionar ou desmarcar todas as imagens
  const handleSelectAllImages = (select: boolean) => {
    if (!article) return;
    if (select) {
      setSelectedImageIds(article.images.map((img) => img.id));
    } else {
      setSelectedImageIds([]);
    }
  };

  // Copiar texto da matéria (copia o texto atualmente editado)
  const handleCopyRawText = () => {
    const textToCopy = editedFullText || article?.fullText || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2000);
  };

  // Restaurar Texto Original Completo com pontuação limpa
  const handleRestoreOriginalText = () => {
    if (article?.fullText) {
      setEditedFullText(cleanPunctuationSpaces(article.fullText));
      setRawTextSearch('');
    }
  };

  // Filtrar apenas parágrafos do texto original que contêm o termo pesquisado
  const handleFilterParagraphsBySearch = () => {
    if (!rawTextSearch.trim() || !article?.fullText) return;
    const term = rawTextSearch.toLowerCase().trim();
    const allParagraphs = article.fullText.split(/\n\s*\n|\n/);
    const matched = allParagraphs
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p.toLowerCase().includes(term));

    if (matched.length > 0) {
      setEditedFullText(cleanPunctuationSpaces(matched.join('\n\n')));
    } else {
      alert(`Nenhum parágrafo encontrado contendo "${rawTextSearch}".`);
    }
  };

  // Contagem de ocorrências do termo de busca no texto editado
  const matchCount = useMemo(() => {
    if (!rawTextSearch.trim()) return 0;
    const text = editedFullText || article?.fullText || '';
    if (!text) return 0;
    try {
      const escaped = rawTextSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const matches = text.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [rawTextSearch, editedFullText, article]);

  // Se o usuário já tiver raspado a matéria e editedFullText estiver vazio, inicializa
  useEffect(() => {
    if (article?.fullText && !editedFullText) {
      setEditedFullText(cleanPunctuationSpaces(article.fullText));
    }
  }, [article]);

  // Lista de vozes ativas do motor selecionado
  const currentVoiceList = voiceEngine === 'voicestudio_local' 
    ? voiceCatalog.voicestudio 
    : voiceCatalog.elevenlabs;

  const currentSelectedVoiceObj = currentVoiceList.find((v) => v.id === selectedVoiceId);

  // Contagem de palavras e estimativa de minutos de vídeo (~140 palavras/min em português)
  const editedWordCount = useMemo(() => {
    return (editedFullText || '').trim().split(/\s+/).filter(Boolean).length;
  }, [editedFullText]);

  const estimatedReadingMinutes = useMemo(() => {
    if (editedWordCount === 0) return 0;
    return Math.round((editedWordCount / 140) * 10) / 10;
  }, [editedWordCount]);

  // === AÇÕES DA TELA 3 (DIREÇÃO, CENAS & LIP-SYNC) ===

  // 1. Disparo da Geração de Roteiro e Decupagem em Cenas (Transição da Tela 2 para Tela 3)
  const handleGenerateVideoPlan = async () => {
    if (!article) return;
    setIsGeneratingPlan(true);

    try {
      let textToUse = editedFullText;

      // Se o usuário ainda não clicou em humanizar manualmente, executa automaticamente agora
      if (!hasHumanized && editedFullText.trim()) {
        try {
          const hRes = await fetch('http://localhost:3001/api/text/humanize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: editedFullText,
              style: videoFormatType,
            }),
          });
          if (hRes.ok) {
            const hData = await hRes.json();
            if (hData.humanizedText) {
              textToUse = hData.humanizedText;
              setEditedFullText(hData.humanizedText);
              setHasHumanized(true);
            }
          }
        } catch (hErr) {
          console.warn('[NewsToVideo] Humanização automática em segundo plano:', hErr);
        }
      }

      const activePreset = introPresets.find((p) => p.id === selectedPresetId);
      const res = await fetch('http://localhost:3001/api/news/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article,
          themeFocus: 'all',
          styleMode: videoFormatType,
          selectedImageIds,
          targetDurationMinutes,
          brollChannel: brollVideoSource,
          customHookHeading: activePreset?.name || 'BOMBA: NOTÍCIA OFICIAL',
          customHookNarration: customHookPhrase,
          customOutroNarration: customOutroPhrase,
          videoFormatType,
          editedFullText: textToUse,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plan) {
          setVideoPlan(data.plan);
          setScenes(data.plan.scenes);
          setCurrentScreen(3);
        }
      } else {
        alert('Falha ao decupar as cenas. Verifique se o backend está ativo.');
      }
    } catch (err) {
      console.error('Erro ao gerar plano de vídeo:', err);
      alert('Erro de conexão ao gerar o plano de cenas.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // 2. Reordenar Cenas (Subir ou Descer)
  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === scenes.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });
  };

  // 2.1 Reordenar EXCLUSIVAMENTE a Imagem (Mover apenas a foto para a cena de cima ou de baixo, mantendo o texto da história no lugar)
  const handleMoveSceneImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === scenes.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...scenes];
    
    // Troca apenas as imagens entre as duas cenas
    const tempUrl = updated[index].associatedImageUrl;
    const tempId = updated[index].associatedImageId;

    updated[index].associatedImageUrl = updated[targetIndex].associatedImageUrl;
    updated[index].associatedImageId = updated[targetIndex].associatedImageId;

    updated[targetIndex].associatedImageUrl = tempUrl;
    updated[targetIndex].associatedImageId = tempId;

    setScenes(updated);
  };

  // 2.2 Upload de Imagem do Computador para a Cena
  const handleUploadImageForScene = (sceneId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultBase64 = reader.result as string;
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? { ...s, associatedImageUrl: resultBase64, associatedImageId: `custom_upload_${Date.now()}` }
            : s
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // 3. Atualizar Fala da Cena e Recalcular Duração
  const handleUpdateSceneNarration = (sceneId: string, narration: string) => {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id === sceneId) {
          const words = narration.trim().split(/\s+/).filter(Boolean).length;
          const durationInSeconds = Math.max(3, Math.round((words / 140) * 60));
          return { ...s, narration, durationInSeconds };
        }
        return s;
      })
    );
  };

  // 4. Trocar Imagem Associada à Cena
  const handleSelectImageForScene = (imageUrl: string, imageId: string) => {
    if (!targetSceneIdForImagePicker) return;
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id === targetSceneIdForImagePicker) {
          return { ...s, associatedImageUrl: imageUrl, associatedImageId: imageId };
        }
        return s;
      })
    );
    setShowImagePickerModal(false);
    setTargetSceneIdForImagePicker(null);
  };

  // 5. Ouvir Prévia do Áudio da Cena (Voz Real Clonada do Stanley ou Síntese)
  const handlePreviewSceneSpeech = async (scene: NewsSceneDraft) => {
    if (activePreviewSceneAudioId === scene.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActivePreviewSceneAudioId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setActivePreviewSceneAudioId(scene.id);

    try {
      // 1. Tenta buscar áudio sintetizado ou áudio oficial da voz clonada do Stanley
      const res = await fetch('http://localhost:3001/api/voices/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.narration,
          voiceId: selectedVoiceId,
          voiceEngine,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audioUrl) {
          const fullAudioUrl = data.audioUrl.startsWith('http')
            ? data.audioUrl
            : `http://localhost:3001${data.audioUrl}`;
          const audio = new Audio(fullAudioUrl);
          audioRef.current = audio;
          audio.onended = () => setActivePreviewSceneAudioId(null);
          audio.onerror = () => setActivePreviewSceneAudioId(null);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('[NewsToVideo] Falha ao tocar áudio real, fallback para voz do sistema:', e);
    }

    // 2. Fallback de síntese caso a API não responda
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(scene.narration);
      utterance.lang = language || 'pt-BR';
      utterance.rate = 1.05;
      utterance.onend = () => setActivePreviewSceneAudioId(null);
      utterance.onerror = () => setActivePreviewSceneAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setActivePreviewSceneAudioId(null);
      alert('Não foi possível reproduzir a prévia de áudio.');
    }
  };

  // 6. Gerar e Pré-visualizar Lip-Sync Desta Cena
  const handleGenerateSceneLipSync = async (scene: NewsSceneDraft) => {
    const avatarObj = avatarsList.find((a) => a.id === selectedAvatarId);
    const avatarImg = avatarObj?.imageUrl || 'http://localhost:3001/storage/avatars/avatar_stanley_webcam.jpg';

    setSceneLipSyncStatus((prev) => ({
      ...prev,
      [scene.id]: { loading: true },
    }));

    try {
      const res = await fetch('http://localhost:3001/api/lipsync/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          avatarImageUrl: avatarImg,
          narrationText: scene.narration,
          engine: lipSyncEngine,
          layoutMode: scene.layoutMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.videoUrl) {
          const fullVideoUrl = data.videoUrl.startsWith('http')
            ? data.videoUrl
            : `http://localhost:3001${data.videoUrl}`;

          setSceneLipSyncStatus((prev) => ({
            ...prev,
            [scene.id]: { loading: false, videoUrl: fullVideoUrl },
          }));
          setScenes((prev) =>
            prev.map((s) => (s.id === scene.id ? { ...s, lipSyncVideoUrl: fullVideoUrl } : s))
          );
        }
      } else {
        alert('Falha ao gerar lip-sync da cena.');
        setSceneLipSyncStatus((prev) => ({
          ...prev,
          [scene.id]: { loading: false },
        }));
      }
    } catch (err) {
      console.error('Erro ao gerar lip-sync:', err);
      setSceneLipSyncStatus((prev) => ({
        ...prev,
        [scene.id]: { loading: false },
      }));
    }
  };

  // 7. Renderização Completa do Vídeo no Remotion
  const handleRenderFinalVideo = async () => {
    if (!videoPlan || scenes.length === 0) return;
    setIsRenderingFinalVideo(true);
    setRenderedVideoResult(null);
    try {
      const avatarObj = avatarsList.find((a) => a.id === selectedAvatarId);
      const res = await fetch('http://localhost:3001/api/video/render-news-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: { ...videoPlan, scenes },
          brollVideoSource,
          avatarImageUrl: avatarObj?.imageUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.renderResult) {
          setRenderedVideoResult(data.renderResult);
        }
      } else {
        alert('Falha ao renderizar o vídeo no backend.');
      }
    } catch (err) {
      console.error('Erro ao renderizar vídeo:', err);
      alert('Erro de conexão com o renderizador.');
    } finally {
      setIsRenderingFinalVideo(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* CABEÇALHO DO FLUXO COM INDICADOR DE ETAPAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">
              Notícia para Vídeo (Fluxo em 3 Telas)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {currentScreen === 1 
              ? 'Tela 1: Configuração da Notícia, Formato, Duração, Avatar, Voz e Lip-Sync' 
              : currentScreen === 2
              ? 'Tela 2: Texto Capturado, Mídias da Notícia e Seleção de Vídeo de Fundo'
              : 'Tela 3: Direção de Cenas, Reordenação, Pré-visualização de Lip-Sync e Renderização Final'}
          </p>
        </div>

        {/* PRESET ATIVO NO CABEÇALHO */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-bold flex items-center gap-2 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Preset:</span>
            <span className="text-white font-mono font-bold">
              {introPresets.find((p) => p.id === selectedPresetId)?.name || 'Gamer / Streamer'}
            </span>
          </div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO ENTRE AS 3 TELAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tela 1 */}
        <button
          type="button"
          onClick={() => setCurrentScreen(1)}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
            currentScreen === 1
              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
            currentScreen === 1 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            1
          </div>
          <div>
            <div className="text-xs font-extrabold text-white">Tela 1: Configuração Prévia</div>
            <div className="text-[11px] text-slate-400">Site, Formato, Tempo, Avatar, Voz e Lip-Sync</div>
          </div>
        </button>

        {/* Tela 2 */}
        <button
          type="button"
          onClick={() => {
            if (article) setCurrentScreen(2);
            else alert('Você precisa raspar a notícia na Tela 1 primeiro.');
          }}
          disabled={!article}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
            currentScreen === 2
              ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30 cursor-pointer'
              : !article
              ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
            currentScreen === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            2
          </div>
          <div>
            <div className="text-xs font-extrabold text-white">Tela 2: Notícia & Mídias</div>
            <div className="text-[11px] text-slate-400">Texto bruto, fotos do site e vídeo de fundo</div>
          </div>
        </button>

        {/* Tela 3 */}
        <button
          type="button"
          onClick={() => {
            if (scenes.length > 0) setCurrentScreen(3);
            else alert('Gere o plano de cenas na Tela 2 primeiro.');
          }}
          disabled={scenes.length === 0}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
            currentScreen === 3
              ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30 cursor-pointer'
              : scenes.length === 0
              ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
            currentScreen === 3 ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            3
          </div>
          <div>
            <div className="text-xs font-extrabold text-white">Tela 3: Decupagem & Cenas</div>
            <div className="text-[11px] text-slate-400">Roteiro, Lip-Sync e Renderização Remotion</div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ==================== TELA 1: CONFIGURAÇÃO PRÉVIA ======================== */}
      {/* ========================================================================= */}
      {currentScreen === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            
            {/* 0. ESTILO DO CANAL & BORDÃO DE ABERTURA (SALVO NO BANCO SQLITE) */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Estilo do Canal & Frase de Abertura (0 a 8s):
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                    SQLite Persistido
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Combo de Presets com Alto Contraste */}
                  <div className="relative">
                    <select
                      value={selectedPresetId}
                      onChange={(e) => handleSelectPreset(e.target.value)}
                      className="bg-slate-900 border-2 border-indigo-500/70 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-bold cursor-pointer shadow-md pr-8"
                    >
                      {introPresets.map((pr) => (
                        <option key={pr.id} value={pr.id} className="bg-slate-900 text-white font-medium py-1.5">
                          {pr.name} {pr.isDefault ? '⭐ [Padrão]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão Salvar no Banco */}
                  <button
                    type="button"
                    onClick={handleSaveCurrentPreset}
                    disabled={isSavingPreset}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPreset ? 'Salvando...' : presetSavedFeedback ? '✓ Salvo!' : 'Salvar no Banco'}</span>
                  </button>
                </div>
              </div>

              {/* Input da Frase de Gancho / Abertura */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-medium">
                  Frase de Abertura / Gancho (Edite livremente para falar diferente em vídeos de política, notícia ou games):
                </label>
                <input
                  type="text"
                  value={customHookPhrase}
                  onChange={(e) => setCustomHookPhrase(e.target.value)}
                  placeholder="Ex: Fala moçada! Segura firme esse controle... ou Atenção para as notícias de hoje..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>
            </div>
            
            {/* 1. ESCOLHER O SITE / URL DA NOTÍCIA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Link className="w-4 h-4 text-indigo-400" />
                  1. Escolher Site da Notícia (Cole a URL do Blog, Portal ou Notícia):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUrl('https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                  >
                    Exemplo COD MW4
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setUrl('https://g1.globo.com/tecnologia/')}
                    className="text-[11px] text-slate-400 hover:text-slate-300 font-semibold underline cursor-pointer"
                  >
                    Exemplo Notícia Tech
                  </button>
                </div>
              </div>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com/noticia-completa..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* 2. FORMATO DO VÍDEO (HORIZONTAL OU VERTICAL) & 3. TEMPO DO VÍDEO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              {/* Formato / Orientação */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Tv className="w-4 h-4 text-sky-400" />
                  2. Formato do Vídeo:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoFormat('horizontal')}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      videoFormat === 'horizontal'
                        ? 'bg-sky-600/20 border-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tv className={`w-6 h-6 ${videoFormat === 'horizontal' ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-extrabold">Horizontal (16:9)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">YouTube padrão, monitores e TV</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoFormat('vertical')}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      videoFormat === 'vertical'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 ${videoFormat === 'vertical' ? 'text-purple-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-extrabold">Vertical (9:16)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Shorts, TikTok e Reels</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tempo do Vídeo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    3. Tempo do Vídeo:
                  </label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {targetDurationMinutes} {targetDurationMinutes === 1 ? 'Minuto' : 'Minutos'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[1, 3, 5, 10, 15].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setTargetDurationMinutes(min)}
                      className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        targetDurationMinutes === min
                          ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{min}m</div>
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={targetDurationMinutes}
                  onChange={(e) => setTargetDurationMinutes(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg mt-2"
                />
              </div>
            </div>

            {/* 4. ESCOLHER AVATAR DO APRESENTADOR */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  4. Avatar do Apresentador:
                </label>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Cadastrar Novo Avatar</span>
                </button>
              </div>

              {/* CARD DE INFORMAÇÃO DA REGRA DE CÂMERA DO STANLEY */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-xs">
                <Camera className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <span className="font-bold text-amber-300">Direção de Câmera Oficial:</span> Abertura em <strong>Tela Cheia no Estúdio Gamer</strong> (0 a 8s com o bordão) ➔ A partir da 2ª cena, o avatar reduz automaticamente para o <strong>quadro de webcam gamer no canto da tela</strong> com moldura e ondas sonoras, sem cobrir o vídeo de fundo nem as fotos da notícia.
                </div>
              </div>

              {/* Grid de Avatares Cadastrados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {avatarsList.map((av) => {
                  const isSelected = selectedAvatarId === av.id;
                  return (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatarId(av.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/15'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={av.imageUrl}
                        alt={av.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-white truncate">{av.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{av.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. VOZ QUE SERÁ USADA (COMBO COMPACTO DE 1 LINHA + PLAYER + BOTÃO DE GRAVAR MICROFONE) */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  5. Voz que Será Usada:
                </label>

                {/* Alternância Rápida de Motor */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceEngine('elevenlabs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      voiceEngine === 'elevenlabs'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>☁️ ElevenLabs (Conta Real)</span>
                    <span className="text-[10px] bg-purple-950/60 px-1.5 py-0.2 rounded font-mono">
                      {voiceCatalog.elevenlabs.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoiceEngine('voicestudio_local')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      voiceEngine === 'voicestudio_local'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🎙️ VoiceStudio (Local)</span>
                    <span className="text-[10px] bg-rose-950/60 px-1.5 py-0.2 rounded font-mono">
                      {voiceCatalog.voicestudio.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* LINHA COMPACTA: COMBO DE VOZES + BOTÃO PLAY + BOTÃO GRAVAR MICROFONE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Combo (Select) de Vozes */}
                <div className="md:col-span-7">
                  <select
                    value={selectedVoiceId}
                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                    disabled={currentVoiceList.length === 0}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {currentVoiceList.length === 0 ? (
                      <option value="">
                        {voiceEngine === 'voicestudio_local'
                          ? 'Nenhuma voz clonada cadastrada ainda (Grave sua voz ao lado)'
                          : 'Carregando vozes do ElevenLabs...'}
                      </option>
                    ) : (
                      currentVoiceList.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.isCloned ? '⭐ [Clonada]' : ''} - {v.group}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Botão Play / Ouvir Amostra */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleTogglePlaySample}
                    disabled={!currentSelectedVoiceObj?.sampleAudioUrl}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isPlayingAudio
                        ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                        : 'bg-slate-950 border-slate-700 hover:border-rose-500 text-slate-200 hover:text-white'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Ouvir</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Botão para Gravar pelo Microfone */}
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={() => setShowVoiceCloneModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>+ Gravar Minha Voz</span>
                  </button>
                </div>

              </div>

              {/* Detalhes da Voz Selecionada */}
              {currentSelectedVoiceObj && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span><strong>Descrição:</strong> {currentSelectedVoiceObj.description || 'Voz pronta para narração.'}</span>
                  <span className="text-[10px] text-purple-400 uppercase font-mono">{currentSelectedVoiceObj.group}</span>
                </div>
              )}
            </div>

            {/* 6. IDIOMA DO VÍDEO & 7. MOTOR DE LIP-SYNC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              
              {/* Idioma do Vídeo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-emerald-400" />
                  6. Idioma do Vídeo (para Síntese de Áudio):
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
                    { code: 'en-US', label: 'Inglês', flag: '🇺🇸' },
                    { code: 'es-ES', label: 'Espanhol', flag: '🇪🇸' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        language === lang.code
                          ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Motor de Lip-Sync */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-400" />
                  7. Motor de Lip-Sync (Sincronia Labial):
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLipSyncEngine('heygen')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      lipSyncEngine === 'heygen'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">HeyGen API</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                        Recomendado
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                      Talking Photo de estúdio com acabamento profissional.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLipSyncEngine('latentsync')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      lipSyncEngine === 'latentsync'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">LatentSync</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                        ByteDance
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                      Difusão latente U-Net 512x512 via Replicate A100.
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* 8. TIPO DE FORMATO DO VÍDEO (LIVE STREAMER, VOX MINI-DOC, NOTÍCIA ÁGIL TECH) */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-cyan-400" />
                8. Tipo de Formato do Vídeo:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Live Streamer Gamer */}
                <button
                  type="button"
                  onClick={() => setVideoFormatType('live_streamer')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    videoFormatType === 'live_streamer'
                      ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      🎮 Live Streamer Gamer
                    </span>
                    {videoFormatType === 'live_streamer' && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Linguagem em 1ª pessoa, tom empolgado e espontâneo com gameplay no fundo e avatar em webcam gamer.
                  </p>
                  <span className="text-[10px] text-cyan-400 font-mono">Ideal para games, CoD, lançamentos</span>
                </button>

                {/* 2. Estilo VOX / Mini-Doc */}
                <button
                  type="button"
                  onClick={() => setVideoFormatType('vox_documentary')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    videoFormatType === 'vox_documentary'
                      ? 'bg-amber-950/30 border-amber-500 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      🎬 Estilo VOX / Mini-Doc
                    </span>
                    {videoFormatType === 'vox_documentary' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Cadência explicativa, transições analíticas investigativas com foco em detalhes e imagens oficiais.
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono">Ideal para curiosidades e análises profundas</span>
                </button>

                {/* 3. Noticiário Ágil Tech */}
                <button
                  type="button"
                  onClick={() => setVideoFormatType('tech_capsule')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    videoFormatType === 'tech_capsule'
                      ? 'bg-indigo-950/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      ⚡ Noticiário Ágil Tech
                    </span>
                    {videoFormatType === 'tech_capsule' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Direto ao ponto, ritmo acelerado, síntese dos pontos-chave com tópicos e números relevantes.
                  </p>
                  <span className="text-[10px] text-indigo-400 font-mono">Ideal para notícias rápidas e resumos diários</span>
                </button>
              </div>
            </div>

            {/* 9. ENCERRAMENTO & CHAMADA PARA AÇÃO (CTA FINAL / LIKE / SEGUIR - PERSISTIDO NO SQLITE) */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  9. Encerramento & Chamada para Ação (CTA Final):
                </label>

                {/* Controles do Preset de Encerramento com Alto Contraste */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">Preset Salvo:</span>
                  <div className="relative">
                    <select
                      value={selectedOutroPresetId}
                      onChange={(e) => handleSelectOutroPreset(e.target.value)}
                      className="bg-slate-900 border-2 border-emerald-500/80 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-lg pr-8"
                    >
                      {outroPresets.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white font-medium py-1.5">
                          {p.name} {p.isDefault ? '⭐ [Padrão]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCurrentOutroPreset}
                    disabled={isSavingOutroPreset}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isSavingOutroPreset ? 'Salvando...' : 'Salvar no Banco'}</span>
                  </button>
                </div>
              </div>

              {outroSavedFeedback && (
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Preset de encerramento atualizado e salvo no SQLite com sucesso!</span>
                </div>
              )}

              {/* Textarea editável para o texto do encerramento */}
              <div className="space-y-1">
                <textarea
                  value={customOutroPhrase}
                  onChange={(e) => setCustomOutroPhrase(e.target.value)}
                  rows={2}
                  placeholder="Texto falado no encerramento para pedir like, comentário e inscrição..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                />
                <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                  <span>Este texto será narrado na cena final do vídeo antes do encerramento.</span>
                  <span className="font-mono text-emerald-400/80">{customOutroPhrase.length} caracteres</span>
                </div>
              </div>
            </div>

            {/* BOTÃO PRINCIPAL: RASPAR A NOTÍCIA */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleScrapeNews}
                disabled={isLoadingScrape || !url.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isLoadingScrape ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Raspando Notícia e Mídias Reais da Página...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Raspar Notícia e Prosseguir para a Tela 2</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================== TELA 2: TEXTO CAPTURADO & MÍDIAS ===================== */}
      {/* ========================================================================= */}
      {currentScreen === 2 && article && (
        <div className="space-y-6 animate-fadeIn">
          {/* BARRA SUPERIOR COM BOTÃO DE VOLTAR */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentScreen(1)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Voltar para Configurações (Tela 1)</span>
            </button>

            <div className="text-xs text-slate-400">
              Notícia: <span className="text-white font-bold">{article.siteName}</span> • {article.images.length} fotos reais encontradas
            </div>
          </div>

          {/* 1. TEXTO QUE FOI CAPTURADO DA NOTÍCIA (EDITÁVEL LIVREMENTE) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  1. Texto da Notícia (Editor Livre para o Vídeo)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Apague ou edite livremente para deixar apenas os assuntos que deseja no vídeo. Use o botão ao lado para voltar ao original se quiser falar de outro tema.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                  {editedWordCount} palavras
                </span>
                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                  {(editedFullText || '').length} caracteres
                </span>

                {/* Estimativa de Tempo de Vídeo em Minutos */}
                <span 
                  title="Estimativa calculada com base no ritmo médio de locução humana (~140 palavras por minuto)"
                  className="text-xs bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>~{estimatedReadingMinutes} min de vídeo</span>
                </span>

                {/* Botão Humanizar com IA */}
                <button
                  type="button"
                  onClick={handleHumanizeText}
                  disabled={isHumanizingText || !editedFullText.trim()}
                  title="Reescreve o texto com linguagem humana natural em 1ª pessoa no estilo selecionado, removendo tom de robô"
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isHumanizingText ? 'animate-spin' : ''}`} />
                  <span>{isHumanizingText ? 'Humanizando com IA...' : '✨ Humanizar Texto com IA'}</span>
                </button>

                {humanizeFeedback && (
                  <span className="text-xs text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{humanizeFeedback}</span>
                  </span>
                )}

                {/* Botão para Corrigir Espaços e Pontuação */}
                <button
                  type="button"
                  onClick={handleFixPunctuationSpaces}
                  title="Garante que todo ponto, vírgula ou interrogação tenha espaço antes da próxima palavra"
                  className="px-3 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>🧹 Inserir Espaços após Pontos</span>
                </button>

                {/* Botão para Restaurar Texto Completo Original */}
                <button
                  type="button"
                  onClick={handleRestoreOriginalText}
                  title="Volta o texto para a versão bruta original da matéria"
                  className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Restaurar Original</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyRawText}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{copiedRawText ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>

            {/* Barra de Busca e Filtro de Parágrafos */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={rawTextSearch}
                  onChange={(e) => setRawTextSearch(e.target.value)}
                  placeholder="Pesquisar palavra no texto (ex: arma, operador, fuzil, lancamento)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {rawTextSearch.trim() && (
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <span className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-mono">
                    {matchCount} {matchCount === 1 ? 'ocorrência' : 'ocorrências'}
                  </span>

                  <button
                    type="button"
                    onClick={handleFilterParagraphsBySearch}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar Parágrafos com "{rawTextSearch}"</span>
                  </button>
                </div>
              )}
            </div>

            {/* Editor de Texto Livre com Corretor Ortográfico ATIVADO */}
            <div className="space-y-1.5">
              <textarea
                value={editedFullText}
                onChange={(e) => setEditedFullText(e.target.value)}
                rows={13}
                spellCheck={true}
                lang="pt-BR"
                autoCorrect="on"
                autoCapitalize="sentences"
                placeholder="Texto da matéria capturada... Edite, apague partes ou adicione observações livremente!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-sans text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y shadow-inner selection:bg-indigo-600 selection:text-white"
              />
              <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Corretor ortográfico do navegador ATIVO (Dicionário pt-BR com sublinhados gramaticais)</span>
                </span>
                <span>O roteiro do vídeo usará o conteúdo editado exatamente como estiver nesta caixa.</span>
              </div>
            </div>
          </div>

          {/* 2. AS IMAGENS / VÍDEOS QUE TEM NA NOTÍCIA */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  2. Imagens e Vídeos Extraídos da Página ({article.images.length} encontradas)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fotos reais baixadas diretamente do site oficial. Marque quais deseja manter ativas:
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllImages(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                >
                  Selecionar Todas
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllImages(false)}
                  className="text-xs text-slate-400 hover:text-slate-300 font-bold cursor-pointer"
                >
                  Desmarcar Todas
                </button>
              </div>
            </div>

            {article.images.length === 0 ? (
              <div className="p-6 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-amber-200">Nenhuma imagem encontrada no corpo da página</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Como não há fotos na notícia, o vídeo de fundo contínuo abaixo será usado para preencher a tela.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
                {article.images.map((img) => {
                  const isChecked = selectedImageIds.includes(img.id);
                  return (
                    <div
                      key={img.id}
                      onClick={() => toggleImageSelection(img.id)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-500 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                          : 'border-slate-800 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt || 'Foto da notícia'}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700 flex items-center justify-center">
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. ESCOLHA DO VÍDEO DE FUNDO */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-purple-400" />
                  3. Vídeo de Fundo Contínuo (B-Roll Gamer / Live do Canal / Bancos Free)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Como a notícia possui fotos estáticas, um vídeo contínuo passará no fundo enquanto as fotos e o avatar surgem na tela.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowStockModal(true);
                  handleSearchStockVideos();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 shrink-0 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Buscar Vídeo Grátis (Pexels / Pixabay)</span>
              </button>
            </div>

            {/* Input para Colocar Link de Vídeo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Colar Link de Vídeo Próprio (YouTube / MP4 / Canal):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={brollVideoSource}
                  onChange={(e) => setBrollVideoSource(e.target.value)}
                  placeholder="Ex: @stanleyalvesbr ou https://youtube.com/live/... ou link direto de vídeo"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setBrollVideoSource('@stanleyalvesbr')}
                  className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  Usar Meu Canal (@stanleyalvesbr)
                </button>
              </div>

              {selectedStockVideo && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStockVideo.previewUrl}
                      alt={selectedStockVideo.title}
                      className="w-16 h-10 rounded-lg object-cover border border-purple-500/40"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{selectedStockVideo.title}</span>
                      <span className="text-[10px] text-purple-300">Fonte: {selectedStockVideo.source.toUpperCase()} ({selectedStockVideo.duration}s)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStockVideo(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO PRINCIPAL: GERAR ROTEIRO & DECUPAR CENAS (AVANÇAR PARA TELA 3) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Pronto para Direção e Decupagem em Cenas!</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                O texto editado e as fotos selecionadas serão divididos em cenas sequenciais com a regra oficial de câmera (Abertura em tela cheia ➔ cenas seguintes na webcam gamer com gameplay e fotos oficiais).
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateVideoPlan}
              disabled={isGeneratingPlan || !article}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isGeneratingPlan ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Decupando Roteiro e Cenas...</span>
                </>
              ) : (
                <>
                  <Clapperboard className="w-5 h-5" />
                  <span>Gerar Cenas & Prosseguir para Tela 3</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ============ TELA 3: DIREÇÃO, DECUPAGEM DE CENAS & LIP-SYNC ============= */}
      {/* ========================================================================= */}
      {currentScreen === 3 && (
        <div className="space-y-6 animate-fadeIn">
          {/* BARRA SUPERIOR DE CONTROLE DA TELA 3 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentScreen(2)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Voltar para Texto & Mídias (Tela 2)</span>
              </button>

              <div className="h-6 w-px bg-slate-800 hidden sm:block" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-purple-950/40 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>{scenes.length} Cenas Decupadas</span>
                </span>
                <span className="text-xs bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    ~{Math.round(scenes.reduce((acc, s) => acc + s.durationInSeconds, 0))}s de Vídeo (
                    {(scenes.reduce((acc, s) => acc + s.durationInSeconds, 0) / 60).toFixed(1)} min)
                  </span>
                </span>
                <span className="text-xs bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5">
                  <Clapperboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {videoFormatType === 'live_streamer'
                      ? '🎮 Live Streamer Gamer'
                      : videoFormatType === 'vox_documentary'
                      ? '🎬 Estilo VOX'
                      : '⚡ Notícia Ágil'}
                  </span>
                </span>
              </div>
            </div>

            {/* BOTÃO MASTER: RENDERIZAR VÍDEO COMPLETO NO REMOTION */}
            <button
              type="button"
              onClick={handleRenderFinalVideo}
              disabled={isRenderingFinalVideo || scenes.length === 0}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isRenderingFinalVideo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Renderizando Vídeo Completo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Renderizar Vídeo Completo (Remotion)</span>
                </>
              )}
            </button>
          </div>

          {/* CARD DE VÍDEO COMPLETO RENDERIZADO COM SUCESSO (SE HOUVER) */}
          {renderedVideoResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500 shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Vídeo Completo Renderizado com Sucesso!</h3>
                    <p className="text-xs text-slate-300">
                      Duração Total: {renderedVideoResult.durationSeconds}s • Resolução: 1080p Full HD • Áudio Normalizado
                    </p>
                  </div>
                </div>

                <a
                  href={renderedVideoResult.downloadUrl}
                  download="noticia_video_final.mp4"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Vídeo MP4</span>
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-2">Pré-visualização do Arquivo Renderizado:</div>
                <video
                  controls
                  src={renderedVideoResult.downloadUrl}
                  className="w-full max-h-80 mx-auto rounded-xl border border-slate-800 bg-black"
                />
              </div>
            </div>
          )}

          {/* LISTA DE CARDS DE CENAS DECUPADAS */}
          <div className="space-y-4">
            {scenes.map((scene, index) => {
              const isIntro = scene.type === 'avatar_intro';
              const isOutro = scene.type === 'avatar_outro';
              const lipSyncData = sceneLipSyncStatus[scene.id];
              const isLipSyncLoading = lipSyncData?.loading;
              const hasLipSyncVideo = scene.lipSyncVideoUrl || lipSyncData?.videoUrl;

              return (
                <div
                  key={scene.id}
                  className={`p-5 rounded-2xl border transition-all shadow-xl space-y-4 ${
                    isIntro
                      ? 'bg-slate-900/90 border-amber-500/40 ring-1 ring-amber-500/20'
                      : isOutro
                      ? 'bg-slate-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {/* CABEÇALHO DO CARD DA CENA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 font-mono font-bold text-xs flex items-center justify-center">
                        #{scene.order}
                      </span>

                      {/* Tag do Tipo de Cena */}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                          isIntro
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isOutro
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : scene.type === 'gameplay_broll'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {isIntro && <span>🌟 Cena 1: Abertura (Tela Cheia no Estúdio Gamer)</span>}
                        {isOutro && <span>📢 Cena Final: Encerramento & Chamada para Ação (CTA)</span>}
                        {scene.type === 'gameplay_broll' && (
                          <span>🎮 Cena {scene.order}: Gameplay ao Vivo @stanleyalvesbr</span>
                        )}
                        {scene.type === 'ken_burns_news' && (
                          <span>📰 Cena {scene.order}: Matéria Oficial & Foto da Arma/Conteúdo</span>
                        )}
                      </span>

                      <span className="text-xs text-slate-400 font-mono">
                        ⏱️ ~{scene.durationInSeconds}s ({scene.narration.trim().split(/\s+/).filter(Boolean).length} palavras)
                      </span>
                    </div>
                  </div>

                  {/* CORPO PRINCIPAL DA CENA (2 COLUNAS: MÍDIA VISUAL + NARRAÇÃO EDITÁVEL) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    
                    {/* COLUNA 1: MÍDIA VISUAL / AVATAR / LIP-SYNC (md:col-span-4) */}
                    <div className="md:col-span-4 space-y-2.5">
                      <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-slate-950 flex items-center justify-center group shadow-inner">
                        {hasLipSyncVideo ? (
                          <div
                            onClick={() => setExpandedLipSyncVideo({
                              url: scene.lipSyncVideoUrl || lipSyncData?.videoUrl || '',
                              heading: `Cena ${scene.order}: ${scene.heading}`
                            })}
                            className="w-full h-full relative bg-black cursor-pointer group/vid"
                          >
                            <video
                              controls
                              autoPlay
                              loop
                              muted
                              playsInline
                              src={scene.lipSyncVideoUrl || lipSyncData?.videoUrl}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10 pointer-events-none">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Lip-Sync Ativo</span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/vid:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <div className="p-3 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center">
                                <Play className="w-6 h-6 fill-current" />
                              </div>
                            </div>
                          </div>
                        ) : scene.associatedImageUrl ? (
                          <img
                            src={scene.associatedImageUrl}
                            alt={scene.heading}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center p-3 text-slate-500 text-xs">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                            <span>Sem imagem associada</span>
                          </div>
                        )}

                        {/* Tag de Layout de Câmera */}
                        {!hasLipSyncVideo && (
                          <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-slate-200 border border-slate-700/80 flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              <Camera className="w-3 h-3 text-amber-400" />
                              {isIntro || isOutro ? 'Tela Cheia (Estúdio)' : 'Webcam Gamer no Canto'}
                            </span>
                            <span className="text-slate-400">{scene.kenBurnsEffect.replace('_', ' ')}</span>
                          </div>
                        )}
                      </div>

                      {/* CONTROLES DE IMAGEM DEDICADOS (MOVER APENAS A FOTO SEM MEXER NO TEXTO) */}
                      <div className="space-y-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                          <span>Posição da Imagem:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSceneImage(index, 'up')}
                              disabled={index === 0}
                              title="Mover apenas esta foto para a cena anterior (mantém o texto no lugar)"
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span>Subir Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSceneImage(index, 'down')}
                              disabled={index === scenes.length - 1}
                              title="Mover apenas esta foto para a próxima cena (mantém o texto no lugar)"
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span>Descer Foto</span>
                            </button>
                          </div>
                        </div>

                        {/* Botões de Troca de Imagem e Upload */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetSceneIdForImagePicker(scene.id);
                              setShowImagePickerModal(true);
                            }}
                            className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3 text-indigo-400" />
                            <span>Trocar Foto</span>
                          </button>

                          <label className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                            <Upload className="w-3 h-3 text-emerald-400" />
                            <span>Upload do PC</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadImageForScene(scene.id, e)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Botões de Ação para Lip-Sync desta Cena */}
                      {hasLipSyncVideo ? (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedLipSyncVideo({
                              url: scene.lipSyncVideoUrl || lipSyncData?.videoUrl || '',
                              heading: `Cena ${scene.order}: ${scene.heading}`
                            })}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>▶️ Assistir ao Avatar Falando Esta Cena</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleGenerateSceneLipSync(scene)}
                            disabled={isLipSyncLoading}
                            className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLipSyncLoading ? 'animate-spin' : ''}`} />
                            <span>Regerar Lip-Sync</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateSceneLipSync(scene)}
                          disabled={isLipSyncLoading}
                          className="w-full py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {isLipSyncLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                              <span>Sincronizando Lip-Sync do Avatar...</span>
                            </>
                          ) : (
                            <>
                              <Video className="w-4 h-4 text-purple-400" />
                              <span>Gerar Lip-Sync Desta Cena</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* COLUNA 2: NARRAÇÃO EDITÁVEL & CONTROLES DE ÁUDIO (md:col-span-8) */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Fala Narrada pelo Apresentador (Editável Livremente):</span>
                          </label>

                          {/* Botão de Ouvir Prévia do Áudio Real do Stanley */}
                          <button
                            type="button"
                            onClick={() => handlePreviewSceneSpeech(scene)}
                            title="Ouvir a fala com a voz real selecionada (Stanley Alves)"
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              activePreviewSceneAudioId === scene.id
                                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                            }`}
                          >
                            {activePreviewSceneAudioId === scene.id ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pausar Áudio Real</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>Ouvir Voz Real do Stanley</span>
                              </>
                            )}
                          </button>
                        </div>

                        <textarea
                          value={scene.narration}
                          onChange={(e) => handleUpdateSceneNarration(scene.id, e.target.value)}
                          rows={4}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y shadow-inner"
                        />
                      </div>

                      {/* Barra de Direção de Câmera da Cena */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <strong>Direção de Câmera:</strong>{' '}
                          {isIntro
                            ? 'Abertura em tela cheia no estúdio com bordão oficial.'
                            : isOutro
                            ? 'Encerramento em tela cheia convidando a se inscrever no canal.'
                            : 'Avatar no quadro de webcam gamer no canto com gameplay de fundo e foto oficial em destaque.'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 shrink-0">
                          ID: {scene.id}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* RODAPÉ DA TELA 3 COM BOTÃO DE RENDERIZAÇÃO */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                Todas as Cenas Alinhadas e Prontas para Renderização!
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                O Remotion compilará a linha do tempo completa com áudio sincronizado, avatar na webcam gamer e vídeo de fundo contínuo em 1080p.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRenderFinalVideo}
              disabled={isRenderingFinalVideo || scenes.length === 0}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isRenderingFinalVideo ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Renderizando Vídeo Completo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Renderizar Vídeo Completo (Remotion)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE TROCA DE FOTO DA CENA */}
      {showImagePickerModal && article && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Escolher Imagem para Esta Cena</h3>
                  <p className="text-xs text-slate-400">
                    Clique em qualquer foto oficial extraída da matéria para associar a esta cena:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImagePickerModal(false);
                  setTargetSceneIdForImagePicker(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opção de Enviar Imagem do Computador */}
            <div className="p-3 bg-slate-950 rounded-xl border border-dashed border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-300">Prefere usar uma foto ou arte salva no seu computador?</span>
              <label className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Foto do PC</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (targetSceneIdForImagePicker) {
                      handleUploadImageForScene(targetSceneIdForImagePicker, e);
                      setShowImagePickerModal(false);
                      setTargetSceneIdForImagePicker(null);
                    }
                  }}
                />
              </label>
            </div>

            {/* Grid de Fotos Disponíveis */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
              {article.images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => handleSelectImageForScene(img.url, img.id)}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all hover:scale-105"
                >
                  <img
                    src={img.url}
                    alt={img.alt || 'Foto da notícia'}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                  <div className="p-1.5 bg-slate-950/90 text-[10px] text-slate-300 truncate">
                    {img.alt || 'Foto Oficial'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================== MODAL DE GRAVAÇÃO E CLONAGEM DE VOZ =================== */}
      {/* ========================================================================= */}
      {showVoiceCloneModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Mic className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Gravar e Clonar Minha Voz (Microfone do Navegador)
                  </h3>
                  <p className="text-[11px] text-slate-400">Leia o texto guia em voz alta com seu microfone para uma clonagem perfeita.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isRecording) handleStopRecording();
                  setShowVoiceCloneModal(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TEXTO GUIA DE LEITURA (TELEPROMPTER DINÂMICO CONECTADO AO BANCO) */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-400" />
                  Texto Guia do Teleprompter (Leia com energia natural para clonar sua voz):
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400 font-mono">Meta: 30 a 45s</span>
                  {/* Seletor de Preset no Teleprompter */}
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium cursor-pointer"
                  >
                    {introPresets.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-2 select-none shadow-inner">
                <p className="font-bold text-rose-300 text-sm">
                  "{customHookPhrase}"
                </p>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {customReadingGuide}
                </p>
              </div>
            </div>

            {/* PAINEL DE CONTROLE DE GRAVAÇÃO */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                  isRecording 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : recordedAudioUrl 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isRecording ? `${recordingSeconds}s` : recordedAudioUrl ? 'OK' : 'MIC'}
                </div>

                <div>
                  <span className="text-xs font-bold text-white block">
                    {isRecording 
                      ? 'Gravando seu microfone...' 
                      : recordedAudioUrl 
                      ? 'Gravação concluída! Pronto para clonar.' 
                      : 'Pronto para gravar sua voz.'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isRecording 
                      ? 'Continue lendo o texto guia até atingir 30 segundos...' 
                      : 'Clique em Iniciar Gravação e permita o uso do microfone.'}
                  </span>
                </div>
              </div>

              {/* Botões de Ação do Gravador */}
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/30 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{recordedAudioUrl ? 'Regravar Áudio' : 'Iniciar Gravação'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/30 cursor-pointer animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Parar Gravação</span>
                  </button>
                )}
              </div>
            </div>

            {/* PLAYER DA GRAVAÇÃO FEITA */}
            {recordedAudioUrl && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Escutar Áudio Gravado:</span>
                  <span className="font-mono text-[11px] text-slate-400">{recordingSeconds}s gravados</span>
                </div>
                <audio src={recordedAudioUrl} controls className="w-full h-9 rounded" />
              </div>
            )}

            {/* CONFIGURAÇÃO DO DESTINO E NOME */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome da Voz Clonada:</label>
                <input
                  type="text"
                  value={cloneVoiceName}
                  onChange={(e) => setCloneVoiceName(e.target.value)}
                  placeholder="Ex: Minha Voz Oficial (Stanley Alves)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Destinos da Clonagem */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Onde clonar esta voz:</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloneDestinations.includes('voicestudio')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCloneDestinations((prev) => [...prev, 'voicestudio']);
                        } else {
                          setCloneDestinations((prev) => prev.filter((d) => d !== 'voicestudio'));
                        }
                      }}
                      className="accent-rose-500 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">VoiceStudio (Local)</div>
                      <div className="text-[10px] text-slate-400">Salva no PC • Custo R$ 0,00</div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloneDestinations.includes('elevenlabs')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCloneDestinations((prev) => [...prev, 'elevenlabs']);
                        } else {
                          setCloneDestinations((prev) => prev.filter((d) => d !== 'elevenlabs'));
                        }
                      }}
                      className="accent-purple-500 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">ElevenLabs (Nuvem)</div>
                      <div className="text-[10px] text-slate-400">Instant Voice Clone na sua conta</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* FEEDBACK E BOTÕES FINAIS */}
            {cloneFeedback && (
              <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/40 text-xs font-bold text-rose-300 text-center">
                {cloneFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVoiceCloneModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveClonedVoice}
                disabled={isCloningVoice || !recordedAudioBase64}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCloningVoice ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isCloningVoice ? 'Clonando Voz...' : 'Salvar e Clonar Voz'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== MODAL DE CADASTRAR NOVO AVATAR ===================== */}
      {/* ========================================================================= */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Cadastrar Novo Avatar
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAvatarModal(false);
                  setAvatarErrorAlert(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {avatarErrorAlert && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Para prosseguir, você deve selecionar ou criar um avatar.</span>
              </div>
            )}

            <form onSubmit={handleCreateAvatar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Avatar:</label>
                <input
                  type="text"
                  required
                  value={newAvatarName}
                  onChange={(e) => setNewAvatarName(e.target.value)}
                  placeholder="Ex: Stanley Alves (Camisa Preta / Estúdio)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">URL da Imagem / Foto do Avatar:</label>
                <input
                  type="text"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  placeholder="http://localhost:3001/storage/avatars/minha_foto.jpg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Se deixar vazio, usará a foto de webcam padrão do Stanley.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Salvar e Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== MODAL DE BUSCA DE STOCK VIDEOS ===================== */}
      {/* ========================================================================= */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                Banco de Vídeos Gratuitos (Pexels & Pixabay)
              </h3>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                placeholder="Pesquisar por tema (ex: gameplay, tech, war, city)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStockVideos()}
              />
              <button
                type="button"
                onClick={handleSearchStockVideos}
                disabled={isSearchingStock}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isSearchingStock ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
              {stockVideos.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-500">
                  {isSearchingStock ? 'Buscando vídeos no Pexels e Pixabay...' : 'Nenhum vídeo encontrado. Digite um termo e clique em Buscar.'}
                </div>
              ) : (
                stockVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between group hover:border-purple-500 transition-all"
                  >
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={vid.previewUrl}
                        alt={vid.title}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                        {vid.duration}s
                      </span>
                    </div>

                    <div className="mt-2">
                      <h5 className="text-[11px] font-bold text-white truncate">{vid.title}</h5>
                      <span className="text-[9px] text-purple-400 uppercase font-mono">{vid.source}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStockVideo(vid);
                        setBrollVideoSource(vid.videoUrl);
                        setShowStockModal(false);
                      }}
                      className="mt-2 w-full py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-500 text-[11px] font-bold text-purple-300 hover:text-white transition-all cursor-pointer"
                    >
                      Usar Este Vídeo de Fundo
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* ============== MODAL DE ASSISTIR LIP-SYNC DO AVATAR EM TELA CHEIA ======= */}
      {/* ========================================================================= */}
      {expandedLipSyncVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Play className="w-5 h-5 fill-current" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {expandedLipSyncVideo.heading || 'Prévia do Avatar Falando'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vídeo sincronizado do avatar (apresentador Stanley Alves) com áudio real:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpandedLipSyncVideo(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
              <video
                controls
                autoPlay
                playsInline
                src={expandedLipSyncVideo.url}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lip-Sync renderizado e sincronizado perfeitamente para esta cena.</span>
              </span>
              <button
                type="button"
                onClick={() => setExpandedLipSyncVideo(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Fechar Prévia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

