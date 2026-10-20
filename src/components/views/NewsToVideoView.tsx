import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { 
  Newspaper, Sparkles, Link, CheckCircle2, ArrowRight, Image as ImageIcon, 
  Video, RefreshCw, Check, Edit3, Play, Trash2, ShieldCheck, Clock, FileText, Gamepad2, Sliders
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
  type: 'ken_burns_news' | 'avatar_intro' | 'avatar_outro' | 'gameplay_broll';
  heading: string;
  narration: string;
  durationInSeconds: number;
  associatedImageId?: string;
  associatedImageUrl?: string;
  kenBurnsEffect: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode: 'full_image' | 'webcam_streamer' | 'gameplay_with_webcam';
}

interface NewsVideoPlan {
  id: string;
  articleId: string;
  title: string;
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
  const { setScenes } = useProjectStore();
  const { setCurrentModule } = useNavigationStore();

  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [styleMode, setStyleMode] = useState<'gamer_streamer' | 'tech_news' | 'documentary'>('gamer_streamer');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5);
  const [brollChannel, setBrollChannel] = useState<string>('@stanleyalvesbr');
  const [viewTab, setViewTab] = useState<'scenes_editor' | 'full_script'>('scenes_editor');

  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState<ScrapedArticle | null>(null);
  const [plan, setPlan] = useState<NewsVideoPlan | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  // Dispara o scraper no backend com o tempo definido
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
          brollChannel 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.article && data.plan) {
          setArticle(data.article);
          setPlan(data.plan);
          // Por padrão seleciona todas as imagens encontradas
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

  const totalWords = plan?.scenes.reduce((acc, s) => acc + s.narration.split(/\s+/).length, 0) || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo Estilo Hayashii
            </span>
            <span className="text-xs text-slate-400">• Vídeos de 1 a 15 Minutos</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Criar Vídeo por Notícia com Gameplay e Avatar</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Escolha o tempo do vídeo (até 15 min), a live de fundo do canal @stanleyalvesbr e o link da matéria. O sistema extrai todas as armas e operadores, gera o roteiro completo e compila no Remotion com seu avatar narrando na webcam.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Duração Máxima</div>
          <div className="text-emerald-400 font-extrabold text-base mt-0.5">Até 15 Minutos</div>
        </div>
      </div>

      {/* Painel de Configuração Inicial (Duração, Gameplay e Link) */}
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

          {/* Slider fino de 1 a 15 min */}
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

        {/* 2. B-ROLL / GAMEPLAY DE FUNDO (Canal @stanleyalvesbr) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            2. Gameplay de Fundo (Vídeo de Live do seu Canal):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Canal YouTube: @stanleyalvesbr</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Lives de Call of Duty / Gameplay sem áudio</span>
              </div>
              <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                0% Copyright
              </span>
            </div>

            <div>
              <input
                type="text"
                value={brollChannel}
                onChange={(e) => setBrollChannel(e.target.value)}
                placeholder="Ex: @stanleyalvesbr ou link da live"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. LINK DA MATÉRIA */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-2">
            <Link className="w-4 h-4 text-emerald-400" />
            3. Link da Matéria / Post Oficial:
          </label>

          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole aqui o link do blog ou notícia..."
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
                  <span>Extraindo ({targetDurationMinutes} min)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Raspar & Roteirizar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE APROVAÇÃO DO DIRETOR */}
      {article && plan && (
        <div className="space-y-6 animate-fadeIn">
          {/* Resumo da Matéria */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                Fonte: {article.siteName}
              </span>
              <span className="text-[11px] text-slate-400">
                {article.images.length} fotos encontradas • Roteiro dimensionado para {plan.targetDurationMinutes} min
              </span>
            </div>
            <h3 className="font-black text-lg text-white leading-tight">{article.title}</h3>
            <p className="text-xs text-slate-300">{article.description}</p>
          </div>

          {/* Galeria de Fotos Completas Extraídas da Matéria */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Todas as Fotos da Matéria ({article.images.length} encontradas):
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">
                {selectedImageIds.length} selecionadas para intercalar com a gameplay
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-1">
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

          {/* Abas: Editor de Cenas vs Teleprompter Texto Corrido */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
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
              </div>

              <div className="text-[11px] font-mono text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
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
                          {scene.type === 'gameplay_broll' ? 'Gameplay Live' : scene.kenBurnsEffect}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white uppercase tracking-wider">
                          Cena {scene.order}: {scene.heading}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {scene.durationInSeconds}s • {scene.type === 'gameplay_broll' ? 'Gameplay @stanleyalvesbr' : 'Foto Ken Burns'}
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
                  <span>Texto integral da narração do apresentador:</span>
                  <span className="text-emerald-400">{totalWords} palavras estimadas</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed space-y-3 max-h-96 overflow-y-auto font-sans p-2 bg-slate-900/60 rounded-lg">
                  {plan.scenes.map((s) => (
                    <p key={s.id}>
                      <span className="font-bold text-amber-300">[{s.heading}]: </span>
                      {s.narration}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão de Aprovação Final e Envio para o Player */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Aprovar Roteiro e Fotos ({plan.targetDurationMinutes} Minutos)
              </div>
              <p className="text-xs text-slate-400">
                O Remotion compilará a gameplay de fundo do canal @stanleyalvesbr com os cortes das fotos e o seu avatar na webcam.
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
                  <span>Montando {plan.targetDurationMinutes} min no Player...</span>
                </>
              ) : compileSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Aprovado! Abrindo Vídeo...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Aprovar & Gerar Vídeo Completo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
