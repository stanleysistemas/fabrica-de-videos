import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { SubtitleStyle } from '../../types';
import { Volume2, Mic, Music, Subtitles, ArrowRight, ArrowLeft } from 'lucide-react';

export const Step5Audio: React.FC = () => {
  const { project, setSubtitleStyle, nextStep, prevStep } = useProjectStore();

  const subtitleStyles: { id: SubtitleStyle; title: string; desc: string; preview: string }[] = [
    {
      id: 'pilula',
      title: 'Estilo Pílula (Dinâmico)',
      desc: 'Fundo arredondado translúcido, perfeito para alta retenção no TikTok e Reels.',
      preview: 'VOCÊ SABIA DISSO?',
    },
    {
      id: 'karaoke',
      title: 'Estilo Karaokê (Palavra a Palavra)',
      desc: 'A cor muda exatamente na sílaba que o locutor pronuncia.',
      preview: 'Descubra o segredo',
    },
    {
      id: 'caixa',
      title: 'Estilo Caixa (Alto Contraste)',
      desc: 'Container preto sólido clássico para YouTube e vídeos explicativos.',
      preview: 'RESULTADOS REAIS',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          Etapa 5: Áudio, Voz & Legendas Inteligentes
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Selecione o motor de voz (local e gratuito via VoiceStudio ou neural) e o design das legendas.
        </p>
      </div>

      {/* Seletor de Voz */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Mic className="w-4 h-4 text-emerald-400" />
            Motor de Voz & Locução
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            VoiceStudio Integrado (Zero Custo por Minuto)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500 text-left transition-all">
            <div className="font-bold text-xs text-white">Locutor Documentário (Grave & Misterioso)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Voz local OmniVoice - Ideal para estilo VOX</div>
          </button>
          <button className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-slate-700 transition-all">
            <div className="font-bold text-xs text-white">Locutora Dinâmica (Energética & Clara)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Edge-TTS Neural - Ideal para Shorts e Demos</div>
          </button>
        </div>
      </div>

      {/* Música com Auto-Ducking */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">Trilha Sonora com Auto-Ducking (FFmpeg)</div>
            <div className="text-[11px] text-slate-400">
              O volume da música abaixa suavemente de forma automática quando a voz fala.
            </div>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Ativado (12%)
        </span>
      </div>

      {/* Estilos de Legendas */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Subtitles className="w-4 h-4 text-indigo-400" />
          Estilo de Legenda Inteligente (Com Safe Zone Automática)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {subtitleStyles.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSubtitleStyle(sub.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                project.audio.subtitleStyle === sub.id
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-white mb-1">{sub.title}</div>
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{sub.desc}</p>
              <div className="p-2 rounded-lg bg-black/60 text-center text-xs font-bold text-indigo-300 font-mono">
                "{sub.preview}"
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-between">
        <button
          onClick={prevStep}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={nextStep}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <span>Próxima Etapa: Storyboard & QA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
