import { useEffect, useRef } from "react";

export function GridBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] ${className}`}
    />
  );
}

/**
 * Sierpinski-style triangle logo built from rows of small dashed triangles.
 * Matches the brand mark provided by the client.
 *
 * `rows` controls density (default 5). `animate` triggers a draw-in animation.
 */
export function SierpinskiLogo({
  className = "",
  rows = 5,
  animate = false,
  strokeWidth = 1.4,
}: {
  className?: string;
  rows?: number;
  animate?: boolean;
  strokeWidth?: number;
}) {
  const size = 100;
  const triH = (size * Math.sqrt(3)) / 2 / rows;
  const triW = size / rows;

  const triangles: Array<{ d: string; key: string }> = [];
  for (let r = 0; r < rows; r++) {
    const y = r * triH;
    const count = r + 1;
    const rowStart = (size - count * triW) / 2;
    for (let c = 0; c < count; c++) {
      const x = rowStart + c * triW;
      // Up-pointing triangle
      triangles.push({
        key: `u${r}-${c}`,
        d: `M ${x + triW / 2} ${y} L ${x} ${y + triH} L ${x + triW} ${y + triH} Z`,
      });
      // Down-pointing inverted triangle (skip last in row)
      if (c < count - 1) {
        triangles.push({
          key: `d${r}-${c}`,
          d: `M ${x + triW} ${y + triH} L ${x + triW / 2} ${y} L ${x + (3 * triW) / 2} ${y} Z`,
        });
      }
    }
  }
  // Bottom baseline
  const baseY = rows * triH;
  triangles.push({
    key: "base",
    d: `M ${(size - rows * triW) / 2} ${baseY} L ${(size + rows * triW) / 2} ${baseY}`,
  });

  return (
    <svg
      viewBox={`-4 -4 ${size + 8} ${baseY + 8}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Dark Field Tech Labs"
    >
      {triangles.map((t) => (
        <path
          key={t.key}
          d={t.d}
          strokeDasharray="2.2 2.4"
          className={animate ? "animate-draw" : undefined}
        />
      ))}
    </svg>
  );
}

/** Kept for back-compat — alias to SierpinskiLogo. */
export const TriangleMark = SierpinskiLogo;

/**
 * Interactive cursor-reactive triangle mesh.
 * Pure Canvas 2D — lightweight, no GPU dependency, works on every browser.
 */
export function InteractiveMesh({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    // Mouse target (in canvas px), eased toward
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    const points: Array<{ x: number; y: number; ox: number; oy: number }> = [];

    function build() {
      const rect = wrap!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.scale(dpr, dpr);

      points.length = 0;
      const step = Math.max(46, Math.min(w, h) / 14);
      const cols = Math.ceil(w / step) + 2;
      const rowH = (step * Math.sqrt(3)) / 2;
      const totalRows = Math.ceil(h / rowH) + 2;
      for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * step + (r % 2 ? step / 2 : 0) - step;
          const y = r * rowH - step;
          // jitter for organic feel
          const jx = (Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
          const jy = (Math.sin(r * 4.1414 + c * 9.81) * 12345.6789) % 1;
          points.push({
            x,
            y,
            ox: x + jx * 6,
            oy: y + jy * 6,
          });
        }
      }
      mouse.x = w / 2;
      mouse.y = h / 2;
      mouse.tx = mouse.x;
      mouse.ty = mouse.y;
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      // ease mouse
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // displace points based on mouse proximity
      const R = Math.max(180, Math.min(w, h) * 0.35);
      const R2 = R * R;
      const pulse = mouse.active ? 1 : 0.45;
      for (const p of points) {
        const dx = p.ox - mouse.x;
        const dy = p.oy - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const f = (1 - d2 / R2) * 26 * pulse;
          const d = Math.sqrt(d2) || 1;
          p.x = p.ox + (dx / d) * f;
          p.y = p.oy + (dy / d) * f;
        } else {
          p.x += (p.ox - p.x) * 0.15;
          p.y += (p.oy - p.y) * 0.15;
        }
      }

      // connect points within range to form triangles
      const max = 90;
      const max2 = max * max;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < max2) {
            const t = 1 - d2 / max2;
            // distance from segment midpoint to mouse for highlight
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const ddx = mx - mouse.x;
            const ddy = my - mouse.y;
            const dd = Math.sqrt(ddx * ddx + ddy * ddy);
            const highlight = Math.max(0, 1 - dd / R);
            const alpha = 0.06 + t * 0.18 + highlight * 0.35;
            ctx!.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
        // node dots near mouse
        const dxm = a.x - mouse.x;
        const dym = a.y - mouse.y;
        const dm2 = dxm * dxm + dym * dym;
        if (dm2 < R2) {
          const f = 1 - dm2 / R2;
          ctx!.fillStyle = `rgba(255,255,255,${(0.15 + f * 0.7).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(a.x, a.y, 0.8 + f * 1.8, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.tx = w / 2;
      mouse.ty = h / 2;
    }

    const ro = new ResizeObserver(() => {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      build();
    });
    ro.observe(wrap);
    build();
    draw();

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export function MeshDiagram() {
  return (
    <svg
      viewBox="0 0 800 520"
      className="w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <g className="text-foreground/80">
        {[120, 260, 400, 540, 680].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={80} r="4" fill="currentColor" />
            <rect x={x - 38} y={40} width="76" height="32" className="text-hairline" />
            <text x={x} y={60} textAnchor="middle" className="fill-current text-[9px] uppercase tracking-[0.18em]" stroke="none">
              Node 0{i + 1}
            </text>
          </g>
        ))}
      </g>
      <g className="text-foreground/30" strokeDasharray="3 4">
        <path d="M120 80 L400 220" />
        <path d="M260 80 L400 220" />
        <path d="M400 80 L400 220" />
        <path d="M540 80 L400 220" />
        <path d="M680 80 L400 220" />
        <path d="M120 80 L260 80" />
        <path d="M260 80 L400 80" />
        <path d="M400 80 L540 80" />
        <path d="M540 80 L680 80" />
      </g>
      <g className="text-foreground">
        <rect x="320" y="200" width="160" height="44" className="text-hairline" />
        <text x="400" y="226" textAnchor="middle" className="fill-current text-[10px] uppercase tracking-[0.22em]" stroke="none">Distributed Mesh</text>
        <path d="M400 244 L400 320" strokeDasharray="3 4" className="text-foreground/40" />
      </g>
      <g className="text-foreground/80">
        <rect x="120" y="320" width="160" height="44" className="text-hairline" />
        <text x="200" y="346" textAnchor="middle" className="fill-current text-[10px] uppercase tracking-[0.22em]" stroke="none">AI Orchestration</text>
        <path d="M280 342 L520 342" strokeDasharray="3 4" className="text-foreground/40" />
      </g>
      <g className="text-foreground">
        <rect x="520" y="320" width="160" height="44" className="text-hairline" />
        <text x="600" y="346" textAnchor="middle" className="fill-current text-[10px] uppercase tracking-[0.22em]" stroke="none">Cloud Core</text>
      </g>
      <g className="text-foreground/60">
        <path d="M400 320 L400 420" strokeDasharray="3 4" />
        <rect x="320" y="420" width="160" height="44" className="text-hairline" />
        <text x="400" y="446" textAnchor="middle" className="fill-current text-[10px] uppercase tracking-[0.22em]" stroke="none">Blockchain Ledger</text>
      </g>
      <text x="20" y="80" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">01 / Edge</text>
      <text x="20" y="222" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">02 / Mesh</text>
      <text x="20" y="342" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">03 / Core</text>
      <text x="20" y="442" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">04 / Trust</text>
    </svg>
  );
}
