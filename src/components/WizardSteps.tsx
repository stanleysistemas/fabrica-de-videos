import React from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Check, Sparkles, Sliders, Palette, FolderUp, Volume2, FileVideo } from 'lucide-react';

export const WizardSteps: React.FC = () => {
  const { project, setStep } = useProjectStore();

  const steps = [
    { number: 1, title: 'Objetivo & Visão', icon: Sparkles },
    { number: 2, title: 'Formato & Duração', icon: Sliders },
    { number: 3, title: 'Brand Kit & Estilo', icon: Palette },
    { number: 4, title: 'Seus Ativos', icon: FolderUp },
    { number: 5, title: 'Áudio & Legendas', icon: Volume2 },
    { number: 6, title: 'Storyboard & QA', icon: FileVideo },
  ];

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 py-1">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = project.currentStep > s.number;
          const isCurrent = project.currentStep === s.number;

          return (
            <button
              key={s.number}
              onClick={() => setStep(s.number)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isCurrent
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : isDone
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.number}
              </div>
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
