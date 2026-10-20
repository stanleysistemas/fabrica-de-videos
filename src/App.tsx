import React from 'react';
import { Player } from '@remotion/player';
import { useProjectStore } from './stores/useProjectStore';
import { useNavigationStore } from './stores/useNavigationStore';
import { VideoComposition } from './remotion/VideoComposition';
import { Sidebar } from './components/Sidebar';
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
import { NewsToVideoView } from './components/views/NewsToVideoView';
import { AvatarStudioView } from './components/views/AvatarStudioView';
import { ThumbnailMakerView } from './components/views/ThumbnailMakerView';
import { HardwareSettingsView } from './components/views/HardwareSettingsView';
import { PlayCircle, ShieldCheck, Layers } from 'lucide-react';

export function App() {
  const { project } = useProjectStore();
  const { currentModule } = useNavigationStore();

  // Dimensões do Player Remotion conforme aspecto
  const isVertical = project.aspectRatio === '9:16';
  const isSquare = project.aspectRatio === '1:1';

  const compositionWidth = isVertical ? 1080 : isSquare ? 1080 : 1920;
  const compositionHeight = isVertical ? 1920 : isSquare ? 1080 : 1080;

  const totalDurationSeconds = project.scenes.reduce((acc, sc) => acc + sc.durationInSeconds, 0);
  const durationInFrames = Math.max(30, totalDurationSeconds * 30);

  return (
    <div className="min-h-screen bg-[#080b11] flex text-slate-100 overflow-x-hidden">
      {/* Sidebar Lateral Modular */}
      <Sidebar />

      {/* Conteúdo Principal com Barra Superior */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* MÓDULO 1: Vídeo Viral por Referência com Player Remotion Integrado */}
          {currentModule === 'viral_video' && (
            <div className="space-y-6">
              <WizardSteps />

              <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

                    {/* Indicadores do Player */}
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
            </div>
          )}

          {/* MÓDULO 2: Notícia / Blog URL to Video */}
          {currentModule === 'news_to_video' && <NewsToVideoView />}

          {/* MÓDULO 3: Avatar Studio (Apresentadores Virtuais) */}
          {currentModule === 'avatar_studio' && <AvatarStudioView />}

          {/* MÓDULO 4: Thumbnail Maker */}
          {currentModule === 'thumbnail_maker' && <ThumbnailMakerView />}

          {/* MÓDULO 5: Hardware & APIs */}
          {currentModule === 'hardware_settings' && <HardwareSettingsView />}
        </div>
      </div>

      {/* Modais Globais */}
      <ApiSettingsModal />
      <VoiceLabModal />
    </div>
  );
}

export default App;
