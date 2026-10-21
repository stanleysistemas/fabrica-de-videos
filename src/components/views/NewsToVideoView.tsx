import React, { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { 
  Sparkles, Link, Check, RefreshCw, Copy, Search, 
  Gamepad2, Image as ImageIcon, Film, X, AlertTriangle, Key,
  Tv, Smartphone, Clock, User, Mic, Globe2, ArrowRight, ArrowLeft,
  Upload, CheckCircle2, Video, Play, Pause, Volume2, ShieldCheck,
  Camera, Layers, Cpu
} from 'lucide-react';

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
  categoryLabel: string;
  tone: string;
  description: string;
  sampleAudioUrl: string;
  isCustomCloned?: boolean;
}

export const NewsToVideoView: React.FC = () => {
  const { clonedVoices } = useSettingsStore();

  // Controle de Tela (1 = Configurações Prévia, 2 = Texto Capturado e Mídias)
  const [currentScreen, setCurrentScreen] = useState<1 | 2>(1);

  // === TELA 1: ESTADOS DE CONFIGURAÇÃO PRÉVIA ===
  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical'>('horizontal'); // 16:9 ou 9:16
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5); // 1, 3, 5, 10, 15 min
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('avatar_stanley_setup');
  const [voiceEngine, setVoiceEngine] = useState<'voicestudio_local' | 'elevenlabs'>('voicestudio_local');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('voice_stanley_official');
  const [language, setLanguage] = useState<string>('pt-BR'); // pt-BR, en-US, es-ES
  const [lipSyncEngine, setLipSyncEngine] = useState<'heygen' | 'latentsync'>('heygen');

  // Catálogo de Vozes com Prévia de Áudio
  const [voiceCatalog, setVoiceCatalog] = useState<{
    voicestudio: VoiceItem[];
    elevenlabs: VoiceItem[];
  }>({
    voicestudio: [
      {
        id: 'voice_stanley_official',
        name: 'Minha Voz Oficial (Clonada - Stanley Alves)',
        engine: 'voicestudio_local',
        categoryLabel: 'VoiceStudio Local (Custo $0)',
        tone: 'grave',
        description: 'Voz personalizada com o bordão "Fala moçada! Segura o controle..." calibrada para games e tech.',
        sampleAudioUrl: '',
        isCustomCloned: true,
      },
      {
        id: 'voice_vs_marcus',
        name: 'Marcus Prime (Documentário)',
        engine: 'voicestudio_local',
        categoryLabel: 'VoiceStudio Local (Custo $0)',
        tone: 'grave',
        description: 'Voz profunda calibrada para autoridade, história e retenção narrativa estilo Vox.',
        sampleAudioUrl: '',
        isCustomCloned: false,
      },
      {
        id: 'voice_vs_elena',
        name: 'Elena Tech (Dinâmica)',
        engine: 'voicestudio_local',
        categoryLabel: 'VoiceStudio Local (Custo $0)',
        tone: 'dinamico',
        description: 'Entonação ágil e moderna ideal para canais dark de tecnologia, curiosidades e finanças.',
        sampleAudioUrl: '',
        isCustomCloned: false,
      },
    ],
    elevenlabs: [
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam (Profundo & Confiante)',
        engine: 'elevenlabs',
        categoryLabel: 'ElevenLabs Nuvem',
        tone: 'grave',
        description: 'Tom firme, confiante e cinematográfico. Excelente para narração épica e tech.',
        sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/pNInz6obpgDQGcFmaJgB/sample.mp3',
      },
      {
        id: 'ErXwobaYiN019PkySvjV',
        name: 'Antoni (Gamer & Dinâmico)',
        engine: 'elevenlabs',
        categoryLabel: 'ElevenLabs Nuvem',
        tone: 'dinamico',
        description: 'Ritmo enérgico, dicção clara e casual. Perfeito para notícias de games e lives.',
        sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/ErXwobaYiN019PkySvjV/sample.mp3',
      },
      {
        id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel (Noticiosa & Calma)',
        engine: 'elevenlabs',
        categoryLabel: 'ElevenLabs Nuvem',
        tone: 'suave',
        description: 'Voz feminina clara e profissional, padrão de telejornais e reportagens.',
        sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/21m00Tcm4TlvDq8ikWAM/sample.mp3',
      },
      {
        id: 'onwK4e9ZLuTAKqWW03F9',
        name: 'Daniel (Documentário Sério)',
        engine: 'elevenlabs',
        categoryLabel: 'ElevenLabs Nuvem',
        tone: 'grave',
        description: 'Voz madura e detalhista para dossiês e matérias investigativas.',
        sampleAudioUrl: 'https://storage.googleapis.com/eleven-public-prod/previews/voices/onwK4e9ZLuTAKqWW03F9/sample.mp3',
      },
    ],
  });

  // Player de Áudio de Teste
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

  // Vídeo de Fundo Contínuo (B-Roll)
  const [brollVideoSource, setBrollVideoSource] = useState<string>('@stanleyalvesbr');
  const [selectedStockVideo, setSelectedStockVideo] = useState<StockVideoItem | null>(null);

  // Modais de Stock Videos e Chaves de API
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('gameplay 4k');
  const [isSearchingStock, setIsSearchingStock] = useState(false);
  const [stockVideos, setStockVideos] = useState<StockVideoItem[]>([]);

  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<any>({});
  const [formKeys, setFormKeys] = useState({
    pexelsApiKey: '',
    pixabayApiKey: '',
    heygenApiKey: '',
    replicateApiToken: '',
  });
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [saveKeysSuccess, setSaveKeysSuccess] = useState(false);

  // Carregar status das chaves de API e catálogo de vozes
  useEffect(() => {
    // 1. Chaves de API
    fetch('http://localhost:3001/api/stock-videos/keys')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setApiKeysStatus(data);
          if (data.keys) setFormKeys(data.keys);
        }
      })
      .catch(() => {});

    // 2. Catálogo de vozes
    fetch('http://localhost:3001/api/voices/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setVoiceCatalog({
            voicestudio: data.voicestudio || [],
            elevenlabs: data.elevenlabs || [],
          });
        }
      })
      .catch(() => {});
  }, []);

  // Tocar / Pausar Áudio de Demonstração de Voz
  const handleTogglePlayVoice = (voice: VoiceItem) => {
    // Se já estiver tocando essa voz, pausa
    if (playingVoiceId === voice.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      return;
    }

    // Se tiver URL de áudio MP3 (ElevenLabs ou VoiceStudio gravado)
    if (voice.sampleAudioUrl && voice.sampleAudioUrl.startsWith('http')) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(voice.sampleAudioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setPlayingVoiceId(null);
      audio.onerror = () => {
        // Fallback para síntese de voz nativa caso o link falhe
        speakNativeSample(voice);
      };
      audio.play().then(() => {
        setPlayingVoiceId(voice.id);
      }).catch(() => {
        speakNativeSample(voice);
      });
    } else {
      // Síntese nativa em português com o bordão
      speakNativeSample(voice);
    }
  };

  // Síntese de fala de demonstração (fallback ou teste instantâneo)
  const speakNativeSample = (voice: VoiceItem) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const phrase = voice.id === 'voice_stanley_official' 
        ? 'Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo!'
        : `Olá! Esta é uma demonstração da voz ${voice.name} para o seu vídeo.`;

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = language === 'pt-BR' ? 'pt-BR' : 'en-US';
      utterance.pitch = voice.tone === 'grave' ? 0.85 : voice.tone === 'dinamico' ? 1.15 : 1.0;
      utterance.rate = voice.tone === 'dinamico' ? 1.1 : 0.95;

      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);

      setPlayingVoiceId(voice.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Salvar chaves de API
  const handleSaveApiKeys = async () => {
    setIsSavingKeys(true);
    try {
      const res = await fetch('http://localhost:3001/api/stock-videos/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formKeys),
      });
      if (res.ok) {
        setSaveKeysSuccess(true);
        setTimeout(() => setSaveKeysSuccess(false), 2500);
        const statusRes = await fetch('http://localhost:3001/api/stock-videos/keys');
        const statusData = await statusRes.json();
        if (statusData.success) setApiKeysStatus(statusData);
      }
    } catch (err) {
      console.error('Erro ao salvar chaves:', err);
    } finally {
      setIsSavingKeys(false);
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
      const res = await fetch('http://localhost:3001/api/news/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          styleMode: 'gamer_streamer',
          targetDurationMinutes,
          brollChannel: brollVideoSource,
          themeFocus: 'all',
          lipSyncEngine,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.article) {
          setArticle(data.article);
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

  // Copiar texto bruto da matéria
  const handleCopyRawText = () => {
    if (!article?.fullText) return;
    navigator.clipboard.writeText(article.fullText);
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2000);
  };

  const filteredRawText = article?.fullText
    ? rawTextSearch.trim()
      ? article.fullText
          .split('\n')
          .filter((line) => line.toLowerCase().includes(rawTextSearch.toLowerCase()))
          .join('\n')
      : article.fullText
    : '';

  // Lista de vozes ativas conforme o motor selecionado
  const currentVoiceList = voiceEngine === 'voicestudio_local' 
    ? voiceCatalog.voicestudio 
    : voiceCatalog.elevenlabs;

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
              Notícia para Vídeo (Fluxo em 2 Telas)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {currentScreen === 1 
              ? 'Tela 1: Configuração da Notícia, Formato, Duração, Avatar, Voz e Lip-Sync' 
              : 'Tela 2: Texto Capturado, Mídias da Notícia e Seleção de Vídeo de Fundo'}
          </p>
        </div>

        {/* BORDÃO OFICIAL CRAVADO & GESTÃO DE CHAVES */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Bordão Cravado: "Fala moçada! Segura o controle..."</span>
          </div>

          <button
            type="button"
            onClick={() => setShowApiKeysModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Chaves de API</span>
          </button>
        </div>
      </div>

      {/* BARRA DE PROGRESSO ENTRE AS 2 TELAS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCurrentScreen(1)}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
            currentScreen === 1
              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
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

        <button
          type="button"
          onClick={() => {
            if (article) setCurrentScreen(2);
            else alert('Você precisa raspar a notícia na Tela 1 primeiro.');
          }}
          disabled={!article}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
            currentScreen === 2
              ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
              : !article
              ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
            currentScreen === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            2
          </div>
          <div>
            <div className="text-xs font-extrabold text-white">Tela 2: Notícia Capturada & Mídias</div>
            <div className="text-[11px] text-slate-400">Texto bruto, fotos do site e vídeo de fundo</div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ==================== TELA 1: CONFIGURAÇÃO PRÉVIA ======================== */}
      {/* ========================================================================= */}
      {currentScreen === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            
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
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                  >
                    Exemplo COD MW4
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setUrl('https://g1.globo.com/tecnologia/')}
                    className="text-[11px] text-slate-400 hover:text-slate-300 font-semibold underline"
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
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
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
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
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
                      className={`py-2.5 rounded-xl border text-center transition-all ${
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

            {/* 4. ESCOLHER AVATAR QUE IREMOS USAR (COM REGRA DE CÂMERA DO STANLEY) */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  4. Avatar do Apresentador:
                </label>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all"
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

            {/* 5. VOZ QUE SERÁ USADA COM PLAYER PARA ESCUTAR E TESTAR */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  5. Voz que Será Usada (Escute e Teste Antes de Escolher):
                </label>
                <span className="text-[11px] text-slate-400">
                  Clique no play para ouvir a entonação da voz!
                </span>
              </div>

              {/* Seleção de Motor de Voz */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVoiceEngine('voicestudio_local')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    voiceEngine === 'voicestudio_local'
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className={`w-5 h-5 ${voiceEngine === 'voicestudio_local' ? 'text-rose-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-extrabold">Voz Clonada Local (VoiceStudio)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Roda no seu PC (Intel i5-13500) • Custo R$ 0,00</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVoiceEngine('elevenlabs')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    voiceEngine === 'elevenlabs'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${voiceEngine === 'elevenlabs' ? 'text-purple-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-extrabold">ElevenLabs (API Nuvem)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Vozes consagradas e ultra realistas de estúdio</div>
                  </div>
                </button>
              </div>

              {/* LISTA DE VOZES COM PLAYER PARA OUVIR E TESTAR CADA UMA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentVoiceList.map((v) => {
                  const isSelected = selectedVoiceId === v.id;
                  const isPlaying = playingVoiceId === v.id;

                  return (
                    <div
                      key={v.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-950 border-rose-500 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/20'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-white truncate">{v.name}</span>
                            {v.isCustomCloned && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                                Stanley Oficial
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">{v.description}</p>
                        </div>

                        {/* Botão de Play / Ouvir Amostra */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlayVoice(v);
                          }}
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isPlaying
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white'
                          }`}
                          title={isPlaying ? 'Pausar áudio' : 'Ouvir amostra de voz'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-850">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          Tom: <strong className="text-slate-300">{v.tone}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedVoiceId(v.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isSelected ? '✓ Selecionada' : 'Usar Esta Voz'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. IDIOMA DO VÍDEO & 7. MOTOR DE LIP-SYNC DO AVATAR */}
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
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
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

              {/* 7. MOTOR DE LIP-SYNC (HEYGEN VS LATENTSYNC) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-400" />
                  7. Motor de Lip-Sync (Sincronia Labial):
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* HeyGen API */}
                  <button
                    type="button"
                    onClick={() => setLipSyncEngine('heygen')}
                    className={`p-3 rounded-xl border text-left transition-all ${
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
                      Talking Photo de estúdio (idêntico ao gerado em teste).
                    </div>
                  </button>

                  {/* Replicate LatentSync */}
                  <button
                    type="button"
                    onClick={() => setLipSyncEngine('latentsync')}
                    className={`p-3 rounded-xl border text-left transition-all ${
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

          {/* 1. TEXTO QUE FOI CAPTURADO DA NOTÍCIA */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  1. Texto Capturado da Notícia
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono line-clamp-1">{article.title}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                  {article.fullText ? article.fullText.split(/\s+/).length : 0} palavras
                </span>
                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
                  {article.fullText ? article.fullText.length : 0} caracteres
                </span>
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

            {/* Barra de Busca no Texto */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={rawTextSearch}
                onChange={(e) => setRawTextSearch(e.target.value)}
                placeholder="Filtrar ou pesquisar palavras no texto bruto..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Caixa com o Texto Bruto Completo */}
            <div className="h-64 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {filteredRawText || 'Nenhum trecho correspondente à busca.'}
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

          {/* 3. ESCOLHA DO VÍDEO DE FUNDO (SE TIVER SOMENTE IMAGENS OU LINK DO CANAL) */}
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

            {/* Input para Colocar Link de Vídeo (ex: YouTube Live do Stanley ou MP4) */}
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

          {/* BOX DE CONCLUSÃO DA ETAPA */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Fluxo Configurado com Sucesso até a Tela 2!
              </div>
              <p className="text-xs text-slate-300 mt-1">
                A notícia e suas mídias foram capturadas e o vídeo de fundo está vinculado. Aguardando suas próximas instruções para avançar!
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Etapas 1 e 2 Alinhadas</span>
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
      {/* ===================== MODAL DE GESTÃO DE CHAVES DE API =================== */}
      {/* ========================================================================= */}
      {showApiKeysModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Gerenciar Chaves de API (Pexels, Pixabay, HeyGen, Replicate)
              </h3>
              <button
                type="button"
                onClick={() => setShowApiKeysModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveKeysSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Chaves salvas com sucesso em storage/api_keys.json!</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                  <span>Pexels API Key (Vídeos Gratuitos):</span>
                  <a
                    href="https://www.pexels.com/api/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Obter Chave Grátis
                  </a>
                </label>
                <input
                  type="password"
                  value={formKeys.pexelsApiKey}
                  onChange={(e) => setFormKeys({ ...formKeys, pexelsApiKey: e.target.value })}
                  placeholder="Cole sua API Key do Pexels..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                  <span>Pixabay API Key (Vídeos Gratuitos):</span>
                  <a
                    href="https://pixabay.com/api/docs/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Obter Chave Grátis
                  </a>
                </label>
                <input
                  type="password"
                  value={formKeys.pixabayApiKey}
                  onChange={(e) => setFormKeys({ ...formKeys, pixabayApiKey: e.target.value })}
                  placeholder="Cole sua API Key do Pixabay..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                  <span>HeyGen API Key (Talking Photo Lip-Sync):</span>
                  <a
                    href="https://app.heygen.com/settings?nav=API"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Obter Chave HeyGen
                  </a>
                </label>
                <input
                  type="password"
                  value={formKeys.heygenApiKey}
                  onChange={(e) => setFormKeys({ ...formKeys, heygenApiKey: e.target.value })}
                  placeholder="Cole sua API Key do HeyGen..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                  <span>Replicate API Token (LatentSync ByteDance):</span>
                  <a
                    href="https://replicate.com/account/api-tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Obter Token Replicate
                  </a>
                </label>
                <input
                  type="password"
                  value={formKeys.replicateApiToken}
                  onChange={(e) => setFormKeys({ ...formKeys, replicateApiToken: e.target.value })}
                  placeholder="r8_..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowApiKeysModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSaveApiKeys}
                disabled={isSavingKeys}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingKeys && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
