import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { 
  Newspaper, Sparkles, Link, CheckCircle2, ArrowRight, Image as ImageIcon, 
  Video, RefreshCw, Check, Edit3, Play, Trash2, ShieldCheck, Eye
} from 'lucide-react';

interface ScrapedImage {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
}

interface NewsSceneDraft {
  id: string;
  order: number;
  type: 'ken_burns_news' | 'avatar_intro' | 'avatar_outro';
  heading: string;
  narration: string;
  durationInSeconds: number;
  associatedImageId?: string;
  associatedImageUrl?: string;
  kenBurnsEffect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode: 'full_image' | 'webcam_streamer';
}

interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
  totalDurationSeconds: number;
  scenes: NewsSceneDraft[];
  suggestedVoiceId: string;
  styleMode: 'gamer_streamer' | 'tech_news' | 'documentary';
}

interface ScrapedArticle {
  id: string;
  sourceUrl: string;
  siteName: string;
  title: string;
  description: string;
  paragraphs: string[];
  images: ScrapedImage[];
}

export const NewsToVideoView: React.FC = () => {
  const { setScenes, project } = useProjectStore();
  const { setCurrentModule } = useNavigationStore();

  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [styleMode, setStyleMode] = useState<'gamer_streamer' | 'tech_news' | 'documentary'>('gamer_streamer');
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<ScrapedArticle | null>(null);
  const [plan, setPlan] = useState<NewsVideoPlan | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  // Dispara o scraper no backend
  const handleScrape = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/news/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, styleMode }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.article && data.plan) {
          setArticle(data.article);
          setPlan(data.plan);
          // Por padrão seleciona todas as imagens
          setSelectedImageIds(data.article.images.map((img: ScrapedImage) => img.id));
        }
      }
    } catch (err) {
      console.error('[NewsToVideo] Erro ao raspar matéria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar seleção de imagem
  const toggleImageSelection = (imgId: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]
    );
  };

  // Atualizar narração de uma cena específica
  const handleNarrationChange = (sceneId: string, newNarration: string) => {
    if (!plan) return;
    const updatedScenes = plan.scenes.map((sc) => {
      if (sc.id === sceneId) {
        // Recalcular duração com margem de +15%
        const words = newNarration.split(/\s+/).length;
        const dur = Math.max(3, Math.round((words / 2.5) * 1.15));
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

    // Mapear cenas do plano para as cenas oficiais do projeto Remotion
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
        // Redireciona para o módulo do player viral para ver o vídeo pronto
        setCurrentModule('viral_video');
      }, 1000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo de Alta Velocidade
            </span>
            <span className="text-xs text-slate-400">• Notícia / Blog URL to Video</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Criar Vídeo a partir de Notícia ou Artigo</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Insira o link do blog ou matéria. O sistema raspa os textos e imagens HD, cria o roteiro com gancho viral, aguarda sua aprovação e anima tudo em 1080p com efeito Ken Burns.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Controle Humano</div>
          <div className="text-emerald-400 font-extrabold text-sm mt-0.5 flex items-center gap-1 justify-center">
            <ShieldCheck className="w-4 h-4" />
            <span>Sua Autorização Sempre</span>
          </div>
        </div>
      </div>

      {/* Caixa de Entrada da URL da Notícia */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Link className="w-4 h-4 text-emerald-400" />
          Link da Matéria / Post Oficial
        </label>

        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Cole aqui o link do blog ou notícia (ex: Call of Duty, G1, IGN, TechCrunch...)"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 pr-36 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all font-mono"
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
                <span>Raspando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Raspar & Extrair</span>
              </>
            )}
          </button>
        </div>

        {/* Escolha do Estilo Editorial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStyleMode('gamer_streamer')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              styleMode === 'gamer_streamer'
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-white flex items-center justify-between">
              <span>🎮 Streamer Gamer</span>
              {styleMode === 'gamer_streamer' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Reação com avatar gamer na webcam, animação das fotos das armas/mapas e ritmo dinâmico.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStyleMode('tech_news')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              styleMode === 'tech_news'
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-white flex items-center justify-between">
              <span>⚡ Jornalístico / Tech</span>
              {styleMode === 'tech_news' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tom direto, foco nos fatos, dados em destaque e cortes elegantes com gráficos.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStyleMode('documentary')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              styleMode === 'documentary'
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-white flex items-center justify-between">
              <span>📜 Documentário / VOX</span>
              {styleMode === 'documentary' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Efeitos de papel, textura de fita adesiva, zoom lento 2.5D e sound design ASMR.
            </p>
          </button>
        </div>
      </div>

      {/* PAINEL DE APROVAÇÃO DO DIRETOR (Aparece quando a matéria foi raspada) */}
      {article && plan && (
        <div className="space-y-6 animate-fadeIn">
          {/* Cabeçalho da Matéria Extraída */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                Fonte: {article.siteName}
              </span>
              <span className="text-[11px] text-slate-400">
                {article.images.length} fotos encontradas • {article.paragraphs.length} parágrafos
              </span>
            </div>
            <h3 className="font-black text-lg text-white leading-tight">{article.title}</h3>
            <p className="text-xs text-slate-300">{article.description}</p>
          </div>

          {/* Galeria de Fotos Extraídas com Checkbox de Aprovação */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Fotos Extraídas da Matéria (Selecione quais entram no vídeo):
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">
                {selectedImageIds.length} de {article.images.length} selecionadas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {article.images.map((img) => {
                const isSelected = selectedImageIds.includes(img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggleImageSelection(img.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all group aspect-video ${
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
                      className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSelected ? 'bg-emerald-500 text-black' : 'bg-black/70 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roteiro Gerado com Edição Direta Cena a Cena */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Roteiro do Diretor IA (Você pode editar qualquer fala):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800 text-amber-300">
                  Duração Estimada: {plan.totalDurationSeconds}s (+15% margem)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {plan.scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-4 items-start hover:border-slate-700 transition-all"
                >
                  {/* Foto Associada à Cena */}
                  {scene.associatedImageUrl && (
                    <div className="w-full sm:w-36 aspect-video rounded-lg overflow-hidden border border-slate-800 shrink-0 relative">
                      <img
                        src={scene.associatedImageUrl}
                        alt={scene.heading}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.2 rounded uppercase">
                        {scene.kenBurnsEffect}
                      </span>
                    </div>
                  )}

                  {/* Detalhes e Caixa de Edição da Fala */}
                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        Cena {scene.order}: {scene.heading}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {scene.durationInSeconds} segundos • {scene.layoutMode === 'webcam_streamer' ? 'Webcam Streamer' : 'Full Screen'}
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
          </div>

          {/* Botão de Ação: Autorização Humana & Compilação para o Player */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Tudo revisado e pronto para renderizar?
              </div>
              <p className="text-xs text-slate-400">
                O sistema montará o vídeo final em alta definição no player com o efeito Ken Burns nas fotos e a voz do canal.
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
                  <span>Montando no Player Remotion...</span>
                </>
              ) : compileSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Vídeo Aprovado! Abrindo Player...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Aprovar & Gerar Vídeo no Player</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
