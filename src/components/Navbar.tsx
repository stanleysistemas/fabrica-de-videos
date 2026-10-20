import React from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { AspectRatio } from '../types';
import { Sparkles, Smartphone, Monitor, Square, Video } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { project, setAspectRatio } = useProjectStore();

  const formats: { id: AspectRatio; label: string; icon: React.ReactNode }[] = [
    { id: '9:16', label: 'Vertical 9:16 (Shorts/TikTok)', icon: <Smartphone className="w-4 h-4" /> },
    { id: '16:9', label: 'Horizontal 16:9 (YouTube)', icon: <Monitor className="w-4 h-4" /> },
    { id: '1:1', label: 'Quadrado 1:1 (Feed/Ads)', icon: <Square className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#080b11]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Video className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                SaaS Video Factory
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">Fábrica de Vídeos Inteligente com Visão & Remotion</p>
          </div>
        </div>

        {/* Seletor Rápido de Formato */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {formats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setAspectRatio(fmt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                project.aspectRatio === fmt.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {fmt.icon}
              <span className="hidden md:inline">{fmt.id}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Engenharia Reversa Ativa</span>
          </div>
        </div>
      </div>
    </header>
  );
};
