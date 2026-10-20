import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { AspectRatio } from '../../types';
import { Smartphone, Monitor, Square, Clock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export const Step2Format: React.FC = () => {
  const { project, setAspectRatio, setDuration, setDurationMode, nextStep, prevStep } = useProjectStore();

  const formats: { id: AspectRatio; title: string; desc: string; icon: React.ReactNode; ideal: string }[] = [
    {
      id: '9:16',
      title: 'Vertical (9:16)',
      desc: '1080 x 1920 px',
      ideal: 'Reels, TikTok, YouTube Shorts',
      icon: <Smartphone className="w-6 h-6 text-indigo-400" />,
    },
    {
      id: '16:9',
      title: 'Horizontal (16:9)',
      desc: '1920 x 1080 px',
      ideal: 'YouTube Clássico, Cursos, Desktop',
      icon: <Monitor className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: '1:1',
      title: 'Quadrado (1:1)',
      desc: '1080 x 1080 px',
      ideal: 'Feed do Instagram, LinkedIn, Anúncios',
      icon: <Square className="w-6 h-6 text-purple-400" />,
    },
  ];

  const durations = [
    { label: '30s (Ultra Rápido)', value: 30, buffer: '+5s de margem' },
    { label: '60s (Padrão Shorts)', value: 60, buffer: '+10s de margem' },
    { label: '90s (Aprofundado)', value: 90, buffer: '+15s de margem' },
    { label: '3 min (Explicativo)', value: 180, buffer: '+25s de margem' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Etapa 2: Formato da Tela & Duração
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Escolha a proporção de tela e a duração ideal para a sua audiência.
        </p>
      </div>

      {/* Grid de Formatos */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Proporção da Tela *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {formats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setAspectRatio(fmt.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                project.aspectRatio === fmt.id
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                {fmt.icon}
                <span className="text-xs font-mono text-slate-400">{fmt.desc}</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">{fmt.title}</h3>
              <p className="text-xs text-slate-400">{fmt.ideal}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Controle Inteligente de Duração Vinculada à Mídia de Origem */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Governança de Duração da Mídia
          </label>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            Arquivo de Origem: {project.sourceDurationSeconds || 18}s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDurationMode('source_exact')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              project.durationMode === 'source_exact'
                ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-white flex items-center justify-between mb-1">
              <span>Preservar Mídia Original (100%)</span>
              {project.durationMode === 'source_exact' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O tempo do vídeo final é exatamente o tempo do seu arquivo de origem ({project.sourceDurationSeconds || 18}s). Mudar para 9:16 ou 16:9 apenas ajusta o enquadramento.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setDurationMode('custom_cut')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              project.durationMode === 'custom_cut'
                ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs text-white flex items-center justify-between mb-1">
              <span>Corte Viral / Resumo (Custom)</span>
              {project.durationMode === 'custom_cut' && (
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Extrai um trecho específico ou limita o vídeo a uma minutagem pré-determinada (30s, 60s, 90s).
            </p>
          </button>
        </div>

        {project.durationMode === 'custom_cut' && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Escolha a minutagem do corte:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {durations.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setDuration(dur.value)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    project.targetDurationSeconds === dur.value
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{dur.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alerta de Enquadramento */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Reenquadramento Inteligente:</span> Ao alternar entre <strong className="text-white">Vertical (9:16)</strong> e <strong className="text-white">Horizontal (16:9)</strong>, a duração não sofre corte artificial. O sistema apenas reposiciona os elementos, amplia safe zones e ajusta o fundo com blur ou zoom responsivo.
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
          <span>Próxima Etapa: Brand Kit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
