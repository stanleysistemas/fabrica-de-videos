import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { Search, Eye, Sparkles, Video, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export const Step1Topic: React.FC = () => {
  const { project, setTopic, setReferenceUrl, nextStep } = useProjectStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [blueprintResult, setBlueprintResult] = useState<any>(null);

  const handleAnalyzeVideo = async () => {
    if (!project.referenceUrl) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeVideo(project.referenceUrl);
      if (res.success && res.blueprint) {
        setBlueprintResult(res.blueprint);

        // Gera automaticamente o roteiro com base no blueprint
        const scriptRes = await api.generateScript({
          topic: project.topic || 'Automação de Vídeos com IA',
          targetDurationSeconds: project.targetDurationSeconds,
          styleClima: project.styleClima,
          blueprint: res.blueprint,
          brandName: project.brand.name,
        });

        if (scriptRes.success && scriptRes.script) {
          useProjectStore.setState((state) => ({
            project: { ...state.project, scenes: scriptRes.script.scenes },
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Etapa 1: Objetivo & Vídeo de Referência
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Diga sobre o que é o vídeo ou forneça um link do YouTube para o sistema "assistir" visualmente.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Sobre o que é o vídeo (Tema Principal) *
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={project.topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Como criar uma esteira de automação com IA para faturar no YouTube em 2026..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-indigo-400" />
              Engenharia Reversa Visual (Assistir Vídeo de Referência)
            </div>
            {isAnalyzing && (
              <span className="text-[11px] font-semibold text-indigo-400 animate-pulse">
                Processando frames segundo a segundo...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            O Gemini Vision assistirá ao vídeo segundo a segundo (quadro a quadro + áudio), mapeando cortes, B-rolls e ganchos visuais para gerar um roteiro autoral de alta retenção.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <svg className="w-4 h-4 text-red-500 absolute left-3.5 pointer-events-none fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <input
                type="text"
                value={project.referenceUrl || ''}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAnalyzeVideo}
              disabled={isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Analisando...' : 'Dissecar Vídeo'}</span>
            </button>
          </div>

          {blueprintResult && (
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5 animate-fadeIn">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>✔ Blueprint Extraído com Sucesso!</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono">
                  Score de Retenção: {blueprintResult.estimatedRetentionScore}/100
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Ritmo detectado: <strong className="text-white">{blueprintResult.detectedPacing}</strong> com cortes médios a cada <strong className="text-white">{blueprintResult.averageCutDurationSeconds}s</strong>. O roteiro autoral foi gerado e preenchido na timeline!
              </p>
            </div>
          )}
        </div>

        {/* Sugestões de Nicho em Alta */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Ou explore temas que mais viralizam no nicho:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              '3 Ferramentas de IA Pouco Conhecidas',
              'O Fim do CapCut e Premiere?',
              'Como Ganhar em Dólar com Shorts Faceless',
              'O Mistério Revelado em 60 Segundos'
            ].map((sug) => (
              <button
                key={sug}
                onClick={() => setTopic(sug)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-indigo-400" />
                {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={nextStep}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <span>Próxima Etapa: Formato & Duração</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
