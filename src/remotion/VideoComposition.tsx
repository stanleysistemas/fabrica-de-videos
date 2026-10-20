import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { ProjectConfig, SceneCut } from '../types';
import { KenBurnsScene } from './scenes/KenBurnsScene';

interface VideoCompositionProps {
  project: ProjectConfig;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({ project }) => {
  const { fps } = useVideoConfig();
  const { scenes, brand, audio, aspectRatio } = project;

  let currentStartFrame = 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: brand.backgroundColor || '#080b11',
        color: '#f8fafc',
        fontFamily: brand.fontFamily || 'Outfit, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {scenes.map((scene, index) => {
        const sceneDurationFrames = Math.max(30, Math.round(scene.durationInSeconds * fps));
        const fromFrame = currentStartFrame;
        currentStartFrame += sceneDurationFrames;

        return (
          <Sequence key={scene.id || index} from={fromFrame} durationInFrames={sceneDurationFrames}>
            {scene.type === 'ken_burns_news' || (scene as any).imageUrl ? (
              <KenBurnsScene
                heading={scene.title || 'NOTÍCIA OFICIAL'}
                narration={(scene as any).narration || scene.text || scene.subtitle || ''}
                imageUrl={(scene as any).imageUrl || (scene as any).associatedImageUrl}
                kenBurnsEffect={(scene as any).kenBurnsEffect || 'zoom_in'}
                layoutMode={(scene as any).layoutMode || 'webcam_streamer'}
                siteName={brand.name || 'CALL OF DUTY OFICIAL'}
              />
            ) : (
              <>
                <SceneRenderer scene={scene} brand={brand} fps={fps} aspectRatio={aspectRatio} />
                <SubtitleOverlay scene={scene} audio={audio} fps={fps} aspectRatio={aspectRatio} />
              </>
            )}
          </Sequence>
        );
      })}
    </div>
  );
};

interface SceneRendererProps {
  scene: SceneCut;
  brand: ProjectConfig['brand'];
  fps: number;
  aspectRatio: string;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, brand, fps, aspectRatio }) => {
  const frame = useCurrentFrame();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  const zoom = interpolate(frame, [0, 180], [1, 1.06], {
    extrapolateRight: 'clamp',
  });

  const isVertical = aspectRatio === '9:16';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isVertical ? '80px 48px 240px 48px' : '48px 80px 140px 80px',
        textAlign: 'center',
        transform: `scale(${zoom})`,
        position: 'relative',
        background: `radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.15) 0%, rgba(8, 11, 17, 1) 75%)`,
      }}
    >
      {/* Pattern Interrupt visual element */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: entrance,
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: brand.primaryColor || '#6366f1',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
          {brand.name || 'AI VIDEO FACTORY'}
        </span>
      </div>

      {/* Hero Title Scene */}
      {scene.type === 'hero_title' && (
        <div style={{ transform: `scale(${entrance}) translateY(${(1 - entrance) * 30}px)` }}>
          <h1
            style={{
              fontSize: isVertical ? '54px' : '64px',
              fontWeight: 800,
              lineHeight: 1.15,
              background: `linear-gradient(135deg, #ffffff 40%, ${brand.primaryColor || '#818cf8'} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px',
            }}
          >
            {scene.title}
          </h1>
          {scene.subtitle && (
            <p style={{ fontSize: isVertical ? '22px' : '26px', color: '#cbd5e1', fontWeight: 500 }}>
              {scene.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Stat Card Scene */}
      {scene.type === 'stat_card' && (
        <div style={{ transform: `scale(${entrance})` }}>
          <div
            style={{
              fontSize: isVertical ? '88px' : '108px',
              fontWeight: 900,
              color: brand.secondaryColor || '#10b981',
              textShadow: '0 0 40px rgba(16, 185, 129, 0.35)',
              lineHeight: 1,
              marginBottom: '12px',
            }}
          >
            {scene.statValue || '+100%'}
          </div>
          <div style={{ fontSize: isVertical ? '24px' : '28px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            {scene.statLabel || 'Crescimento Comprovado'}
          </div>
          {scene.text && (
            <div style={{ fontSize: isVertical ? '18px' : '20px', color: '#94a3b8', maxWidth: '600px' }}>
              {scene.text}
            </div>
          )}
        </div>
      )}

      {/* Terminal Synthetic Scene (do OpenMontage) */}
      {scene.type === 'terminal_scene' && (
        <div
          style={{
            width: '100%',
            maxWidth: isVertical ? '100%' : '750px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            textAlign: 'left',
            transform: `scale(${entrance})`,
          }}
        >
          <div
            style={{
              background: '#1e293b',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ marginLeft: '12px', fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
              terminal ~ ai-factory
            </span>
          </div>
          <div style={{ padding: '24px', fontFamily: 'monospace', fontSize: isVertical ? '15px' : '17px' }}>
            <div style={{ color: '#38bdf8', marginBottom: '14px' }}>
              $ {scene.terminalCommand || 'npx video-factory --run'}
            </div>
            <pre style={{ color: '#a7f3d0', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {scene.terminalOutput || 'Status: Sucesso'}
            </pre>
          </div>
        </div>
      )}

      {/* Screenshot Synthetic Scene */}
      {scene.type === 'screenshot_synthetic' && (
        <div style={{ transform: `scale(${entrance})`, width: '100%' }}>
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.85)',
              border: `2px solid ${brand.primaryColor || '#6366f1'}`,
              borderRadius: '20px',
              padding: '36px 24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ fontSize: isVertical ? '32px' : '40px', fontWeight: 800, marginBottom: '12px' }}>
              {scene.title || 'Demonstração Interativa'}
            </h2>
            <p style={{ fontSize: isVertical ? '18px' : '22px', color: '#cbd5e1' }}>
              {scene.text || 'Visualização dinâmica de interface com alta taxa de conversão.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface SubtitleOverlayProps {
  scene: SceneCut;
  audio: ProjectConfig['audio'];
  fps: number;
  aspectRatio: string;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ scene, audio, aspectRatio }) => {
  const isVertical = aspectRatio === '9:16';
  const bottomPosition = isVertical ? '14%' : '8%';

  // Estilo de legenda inteligente
  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomPosition,
        left: '5%',
        right: '5%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: audio.subtitleStyle === 'caixa' ? '#000000' : 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '10px 22px',
          borderRadius: audio.subtitleStyle === 'pilula' ? '9999px' : '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          maxWidth: isVertical ? '90%' : '75%',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: isVertical ? '20px' : '22px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
          }}
        >
          {scene.narration}
        </span>
      </div>
    </div>
  );
};
