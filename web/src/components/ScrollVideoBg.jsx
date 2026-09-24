import { useEffect, useRef } from 'react';

// Fundo da página: vídeo da RAM se abrindo, controlado pela rolagem (substitui a fita dourada).
// Bem transparente, só para dar profundidade. O vídeo é todo em keyframes (-g 1) para o seek ficar liso.
export default function ScrollVideoBg() {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, shown = 0;

    const target = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      // abre até o meio da página e fecha até o rodapé
      const k = p < 0.55 ? p / 0.55 : 1 - (p - 0.55) / 0.45;
      return Math.min(1, Math.max(0, k)) * (v.duration || 0);
    };

    const tick = () => {
      if (v.readyState >= 2 && v.duration) {
        const t = target();
        shown += (t - shown) * 0.12;
        if (Math.abs(v.currentTime - shown) > 1 / 30) v.currentTime = shown;
      }
      raf = requestAnimationFrame(tick);
    };

    v.pause();
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <video
        ref={ref}
        src="./ram-explodida.mp4"
        poster="./ram-explodida.jpg"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.22] md:opacity-[0.28]"
      ></video>
      {/* vinheta para o conteúdo continuar legível */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(3,3,3,0.15) 0%, rgba(3,3,3,0.75) 75%, #030303 100%)' }}></div>
    </div>
  );
}
