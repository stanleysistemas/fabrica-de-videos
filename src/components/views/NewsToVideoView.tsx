import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { 
  Sparkles, Link, Check, Edit3, Play, ShieldCheck, Clock, FileText, 
  Gamepad2, Image as ImageIcon, RefreshCw, Copy, Download, Search, 
  Crosshair, Users, Zap, Globe, Target, AlertTriangle, Key, ExternalLink,
  Film, X
} from 'lucide-react';

interface ScrapedImage {
  id: string;
  url: string;
  alt: string;
  category?: string;
  isCover: boolean;
}

interface NewsSceneDraft {
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
  layoutMode: 'full_image' | 'webcam_streamer' | 'avatar_fullscreen' | 'gameplay_with_webcam';
  category?: string;
}

export type ThemeFocusType = 'all' | 'weapons' | 'operators' | 'equipment' | 'custom';

interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
  themeFocus: ThemeFocusType;
  customPrompt?: string;
  targetDurationMinutes: number;
  totalDurationSeconds: number;
  scenes: NewsSceneDraft[];
  suggestedVoiceId: string;
  styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
  brollSource?: {
    channel: string;
    label: string;
  };
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

export const NewsToVideoView: React.FC = () => {
  const { setScenes } = useProjectStore();
  const { setCurrentModule } = useNavigationStore();

  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [styleMode] = useState<'gamer_streamer' | 'tech_news' | 'documentary'>('gamer_streamer');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5);
  const [brollChannel, setBrollChannel] = useState<string>('@stanleyalvesbr');
  const [themeFocus, setThemeFocus] = useState<ThemeFocusType>('weapons');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  // Abas de visualização
  const [viewTab, setViewTab] = useState<'scenes_editor' | 'full_script' | 'raw_text'>('scenes_editor');
  const [rawSearchQuery, setRawSearchQuery] = useState<string>('');
  const [copiedRawText, setCopiedRawText] = useState(false);

  // Estados de dados
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingPlan, setIsRegeneratingPlan] = useState(false);
  const [article, setArticle] = useState<ScrapedArticle | null>(null);
  const [plan, setPlan] = useState<NewsVideoPlan | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  // Filtro de galeria
  const [imageCategoryFilter, setImageCategoryFilter] = useState<'all' | 'weapons' | 'operators'>('all');

  // Modais de Stock Videos e Chaves de API
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('call of duty gameplay');
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

  // Carregar status das chaves de API
  useEffect(() => {
    fetch('http://localhost:3001/api/stock-videos/keys')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setApiKeysStatus(data);
        }
      })
      .catch(() => {});
  }, []);

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
        // Atualizar status
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

  // Dispara o scraper no backend
  const handleScrape = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/news/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          styleMode, 
          targetDurationMinutes, 
          brollChannel,
          themeFocus,
          customPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.article && data.plan) {
          setArticle(data.article);
          setPlan(data.plan);
          setSelectedImageIds(data.article.images.map((img: ScrapedImage) => img.id));
        }
      }
    } catch (err) {
      console.error('[NewsToVideo] Erro ao raspar matéria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar novo roteiro com novo foco temático sem raspar a web novamente
  const handleRegenerateByFocus = async (newFocus: ThemeFocusType) => {
    setThemeFocus(newFocus);
    if (!article) return;

    setIsRegeneratingPlan(true);
    try {
      const res = await fetch('http://localhost:3001/api/news/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article,
          themeFocus: newFocus,
          customPrompt,
          styleMode,
          selectedImageIds,
          targetDurationMinutes,
          brollChannel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plan) {
          setPlan(data.plan);
        }
      }
    } catch (err) {
      console.error('[NewsToVideo] Erro ao recalcular plano temático:', err);
    } finally {
      setIsRegeneratingPlan(false);
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

  // Atualizar narração de uma cena específica
  const handleNarrationChange = (sceneId: string, newNarration: string) => {
    if (!plan) return;
    const updatedScenes = plan.scenes.map((sc) => {
      if (sc.id === sceneId) {
        const words = newNarration.split(/\s+/).length;
        const dur = Math.max(3, Math.round((words / 2.4) * 1.15));
        return { ...sc, narration: newNarration, durationInSeconds: dur };
      }
      return sc;
    });

    const totalDur = updatedScenes.reduce((acc, s) => acc + s.durationInSeconds, 0);
    setPlan({ ...plan, scenes: updatedScenes, totalDurationSeconds: totalDur });
  };

  // Aprovar e carregar no Player Remotion do SaaS
  const handleApproveAndSendToPlayer = () => {
    if (!plan) return;
    setIsCompiling(true);

    const compiledScenes = plan.scenes.map((sc) => ({
      id: sc.id,
      title: sc.heading,
      subtitle: sc.narration.slice(0, 60) + '...',
      text: sc.narration,
      durationInSeconds: sc.durationInSeconds,
      type: 'ken_burns_news' as const,
      associatedImageUrl: sc.associatedImageUrl,
      imageUrl: sc.associatedImageUrl,
      kenBurnsEffect: sc.kenBurnsEffect,
      layoutMode: sc.layoutMode,
      narration: sc.narration,
    }));

    setScenes(compiledScenes as any);
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        title: plan.title,
        brand: {
          ...state.project.brand,
          name: article?.siteName || 'CALL OF DUTY OFICIAL',
        },
      },
    }));

    setTimeout(() => {
      setIsCompiling(false);
      setCompileSuccess(true);
      setTimeout(() => {
        setCurrentModule('viral_video');
      }, 1000);
    }, 800);
  };

  const totalWords = plan?.scenes.reduce((acc, s) => acc + s.narration.split(/\s+/).filter(Boolean).length, 0) || 0;

  // Filtragem de fotos na galeria
  const displayedImages = article?.images.filter((img) => {
    if (imageCategoryFilter === 'weapons') return img.category === 'fuzis_e_armas' || img.url.toLowerCase().includes('weapon');
    if (imageCategoryFilter === 'operators') return img.category === 'operadores' || img.url.toLowerCase().includes('operator') || img.url.toLowerCase().includes('ops');
    return true;
  }) || [];

  // Texto bruto filtrado para busca
  const rawParagraphsFiltered = (article?.paragraphs || []).filter((p) => {
    if (!rawSearchQuery.trim()) return true;
    return p.toLowerCase().includes(rawSearchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner Oficial & Botão de Configuração de APIs */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo Vídeo Longo • Etapa 1
            </span>
            <span className="text-xs text-slate-400">• Ingestão Universal de Notícia & Mídias</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Criar Vídeo por Notícia com Gameplay e Avatar</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Insira o link de qualquer notícia (games, política, tecnologia ou geral). O sistema extrai estritamente as fotos e vídeos reais do site. Se não houver mídias, o fluxo pausa para você escolher vídeos de fundo gratuitos da internet.
          </p>

          {/* Assinatura Cravada do Stanley Alves */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
            <span>🎙️ Assinatura Cravada:</span>
            <span className="font-bold text-amber-200">"Fala moçada! Segura o controle / pega a pipoca e vem comigo..."</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowApiKeysModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Configurar APIs de Mídia</span>
          </button>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Armazenamento</div>
            <div className="text-emerald-400 font-extrabold text-xs mt-0.5">SQLite + Disco Local</div>
          </div>
        </div>
      </div>

      {/* Painel de Configuração Inicial (Etapa 1: Duração, Vídeo de Fundo e Link) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-xl">
        {/* 1. SELETOR DE DURAÇÃO ALVO (Até 15 Minutos) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              1. Escolha o Tempo do Vídeo (Até 15 Minutos):
            </label>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              Tempo Selecionado: {targetDurationMinutes} {targetDurationMinutes === 1 ? 'Minuto' : 'Minutos'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {[
              { min: 1, label: '1 min', tag: 'Shorts / Reels' },
              { min: 3, label: '3 min', tag: 'Notícia Rápida' },
              { min: 5, label: '5 min', tag: 'Padrão YouTube' },
              { min: 10, label: '10 min', tag: 'Guia Completo' },
              { min: 15, label: '15 min', tag: 'Dossiê Longo' },
            ].map((item) => (
              <button
                key={item.min}
                type="button"
                onClick={() => setTargetDurationMinutes(item.min)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  targetDurationMinutes === item.min
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="text-sm font-extrabold">{item.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{item.tag}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={targetDurationMinutes}
              onChange={(e) => setTargetDurationMinutes(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />
            <span className="text-xs font-mono text-slate-300 shrink-0">{targetDurationMinutes} min</span>
          </div>
        </div>

        {/* 2. SELETOR DE FOCO DO VÍDEO (Sobre o que você quer falar) */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              2. Foco do Roteiro (Sobre o que você quer falar neste vídeo?):
            </label>
            <span className="text-[11px] text-slate-400">
              Gere múltiplos vídeos a partir da mesma matéria!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'weapons' as ThemeFocusType, label: 'Arsenal & Armas', icon: Crosshair, desc: 'Fuzis, SMGs, Snipers, Acessórios Apex' },
              { id: 'operators' as ThemeFocusType, label: '33 Operadores', icon: Users, desc: 'Skins, Facções e Desbloqueios' },
              { id: 'equipment' as ThemeFocusType, label: 'Equipamentos', icon: Zap, desc: 'Séries de Baixas, Armeiro e Vantagens' },
              { id: 'all' as ThemeFocusType, label: 'Matéria Completa', icon: Globe, desc: 'Panorama geral de todo o lançamento' },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = themeFocus === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    if (article) {
                      handleRegenerateByFocus(f.id);
                    } else {
                      setThemeFocus(f.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="font-extrabold text-xs">{f.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. VÍDEO DE FUNDO CONTÍNUO (B-Roll ou Live do @stanleyalvesbr) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              3. Vídeo de Fundo Contínuo (Live Gamer ou Vídeo de Banco Free):
            </label>
            <button
              type="button"
              onClick={() => {
                setShowStockModal(true);
                handleSearchStockVideos();
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-all"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Buscar Vídeos Grátis (Pexels / Pixabay)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Fonte Ativa: {brollChannel}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Vídeo contínuo no fundo (áudio original mutado)</span>
              </div>
              <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Fundo Ativo
              </span>
            </div>

            <div>
              <input
                type="text"
                value={brollChannel}
                onChange={(e) => setBrollChannel(e.target.value)}
                placeholder="Ex: @stanleyalvesbr ou link de vídeo MP4/YouTube"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 4. LINK DA MATÉRIA (Universal: Jogos, Política, Tecnologia, etc.) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-2">
            <Link className="w-4 h-4 text-emerald-400" />
            4. Link da Matéria / Post Oficial (Qualquer Site ou Nicho):
          </label>

          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole aqui o link do blog ou notícia (ex: Activision, G1, UOL, TechTudo, etc.)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 pr-44 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all font-mono"
            />
            <button
              type="button"
              onClick={handleScrape}
              disabled={isLoading || !url}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extraindo ({targetDurationMinutes} min)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extrair Notícia & Mídias</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE APÓS EXTRAÇÃO */}
      {article && plan && (
        <div className="space-y-6 animate-fadeIn">
          {/* Alerta de Verificação Estrita de Mídias Reais */}
          {article.images.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-200 uppercase">
                  Pausa Inteligente: Nenhuma Imagem/Vídeo Encontrado no Corpo da Notícia
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Seguindo a regra de não inventar dados fora do site, o fluxo pausou para que você selecione um vídeo de fundo da internet (via Pexels ou seu canal) antes de compilar o vídeo final.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStockModal(true)}
                  className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Escolher Vídeo de Fundo Gratuito Agora</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Mídias Estritas da Página: {article.images.length} fotos reais catalogadas com sucesso.
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Regra: 0% mídias não autorizadas
              </span>
            </div>
          )}

          {/* Barra de Status da Matéria Extraída */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                  Fonte: {article.siteName}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-bold">
                  {article.images.length} Fotos Reais
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-bold">
                  {article.sections.length} Tópicos
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">
                  Foco: <span className="text-amber-400 uppercase">{plan.themeFocus}</span>
                </span>
                {isRegeneratingPlan && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                )}
              </div>
            </div>

            <h3 className="font-black text-lg text-white leading-tight">{article.title}</h3>
            <p className="text-xs text-slate-300">{article.description}</p>
          </div>

          {/* Galeria de Fotos Reais da Matéria */}
          {article.images.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  Galeria da Notícia ({displayedImages.length} fotos de {article.images.length}):
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImageCategoryFilter('all')}
                    className={`text-[10px] px-2 py-1 rounded font-bold ${
                      imageCategoryFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas ({article.images.length})
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllImages(true)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Selecionar Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllImages(false)}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                {displayedImages.map((img) => {
                  const isSelected = selectedImageIds.includes(img.id);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => toggleImageSelection(img.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all group aspect-video ${
                        isSelected
                          ? 'border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'border-slate-800 opacity-40 hover:opacity-75'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className={`absolute top-1 right-1 w-4 h-4 rounded flex items-center justify-center transition-all ${
                          isSelected ? 'bg-emerald-500 text-black' : 'bg-black/70 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Abas: 1. Editor de Cenas | 2. Teleprompter | 3. Texto Bruto da Matéria */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setViewTab('scenes_editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewTab === 'scenes_editor'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor de Cenas ({plan.scenes.length} Tomadas)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab('full_script')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewTab === 'full_script'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Roteiro Corrido (Teleprompter)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab('raw_text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    viewTab === 'raw_text'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Texto Completo Bruto (Guardado)</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
                {plan.totalDurationSeconds}s ({Math.round(plan.totalDurationSeconds / 60)} min) • {totalWords} palavras
              </div>
            </div>

            {/* ABA 1: Editor de Cenas */}
            {viewTab === 'scenes_editor' && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {plan.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-4 items-start hover:border-slate-700 transition-all"
                  >
                    {scene.associatedImageUrl && (
                      <div className="w-full sm:w-36 aspect-video rounded-lg overflow-hidden border border-slate-800 shrink-0 relative">
                        <img
                          src={scene.associatedImageUrl}
                          alt={scene.heading}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.2 rounded uppercase">
                          {scene.type === 'gameplay_broll' ? 'Fundo Vídeo' : scene.kenBurnsEffect}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white uppercase tracking-wider">
                          Cena {scene.order}: {scene.heading}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {scene.durationInSeconds}s • {scene.type === 'gameplay_broll' ? brollChannel : 'Mídia Notícia'}
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={scene.narration}
                        onChange={(e) => handleNarrationChange(scene.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ABA 2: Roteiro Corrido Teleprompter */}
            {viewTab === 'full_script' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                  <span>Narração completa com o bordão de abertura do apresentador:</span>
                  <span className="text-emerald-400">{totalWords} palavras estimadas</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed space-y-3 max-h-96 overflow-y-auto font-sans p-3 bg-slate-900/60 rounded-lg">
                  {plan.scenes.map((s) => (
                    <p key={s.id}>
                      <span className="font-bold text-amber-300">[{s.heading}]: </span>
                      {s.narration}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* ABA 3: Texto Completo Bruto (Guardado no Banco/Disco) */}
            {viewTab === 'raw_text' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Base de Conhecimento Bruta:
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {article.paragraphs.length} parágrafos • {article.fullText.length} caracteres
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyRawText}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedRawText ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    <a
                      href={`http://localhost:3001/api/news/article/${article.id}/raw-text`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs text-white font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar .TXT</span>
                    </a>
                  </div>
                </div>

                {/* Campo de Busca dentro do Texto Bruto */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rawSearchQuery}
                    onChange={(e) => setRawSearchQuery(e.target.value)}
                    placeholder="Buscar termo no texto bruto..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Lista de Parágrafos Brutos */}
                <div className="space-y-2 max-h-96 overflow-y-auto p-3 bg-slate-900/40 rounded-lg font-mono text-[11px] text-slate-300">
                  {rawParagraphsFiltered.map((p, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950/80 border border-slate-800/80 leading-relaxed">
                      <span className="text-amber-400/80 font-bold mr-2">#{idx + 1}</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão de Envio para o Player */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Validar Etapa 1: Notícia e Mídias ({plan.targetDurationMinutes} Minutos)
              </div>
              <p className="text-xs text-slate-400">
                Fundo contínuo ({brollChannel}) + Fotos da notícia em cards menores sobrepostos + Avatar na webcam.
              </p>
            </div>

            <button
              type="button"
              onClick={handleApproveAndSendToPlayer}
              disabled={isCompiling}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 shrink-0"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compilando...</span>
                </>
              ) : compileSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Aprovado! Abrindo...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Carregar no Player & Testar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: BUSCAR VÍDEOS GRATUITOS (PEXELS / PIXABAY) */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Banco de Vídeos Gratuitos (Pexels & Pixabay)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchStockVideos()}
                  placeholder="Pesquisar vídeo de fundo (ex: gaming, call of duty, tecnologia, cidade)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchStockVideos}
                disabled={isSearchingStock}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                {isSearchingStock ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </div>

            {/* Resultados de Vídeos */}
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400">
                {stockVideos.length > 0 ? `${stockVideos.length} vídeos gratuitos encontrados:` : 'Nenhum vídeo carregado. Faça uma busca ou cadastre sua chave de API.'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
                {stockVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 hover:border-indigo-500 transition-all flex flex-col"
                  >
                    <div className="aspect-video w-full overflow-hidden relative">
                      <img src={vid.previewUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono">
                        {vid.duration}s
                      </span>
                      <span className="absolute top-1 left-1 text-[9px] bg-indigo-600/90 text-white px-1.5 py-0.5 rounded uppercase font-bold">
                        {vid.source}
                      </span>
                    </div>

                    <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-300 font-semibold line-clamp-1">{vid.title}</div>
                      <button
                        type="button"
                        onClick={() => {
                          setBrollChannel(vid.videoUrl || vid.previewUrl);
                          setShowStockModal(false);
                        }}
                        className="w-full py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all text-center"
                      >
                        Usar Como Fundo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Vídeos 100% gratuitos com licença de uso comercial.</span>
              <button
                type="button"
                onClick={() => {
                  setShowStockModal(false);
                  setShowApiKeysModal(true);
                }}
                className="text-indigo-400 hover:underline font-bold"
              >
                Configurar Chaves Pexels / Pixabay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURAR CHAVES DE API (PEXELS, PIXABAY, HEYGEN, REPLICATE) */}
      {showApiKeysModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Chaves de APIs (Mídia & Lip-Sync)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeysModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cadastre suas chaves para habilitar buscas gratuitas de vídeos de fundo e a renderização do avatar falante. As chaves são guardadas localmente no seu computador.
            </p>

            <div className="space-y-3">
              {/* Pexels API Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Pexels API Key (Vídeos Grátis)</span>
                    {apiKeysStatus.hasPexels && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <a href="https://www.pexels.com/api/" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5">
                    <span>Criar Grátis</span> <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={formKeys.pexelsApiKey}
                  onChange={(e) => setFormKeys({ ...formKeys, pexelsApiKey: e.target.value })}
                  placeholder={apiKeysStatus.keys?.pexelsApiKey || 'Cole sua chave Pexels aqui...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Pixabay API Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Pixabay API Key (Vídeos Grátis)</span>
                    {apiKeysStatus.hasPixabay && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <a href="https://pixabay.com/api/docs/" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5">
                    <span>Criar Grátis</span> <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={formKeys.pixabayApiKey}
                  onChange={(e) => setFormKeys({ ...formKeys, pixabayApiKey: e.target.value })}
                  placeholder={apiKeysStatus.keys?.pixabayApiKey || 'Cole sua chave Pixabay aqui...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* HeyGen API Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>HeyGen API Key (Opção Lip-Sync A)</span>
                    {apiKeysStatus.hasHeygen && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <a href="https://app.heygen.com/settings?nav=API" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5">
                    <span>Painel HeyGen</span> <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={formKeys.heygenApiKey}
                  onChange={(e) => setFormKeys({ ...formKeys, heygenApiKey: e.target.value })}
                  placeholder={apiKeysStatus.keys?.heygenApiKey || 'Cole sua chave HeyGen aqui...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Replicate Token (LatentSync) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Replicate API Token (Opção Lip-Sync B: LatentSync)</span>
                    {apiKeysStatus.hasReplicate && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </label>
                  <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5">
                    <span>Tokens Replicate</span> <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={formKeys.replicateApiToken}
                  onChange={(e) => setFormKeys({ ...formKeys, replicateApiToken: e.target.value })}
                  placeholder={apiKeysStatus.keys?.replicateApiToken || 'r8_...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {saveKeysSuccess ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Chaves salvas com sucesso!
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Salvo em storage/api_keys.json</span>
              )}

              <button
                type="button"
                onClick={handleSaveApiKeys}
                disabled={isSavingKeys}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
              >
                {isSavingKeys ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Salvar Chaves</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
