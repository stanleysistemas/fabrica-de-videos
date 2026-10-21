import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Link, Check, RefreshCw, Copy, Search, 
  Gamepad2, Image as ImageIcon, Film, X, AlertTriangle,
  Tv, Smartphone, Clock, User, Mic, Globe2, ArrowRight, ArrowLeft,
  Upload, CheckCircle2, Video, Play, Pause, Square, Volume2, Camera,
  Radio
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
  group: string;
  description: string;
  sampleAudioUrl: string;
  isCloned: boolean;
}

export const NewsToVideoView: React.FC = () => {
  // Controle de Tela (1 = Configurações Prévia, 2 = Texto Capturado e Mídias)
  const [currentScreen, setCurrentScreen] = useState<1 | 2>(1);

  // === TELA 1: ESTADOS DE CONFIGURAÇÃO PRÉVIA ===
  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical'>('horizontal'); // 16:9 ou 9:16
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5); // 1, 3, 5, 10, 15 min
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('avatar_stanley_setup');
  const [voiceEngine, setVoiceEngine] = useState<'voicestudio_local' | 'elevenlabs'>('elevenlabs');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
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

  // Modal de Stock Videos
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('gameplay 4k');
  const [isSearchingStock, setIsSearchingStock] = useState(false);
  const [stockVideos, setStockVideos] = useState<StockVideoItem[]>([]);

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

        // Seleciona a primeira voz disponível caso ainda não haja selecionada
        if (voiceEngine === 'elevenlabs' && data.elevenlabs?.length > 0 && !selectedVoiceId) {
          setSelectedVoiceId(data.elevenlabs[0].id);
        } else if (voiceEngine === 'voicestudio_local' && data.voicestudio?.length > 0 && !selectedVoiceId) {
          setSelectedVoiceId(data.voicestudio[0].id);
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
  }, []);

  // Quando troca o motor de voz (VoiceStudio vs ElevenLabs), atualiza a voz selecionada
  useEffect(() => {
    const activeList = voiceEngine === 'voicestudio_local' ? voiceCatalog.voicestudio : voiceCatalog.elevenlabs;
    if (activeList.length > 0) {
      setSelectedVoiceId(activeList[0].id);
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
          voiceEngine,
          selectedVoiceId,
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

  // Lista de vozes ativas do motor selecionado
  const currentVoiceList = voiceEngine === 'voicestudio_local' 
    ? voiceCatalog.voicestudio 
    : voiceCatalog.elevenlabs;

  const currentSelectedVoiceObj = currentVoiceList.find((v) => v.id === selectedVoiceId);

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

        {/* BORDÃO OFICIAL CRAVADO */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Bordão Cravado: "Fala moçada! Segura o controle..."</span>
          </div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO ENTRE AS 2 TELAS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCurrentScreen(1)}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
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
              ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 cursor-pointer'
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

            {/* TEXTO GUIA DE LEITURA (TELEPROMPTER) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-400" />
                  Texto Guia de Leitura (Leia com energia natural de streamer):
                </label>
                <span className="text-[10px] text-amber-400 font-mono">Meta: 30 a 45 segundos</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-2 select-none">
                <p className="font-bold text-rose-300">
                  "Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo..."
                </p>
                <p>
                  "Sejam muito bem-vindos ao canal! Hoje nós vamos analisar todas as novidades, armas e estratégias do lançamento. Preste bastante atenção em cada detalhe, porque a jogabilidade mudou completamente. Não se esqueça de deixar o seu like e se inscrever no canal para não perder nenhum conteúdo exclusivo!"
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
    </div>
  );
};
