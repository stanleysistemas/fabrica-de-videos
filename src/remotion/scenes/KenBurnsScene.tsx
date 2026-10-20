import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface KenBurnsSceneProps {
  heading: string;
  narration: string;
  imageUrl?: string;
  avatarImageUrl?: string;
  avatarSetupUrl?: string;
  kenBurnsEffect?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right';
  layoutMode?: 'full_image' | 'webcam_streamer' | 'avatar_fullscreen' | 'gameplay_with_webcam';
  siteName?: string;
}

export const KenBurnsScene: React.FC<KenBurnsSceneProps> = ({
  heading,
  narration,
  imageUrl,
  avatarImageUrl = 'http://localhost:3001/storage/avatars/avatar_stanley_webcam.jpg',
  avatarSetupUrl = 'http://localhost:3001/storage/avatars/avatar_stanley_setup.jpg',
  kenBurnsEffect = 'zoom_in',
  layoutMode = 'webcam_streamer',
  siteName = 'CALL OF DUTY OFICIAL',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Cálculo da interpolação do movimento Ken Burns
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (kenBurnsEffect === 'zoom_in') {
    scale = interpolate(frame, [0, durationInFrames], [1.0, 1.15], {
      extrapolateRight: 'clamp',
    });
  } else if (kenBurnsEffect === 'zoom_out') {
    scale = interpolate(frame, [0, durationInFrames], [1.15, 1.0], {
      extrapolateRight: 'clamp',
    });
  } else if (kenBurnsEffect === 'pan_left') {
    scale = 1.10;
    translateX = interpolate(frame, [0, durationInFrames], [25, -25], {
      extrapolateRight: 'clamp',
    });
  } else if (kenBurnsEffect === 'pan_right') {
    scale = 1.10;
    translateX = interpolate(frame, [0, durationInFrames], [-25, 25], {
      extrapolateRight: 'clamp',
    });
  }

  // Detectar se esta cena é uma abertura com avatar em destaque, gameplay ou arma
  const isIntroOrAvatarFocus =
    layoutMode === 'avatar_fullscreen' ||
    heading.toLowerCase().includes('abertura') ||
    heading.toLowerCase().includes('arsenal completo de mw4') ||
    heading.toLowerCase().includes('bomba');

  const isGameplay =
    layoutMode === 'gameplay_with_webcam' ||
    heading.toLowerCase().includes('gameplay');

  // Imagem de fundo principal dependendo do tipo da cena
  let mainBgImage = imageUrl && imageUrl.startsWith('http')
    ? imageUrl
    : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop';

  if (isIntroOrAvatarFocus) {
    mainBgImage = avatarSetupUrl;
  } else if (isGameplay) {
    // Imagem representativa de gameplay de Call of Duty / FPS
    mainBgImage = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1400&auto=format&fit=crop';
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center font-sans">
      {/* Camada 1: Fundo com Desfoque Profundo (Preenchimento sem bordas pretas) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-40 scale-125"
        style={{ backgroundImage: `url(${mainBgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 z-10" />

      {/* Camada 2: Imagem Principal em Alta Resolução com Efeito Ken Burns */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-3">
        <div className="w-full h-full overflow-hidden rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 relative">
          <img
            src={mainBgImage}
            alt={heading}
            className="w-full h-full object-cover will-change-transform"
            style={{
              transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
              transition: 'transform 0.04s linear',
            }}
          />

          {/* Se for gameplay, adicionar HUD overlay sutil de streamer */}
          {isGameplay && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/20 via-transparent to-black/30 pointer-events-none">
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/75 px-3 py-1 rounded-full border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                GAMEPLAY AO VIVO • @stanleyalvesbr
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camada 3: Badges no Topo */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 flex-wrap">
        <span className="bg-red-600/95 text-white font-black text-xs uppercase px-3 py-1 rounded-full shadow-lg tracking-wider border border-red-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          {isIntroOrAvatarFocus ? 'CANAL @STANLEYALVESBR' : siteName}
        </span>
        <span className="bg-black/75 backdrop-blur-md text-amber-300 font-bold text-xs uppercase px-3 py-1 rounded-full border border-amber-500/30 shadow-md">
          {heading}
        </span>
      </div>

      {/* Camada 4: Webcam do Avatar Real do Stanley no Canto Inferior Direito */}
      {/* Não exibe a webcam pequena se a cena já for o avatar em tela cheia */}
      {!isIntroOrAvatarFocus && (
        <div className="absolute bottom-28 right-6 z-30 flex flex-col items-center">
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl border-2 border-emerald-400 bg-slate-950 overflow-hidden shadow-2xl shadow-emerald-500/25 relative flex items-center justify-center">
            {/* Foto real em close-up do Avatar do Usuário */}
            <img
              src={avatarImageUrl}
              alt="Avatar Stanley Alves"
              className="w-full h-full object-cover object-top will-change-transform"
              style={{
                transform: `scale(${1 + Math.sin(frame / 12) * 0.015})`,
              }}
            />

            {/* Overlay com vinheta Gamer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Crachá do Streamer no Canto da Webcam */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                Stanley Alves
              </span>
            </div>

            {/* Barras de Onda Sonora Simulando a Fala da Voz */}
            <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-center gap-1 bg-black/60 backdrop-blur-sm py-1 px-2 rounded-full border border-white/10">
              {[35, 65, 95, 55, 85, 45, 75, 90, 50].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, (h * ((frame + i * 3) % 8 + 3)) / 14)}px`,
                    maxHeight: '14px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camada 5: Legenda e Narração em Destaque na Safe Zone */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center">
        <div className="max-w-3xl bg-slate-950/90 backdrop-blur-md border border-slate-700/70 px-5 py-3.5 rounded-2xl shadow-2xl text-center">
          <p className="font-extrabold text-sm md:text-base text-white leading-relaxed drop-shadow-md">
            "{narration}"
          </p>
        </div>
      </div>
    </div>
  );
};
