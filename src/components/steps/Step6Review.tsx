import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { FileVideo, CheckCircle2, Play, RefreshCw, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';

export const Step6Review: React.FC = () => {
  const { project, prevStep, updateScene } = useProjectStore();
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [qaStatus, setQaStatus] = useState<'idle' | 'extracting_stills' | 'inspecting' | 'approved'>('idle');

  const startRender = () => {
    setIsRendering(true);
    setRenderProgress(10);
    setQaStatus('idle');

    // Simulação do pipeline com os checkpoints do QA
    setTimeout(() => {
      setRenderProgress(45);
      setQaStatus('extracting_stills');
    }, 1500);

    setTimeout(() => {
      setRenderProgress(80);
      setQaStatus('inspecting');
    }, 3000);

    setTimeout(() => {
      setRenderProgress(100);
      setQaStatus('approved');
      setIsRendering(false);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileVideo className="w-5 h-5 text-indigo-400" />
          Etapa 6: Aprovação do Storyboard & Auto-Inspeção Visual (QA)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Revise cada cena antes de gerar o arquivo final. O sistema inspecionará os frames automaticamente com FFmpeg.
        </p>
      </div>

      {/* Lista de Cenas / Storyboard */}
      <div className="space-y-3">
        {project.scenes.map((scene, idx) => (
          <div key={scene.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/20">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Cena {idx + 1}: {scene.type.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850">
                {scene.durationInSeconds} segundos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Texto na Tela:</span>
                <input
                  type="text"
                  value={scene.title || scene.statValue || scene.terminalCommand || ''}
                  onChange={(e) => updateScene(idx, { title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Locução / Narração da Cena:</span>
                <input
                  type="text"
                  value={scene.narration}
                  onChange={(e) => updateScene(idx, { narration: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Painel de Status do Render e QA Visual */}
      {isRendering && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Processando Linha de Montagem...
            </span>
            <span>{renderProgress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {qaStatus === 'extracting_stills' && (
              <span>📸 FFmpeg extraindo 3 fotos de cada cena para inspeção de frames...</span>
            )}
            {qaStatus === 'inspecting' && (
              <span>🔍 Agente de Visão auditando safe zones, cortes de texto e contraste...</span>
            )}
          </div>
        </div>
      )}

      {/* Sucesso do QA */}
      {qaStatus === 'approved' && !isRendering && (
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            Auto-Inspeção Visual Aprovada com Sucesso! (0 Erros)
          </div>
          <p className="text-slate-300 leading-relaxed">
            Nenhum texto colidiu com a safe zone do {project.aspectRatio === '9:16' ? 'TikTok/Reels' : 'YouTube'}. O vídeo final está pronto para download em 60 FPS com H.264.
          </p>
          <div className="pt-2 flex gap-3">
            <a
              href="#download"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              Baixar MP4 Pronto
            </a>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
        <button
          onClick={prevStep}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          onClick={startRender}
          disabled={isRendering}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isRendering ? 'Renderizando e Inspecionando...' : 'Aprovar Storyboard & Renderizar MP4'}</span>
        </button>
      </div>
    </div>
  );
};
