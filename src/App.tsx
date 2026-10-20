import React from 'react';
import { Player } from '@remotion/player';
import { useProjectStore } from './stores/useProjectStore';
import { VideoComposition } from './remotion/VideoComposition';
import { Navbar } from './components/Navbar';
import { WizardSteps } from './components/WizardSteps';
import { Step1Topic } from './components/steps/Step1Topic';
import { Step2Format } from './components/steps/Step2Format';
import { Step3Brand } from './components/steps/Step3Brand';
import { Step4Assets } from './components/steps/Step4Assets';
import { Step5Audio } from './components/steps/Step5Audio';
import { Step6Review } from './components/steps/Step6Review';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { VoiceLabModal } from './components/VoiceLabModal';
import { PlayCircle, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export function App() {
  const { project } = useProjectStore();

  // Cálculo dinâmico das dimensões do Player Remotion conforme a proporção escolhida
  const isVertical = project.aspectRatio === '9:16';
  const isSquare = project.aspectRatio === '1:1';

  const compositionWidth = isVertical ? 1080 : isSquare ? 1080 : 1920;
  const compositionHeight = isVertical ? 1920 : isSquare ? 1080 : 1080;

  // Duração total em frames (30 FPS para preview fluido)
  const totalDurationSeconds = project.scenes.reduce((acc, sc) => acc + sc.durationInSeconds, 0);
  const durationInFrames = Math.max(30, totalDurationSeconds * 30);

  return (
    <div className="min-h-screen bg-[#080b11] flex flex-col text-slate-100">
      <Navbar />
      <WizardSteps />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna da Esquerda: Wizard de Criação */}
        <section className="lg:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          {project.currentStep === 1 && <Step1Topic />}
          {project.currentStep === 2 && <Step2Format />}
          {project.currentStep === 3 && <Step3Brand />}
          {project.currentStep === 4 && <Step4Assets />}
          {project.currentStep === 5 && <Step5Audio />}
          {project.currentStep === 6 && <Step6Review />}
        </section>

        {/* Coluna da Direita: Preview Interativo em Tempo Real (@remotion/player) */}
        <aside className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-indigo-400" />
                Preview Interativo em Tempo Real
              </span>
              <span className="font-mono text-slate-400 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {project.aspectRatio} • {totalDurationSeconds}s
              </span>
            </div>

            {/* Container Responsivo do Player */}
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-black flex items-center justify-center transition-all"
              style={{
                width: isVertical ? '280px' : '100%',
                aspectRatio: isVertical ? '9/16' : isSquare ? '1/1' : '16/9',
                maxHeight: '520px',
              }}
            >
              <Player
                component={VideoComposition}
                inputProps={{ project }}
                durationInFrames={durationInFrames}
                compositionWidth={compositionWidth}
                compositionHeight={compositionHeight}
                fps={30}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                controls
                autoPlay={false}
                loop
              />
            </div>

            {/* Metadados e Indicadores de Qualidade do Player */}
            <div className="w-full mt-4 pt-3 border-t border-slate-850 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safe Zones {isVertical ? 'Mobile' : 'Desktop'} Ativas</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{project.scenes.length} Cenas com Spring Motion</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Modais Globais de Configuração */}
      <ApiSettingsModal />
      <VoiceLabModal />
    </div>
  );
}

export default App;
