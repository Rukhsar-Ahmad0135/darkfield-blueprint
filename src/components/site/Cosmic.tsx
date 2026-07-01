import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport starfield backdrop.
 * Canvas 2D — lightweight, parallax with slow drift + twinkle.
 */
export function Starfield({ density = 1, className = "" }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    let stars: Array<{ x: number; y: number; z: number; r: number; tw: number; hue: number }> = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((w * h) / 4500) * density;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,
        r: Math.random() * 1.1 + 0.2,
        tw: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.15 ? 40 : Math.random() < 0.5 ? 50 : 220,
      }));
    }

    let t = 0;
    function frame() {
      t += 0.006;
      ctx!.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.z * 0.05;
        if (s.y > h) s.y = 0;
        const twinkle = 0.55 + 0.45 * Math.sin(t * 2 + s.tw);
        const alpha = (0.2 + s.z * 0.8) * twinkle;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
        // warm-ish or cool white
        if (s.hue < 100) {
          ctx!.fillStyle = `rgba(255, 210, 160, ${alpha.toFixed(3)})`;
        } else {
          ctx!.fillStyle = `rgba(220, 230, 255, ${alpha.toFixed(3)})`;
        }
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 ${className}`}
    />
  );
}

/**
 * Gargantua — CSS-only black hole with warped accretion disk.
 * Reference: Interstellar's Gargantua. Uses layered rotating rings + radial glow.
 */
export function BlackHole({ className = "", size = 520 }: { className?: string; size?: number }) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer warm glow halo */}
      <div
        className="absolute inset-[-20%] rounded-full animate-disk-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(255,170,90,0.35) 0%, rgba(255,120,40,0.15) 30%, transparent 65%)",
        }}
      />
      {/* Accretion disk — top arc, warm */}
      <div className="absolute inset-0 animate-orbit-slow" style={{ transformOrigin: "50% 50%" }}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.98,
            height: size * 0.22,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,210,150,0.85) 20%, rgba(255,150,60,0.95) 50%, rgba(255,210,150,0.85) 80%, transparent 100%)",
            filter: "blur(6px)",
            boxShadow: "0 0 60px rgba(255,160,80,0.55)",
          }}
        />
      </div>
      {/* Accretion disk — perpendicular arc for the "warped" look */}
      <div className="absolute inset-0 animate-orbit-reverse" style={{ transformOrigin: "50% 50%" }}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.85,
            height: size * 0.14,
            background:
              "linear-gradient(90deg, transparent 5%, rgba(255,190,120,0.7) 30%, rgba(255,120,40,0.9) 50%, rgba(255,190,120,0.7) 70%, transparent 95%)",
            filter: "blur(4px)",
            transform: "translate(-50%, -50%) rotate(28deg)",
          }}
        />
      </div>
      {/* Vertical warp arc — the iconic Gargantua top/bottom arcs */}
      <div className="absolute inset-0" style={{ transform: "rotate(0deg)" }}>
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            transform: "translate(-50%, -50%)",
            border: "3px solid rgba(255,180,100,0.4)",
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            filter: "blur(3px)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 0.72,
            height: size * 0.72,
            transform: "translate(-50%, -50%) rotate(90deg)",
            border: "2px solid rgba(255,200,130,0.35)",
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            filter: "blur(2px)",
          }}
        />
      </div>
      {/* Event horizon — pure black sphere */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background: "radial-gradient(circle at 50% 50%, #000 60%, rgba(20,10,5,0.9) 100%)",
          boxShadow:
            "0 0 40px 10px rgba(0,0,0,0.9), inset 0 0 30px rgba(255,150,80,0.15)",
        }}
      />
      {/* Photon ring highlight */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.44,
          height: size * 0.44,
          border: "1px solid rgba(255,200,140,0.6)",
          boxShadow: "0 0 20px rgba(255,180,100,0.6), inset 0 0 12px rgba(255,180,100,0.4)",
        }}
      />
    </div>
  );
}

/**
 * Wormhole — concentric warped rings (used as accent on inner routes).
 */
export function Wormhole({ className = "", size = 360 }: { className?: string; size?: number }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden>
      <div
        className="absolute inset-0 animate-orbit-slow rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,170,90,0.0), rgba(255,170,90,0.55), rgba(120,90,220,0.2), rgba(255,170,90,0.0))",
          filter: "blur(12px)",
        }}
      />
      <div
        className="absolute inset-[12%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(30,20,40,0.9) 20%, #000 70%)",
          boxShadow: "inset 0 0 60px rgba(255,160,80,0.35)",
        }}
      />
    </div>
  );
}
