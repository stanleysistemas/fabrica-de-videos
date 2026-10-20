import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { VideoStyleClima } from '../../types';
import { Palette, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export const Step3Brand: React.FC = () => {
  const { project, setStyleClima, setBrandColors, nextStep, prevStep } = useProjectStore();

  const styles: { id: VideoStyleClima; title: string; desc: string; badge: string }[] = [
    {
      id: 'tecnologico',
      title: 'Tecnológico & SaaS',
      desc: 'Telas com terminal sintético, cards de dados e visual escuro futurista.',
      badge: 'Ideal para B2B e Apps',
    },
    {
      id: 'documentario_vox',
      title: 'Estilo VOX / Papercut',
      desc: 'Colagens de papel, fotos históricas recortadas e som ASMR.',
      badge: 'Alta Retenção',
    },
    {
      id: 'energetico',
      title: 'Viral & Dinâmico',
      desc: 'Cortes rápidos a cada 3s, zoom contínuo e legendas em caixa alta com destaque.',
      badge: 'Shorts & TikTok',
    },
    {
      id: 'minimalista',
      title: 'Minimalista & Clean',
      desc: 'Tipografia ampla, espaços vazios elegantes e paleta suave.',
      badge: 'Educação & Negócios',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          Etapa 3: Estilo Visual & Brand Kit
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Defina o clima estético do vídeo e as cores oficiais da sua marca.
        </p>
      </div>

      {/* Grid de Estilos */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Estilo e Clima do Vídeo *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {styles.map((st) => (
            <button
              key={st.id}
              onClick={() => setStyleClima(st.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                project.styleClima === st.id
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-white">{st.title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {st.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cores da Marca */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Cores da Sua Marca (Paleta Ativa)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">Cor Primária (Destaques e Títulos)</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.brand.primaryColor}
                onChange={(e) => setBrandColors(e.target.value, project.brand.secondaryColor)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={project.brand.primaryColor}
                onChange={(e) => setBrandColors(e.target.value, project.brand.secondaryColor)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white w-24"
              />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">Cor Secundária (Métricas e Sucesso)</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.brand.secondaryColor}
                onChange={(e) => setBrandColors(project.brand.primaryColor, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={project.brand.secondaryColor}
                onChange={(e) => setBrandColors(project.brand.primaryColor, e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white w-24"
              />
            </div>
          </div>
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
          <span>Próxima Etapa: Seus Ativos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
