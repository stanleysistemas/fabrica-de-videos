import React, { useState } from 'react';
import { Newspaper, Sparkles, Link, CheckCircle2, ArrowRight, Image as ImageIcon, Video, ShieldAlert } from 'lucide-react';

export const NewsToVideoView: React.FC = () => {
  const [url, setUrl] = useState(
    'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class'
  );
  const [styleMode, setStyleMode] = useState<'gamer_streamer' | 'tech_news' | 'documentary'>('gamer_streamer');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner de Boas-Vindas do Módulo */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo de Alta Produtividade
            </span>
            <span className="text-xs text-slate-400">• Próxima Entrega da Fábrica</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Notícia & Artigo para Vídeo (URL to Video)</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Insira o link de um blog, portal de notícias ou artigo oficial. O sistema extrai as fotos em alta resolução, monta o roteiro com gancho viral, aguarda a sua aprovação e anima tudo em 1080p.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Fluxo Garantido</div>
          <div className="text-emerald-400 font-extrabold text-sm mt-0.5">100% com Sua Aprovação</div>
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
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 pr-32 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all font-mono"
          />
          <button
            type="button"
            className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Raspar & Extrair</span>
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

      {/* Preview de Demonstração do Pipeline de Extração */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          Como o Sistema Montará o Vídeo com as Fotos do Artigo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-full h-28 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
              [Foto HD: Novos Operadores]
            </div>
            <div className="font-bold text-xs text-white">1. Efeito Ken Burns Automático</div>
            <p className="text-[11px] text-slate-400">
              A imagem não fica estática. Recebe zoom suave de entrada e transição de corte no tempo da narração.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-full h-28 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
              [Foto HD: Armas e Armeiro]
            </div>
            <div className="font-bold text-xs text-white">2. Painel de Aprovação</div>
            <p className="text-[11px] text-slate-400">
              Você seleciona quais fotos entram no vídeo final e edita qualquer parágrafo do roteiro gerado.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-full h-28 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
              [Webcam: Avatar Gamer]
            </div>
            <div className="font-bold text-xs text-white">3. Avatar na Webcam</div>
            <p className="text-[11px] text-slate-400">
              O apresentador narra com a voz do canal em sincronia enquanto as imagens da matéria rodam ao fundo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
