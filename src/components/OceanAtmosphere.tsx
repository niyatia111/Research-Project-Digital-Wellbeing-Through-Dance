import React, { useEffect, useRef } from 'react';

interface OceanAtmosphereProps {
  sceneMode: 'sunset' | 'coastal';
  ambientIntensity?: number; // 0 to 1
  breathPhase?: string;
  isDancing?: boolean;
}

const SUNSET_IMAGE = '/src/assets/images/ocean_sunset_shore_1794433256575.jpg';
const COASTAL_IMAGE = '/src/assets/images/ocean_coastal_rocks_1794433256770.jpg';

export const OceanAtmosphere: React.FC<OceanAtmosphereProps> = ({
  sceneMode,
  breathPhase = 'Inhale & Expand',
  isDancing = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bioluminescent floating sea mist / spark particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.35 - 0.1,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle water ripple reflection at bottom
      const gradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
      gradient.addColorStop(0, 'rgba(8, 20, 36, 0)');
      gradient.addColorStop(0.5, 'rgba(12, 33, 56, 0.25)');
      gradient.addColorStop(1, 'rgba(6, 17, 30, 0.7)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height * 0.6, width, height * 0.4);

      // Render floating bioluminescent particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const dynamicAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${dynamicAlpha})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const activeImage = sceneMode === 'sunset' ? SUNSET_IMAGE : COASTAL_IMAGE;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Ocean Photographic Landscape */}
      <img
        src={activeImage}
        alt="Peaceful ocean sanctuary background"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 motion-safe:animate-[pulse_14s_ease-in-out_infinite]"
        style={{
          filter: isDancing ? 'brightness(0.68) saturate(1.15)' : 'brightness(0.82) saturate(1.05)',
        }}
      />

      {/* Atmospheric Mist & Gradient Scrims for Perfect Visual Hierarchy */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_70%)]" />

      {/* Gentle Breathing Aura Pulse in the Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[85vw] max-w-4xl h-[65vh] rounded-full bg-cyan-500/5 blur-3xl animate-breathe pointer-events-none" />
      </div>

      {/* Canvas Layer for Bioluminescent Water Motes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
