import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Layers, Sliders, Type, Download, Wand2 } from 'lucide-react';

export const ThumbnailMakerView: React.FC = () => {
  const [titleText, setTitleText] = useState('CALL OF DUTY MW4: DETALHES REVELADOS!');
  const [rimLightColor, setRimLightColor] = useState<'cyan' | 'yellow' | 'magenta' | 'green'>('cyan');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Estúdio de Thumbnails
            </span>
            <span className="text-xs text-slate-400">• Otimizado para Alta Taxa de Cliques (CTR)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Criador Automático de Capas Virais</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Recorte inteligente do seu avatar, fundos cinemáticos com desfoque, efeito de luz de contorno (Rim Light) e textos garrafais irresistíveis.
          </p>
        </div>

        <button
          type="button"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
        >
          <Wand2 className="w-4 h-4" />
          <span>Gerar Variações com IA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controles de Customização da Thumb */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-purple-400" />
              Texto Principal da Capa
            </label>
            <textarea
              rows={2}
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white uppercase font-black focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Luz de Contorno no Avatar (Rim Light)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cyan', label: 'Ciano', color: 'bg-cyan-500' },
                { id: 'yellow', label: 'Amarelo', color: 'bg-amber-400' },
                { id: 'magenta', label: 'Magenta', color: 'bg-fuchsia-500' },
                { id: 'green', label: 'Verde', color: 'bg-emerald-500' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setRimLightColor(c.id as any)}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    rimLightColor === c.id
                      ? 'border-purple-500 bg-purple-950/40 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                  <span className="text-[10px]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-300 block">Camadas Automáticas:</span>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>1. Fundo do Jogo / Matéria:</span>
                <span className="text-emerald-400 font-semibold">Ativo (Blur 15px)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>2. Avatar Recortado:</span>
                <span className="text-emerald-400 font-semibold">Stanley Gamer</span>
              </div>
              <div className="flex items-center justify-between">
                <span>3. Tipografia YouTube 3D:</span>
                <span className="text-purple-400 font-semibold">Alto Contraste</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview da Thumbnail em 16:9 */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              Preview da Capa em Alta Resolução (1280x720)
            </span>
            <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
              16:9 • YouTube
            </span>
          </div>

          <div className="relative aspect-video rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,50,255,0.15),transparent)]" />
            
            {/* Texto da Capa Estilizado */}
            <div className="relative z-10 max-w-sm">
              <h1 className="font-black text-2xl md:text-3xl tracking-tighter uppercase text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none">
                {titleText}
              </h1>
              <span className="inline-block mt-3 bg-red-600 text-white font-extrabold text-[11px] px-3 py-1 rounded shadow-lg uppercase tracking-wider">
                OFICIAL
              </span>
            </div>

            {/* Avatar no Canto com Efeito Rim Light */}
            <div className="absolute right-4 bottom-0 z-20 flex flex-col items-center">
              <div className="w-36 h-48 rounded-t-2xl bg-slate-950 border-t-2 border-l-2 border-cyan-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <span className="text-[10px] font-bold text-cyan-300 text-center px-2">
                  [Avatar do Streamer Recortado]
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Thumbnail PNG (1080p)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
