import React, { useState } from 'react';
import { UserCheck, Sparkles, Mic, Play, Plus, Video, ShieldCheck, Settings2, Sliders } from 'lucide-react';

export const AvatarStudioView: React.FC = () => {
  const [activeEngine, setActiveEngine] = useState<'local_liveportrait' | 'heygen_cloud'>('local_liveportrait');

  const avatares = [
    {
      id: 'avatar_gamer_stanley',
      name: 'Stanley Gamer (Apresentador Oficial)',
      role: 'Canal de Games, Notícias e Call of Duty',
      voiceLinked: 'Minha Voz Oficial (Clonada - VoiceStudio)',
      status: 'Ativo & Calibrado',
      avatarType: 'Streamer Masculino com Barba Grisalha em Estúdio RGB',
      previewImg: 'avatar_sample',
    },
    {
      id: 'avatar_tech_elena',
      name: 'Elena Tech (Analista de Hardware)',
      role: 'Curiosidades de Tecnologia e Reviews Rápidos',
      voiceLinked: 'Elena Tech (Dinâmica - VoiceStudio)',
      status: 'Pronto para Uso',
      avatarType: 'Apresentadora Moderna com Fone de Ouvido',
      previewImg: 'avatar_elena',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Avatar Studio & Lip-Sync
            </span>
            <span className="text-xs text-slate-400">• Clone de Estúdio Estilo HeyGen</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Seus Apresentadores Virtuais</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Crie avatares a partir de fotos de alta resolução com animação labial e gestos naturais. Intercale entre tela cheia e webcam no canto da tela nos seus vídeos de gameplay e notícias.
          </p>
        </div>

        <button
          type="button"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Avatar</span>
        </button>
      </div>

      {/* Seletor de Motor de Animação do Avatar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="font-bold text-xs text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            Motor de Animação Labial (Lip-Sync)
          </div>
          <p className="text-[11px] text-slate-400">Escolha entre processar 100% gratuito localmente ou via API HeyGen</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveEngine('local_liveportrait')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeEngine === 'local_liveportrait'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Motor Local (LivePortrait / Custo $0)
          </button>
          <button
            type="button"
            onClick={() => setActiveEngine('heygen_cloud')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeEngine === 'heygen_cloud'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HeyGen Cloud API
          </button>
        </div>
      </div>

      {/* Grid de Avatares Cadastrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {avatares.map((avatar) => (
          <div
            key={avatar.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <UserCheck className="w-8 h-8 text-amber-400" />
                <span className="absolute bottom-1 z-20 text-[9px] font-mono font-bold text-amber-300">
                  STREAMER
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-white truncate">{avatar.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {avatar.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{avatar.role}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-400 bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  <Mic className="w-3.5 h-3.5" />
                  <span className="truncate">{avatar.voiceLinked}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Cenário e Visual:</span>
              {avatar.avatarType}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Configurar Poses</span>
              </button>

              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Testar Fala</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
