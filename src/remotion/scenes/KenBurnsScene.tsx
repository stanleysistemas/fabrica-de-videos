import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface KenBurnsSceneProps {
  heading: string;
  narration: string;
  imageUrl?: string;
  kenBurnsEffect?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode?: 'full_image' | 'webcam_streamer';
  siteName?: string;
}

export const KenBurnsScene: React.FC<KenBurnsSceneProps> = ({
  heading,
  narration,
  imageUrl,
  kenBurnsEffect = 'zoom_in',
  layoutMode = 'full_image',
  siteName = 'CALL OF DUTY OFICIAL',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  // Cálculo da interpolação do movimento Ken Burns
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (kenBurnsEffect === 'zoom_in') {
    scale = interpolate(frame, [0, durationInFrames], [1.0, 1.18], {
      extrapolateRight: 'clamp',
    });
  } else if (kenBurnsEffect === 'zoom_out') {
    scale = interpolate(frame, [0, durationInFrames], [1.18, 1.0], {
      extrapolateRight: 'clamp',
    });
  } else if (kenBurnsEffect === 'pan_left') {
    scale = 1.12;
    translateX = interpolate(frame, [0, durationInFrames], [30, -30], {
      extrapolateRight: 'clamp',
    });
  } else if (kenBurnsEffect === 'pan_right') {
    scale = 1.12;
    translateX = interpolate(frame, [0, durationInFrames], [-30, 30], {
      extrapolateRight: 'clamp',
    });
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop';
  const displayImage = imageUrl && imageUrl.startsWith('http') ? imageUrl : fallbackImage;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center font-sans">
      {/* Camada 1: Fundo com Desfoque Profundo (Preenchimento sem bordas pretas) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-45 scale-125"
        style={{ backgroundImage: `url(${displayImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 z-10" />

      {/* Camada 2: Imagem Principal em Alta Resolução com Efeito Ken Burns */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        <div className="w-full h-full overflow-hidden rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
          <img
            src={displayImage}
            alt={heading}
            className="w-full h-full object-cover will-change-transform"
            style={{
              transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
              transition: 'transform 0.05s linear',
            }}
          />
        </div>
      </div>

      {/* Camada 3: Badge da Notícia no Topo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
        <span className="bg-red-600/90 text-white font-black text-xs uppercase px-3 py-1 rounded-full shadow-lg tracking-wider border border-red-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          {siteName}
        </span>
        <span className="bg-black/60 backdrop-blur-md text-amber-300 font-bold text-xs uppercase px-3 py-1 rounded-full border border-amber-500/20 shadow-md">
          {heading}
        </span>
      </div>

      {/* Camada 4: Webcam do Avatar Streamer no Canto Inferior Direito (se ativado) */}
      {layoutMode === 'webcam_streamer' && (
        <div className="absolute bottom-28 right-8 z-30 flex flex-col items-center">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl border-2 border-emerald-400 bg-slate-950/95 overflow-hidden shadow-2xl shadow-emerald-500/20 relative flex items-center justify-center">
            {/* Overlay com gradiente Gamer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            
            {/* Ícone ou Avatar Simulado */}
            <div className="text-center p-2 z-20">
              <span className="text-2xl block mb-1">🎙️</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Stanley Gamer
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">AO VIVO</span>
            </div>

            {/* Onda sonora simulada na webcam */}
            <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-center gap-1">
              {[40, 70, 100, 60, 90, 50, 80].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full"
                  style={{
                    height: `${(h * (frame % 10 + 5)) / 15}px`,
                    maxHeight: '16px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camada 5: Legenda e Narração em Destaque na Safe Zone */}
      <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-center">
        <div className="max-w-3xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl shadow-2xl text-center">
          <p className="font-extrabold text-base md:text-lg text-white leading-snug drop-shadow-md">
            "{narration}"
          </p>
        </div>
      </div>
    </div>
  );
};
