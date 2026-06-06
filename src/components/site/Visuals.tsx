export function GridBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] ${className}`}
    />
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
      {/* Edge nodes */}
      <g className="text-foreground/80">
        {[120, 260, 400, 540, 680].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={80} r="4" fill="currentColor" />
            <rect x={x - 38} y={40} width="76" height="32" className="text-hairline" />
            <text
              x={x}
              y={60}
              textAnchor="middle"
              className="fill-current text-[9px] uppercase tracking-[0.18em]"
              stroke="none"
            >
              Node 0{i + 1}
            </text>
          </g>
        ))}
      </g>

      {/* Mesh links */}
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

      {/* Distributed mesh hub */}
      <g className="text-foreground">
        <rect x="320" y="200" width="160" height="44" className="text-hairline" />
        <text
          x="400"
          y="226"
          textAnchor="middle"
          className="fill-current text-[10px] uppercase tracking-[0.22em]"
          stroke="none"
        >
          Distributed Mesh
        </text>
        <path d="M400 244 L400 320" strokeDasharray="3 4" className="text-foreground/40" />
      </g>

      {/* AI orchestration */}
      <g className="text-foreground/80">
        <rect x="120" y="320" width="160" height="44" className="text-hairline" />
        <text
          x="200"
          y="346"
          textAnchor="middle"
          className="fill-current text-[10px] uppercase tracking-[0.22em]"
          stroke="none"
        >
          AI Orchestration
        </text>
        <path d="M280 342 L520 342" strokeDasharray="3 4" className="text-foreground/40" />
      </g>

      {/* Cloud core */}
      <g className="text-foreground">
        <rect x="520" y="320" width="160" height="44" className="text-hairline" />
        <text
          x="600"
          y="346"
          textAnchor="middle"
          className="fill-current text-[10px] uppercase tracking-[0.22em]"
          stroke="none"
        >
          Cloud Core
        </text>
      </g>

      {/* Blockchain ledger */}
      <g className="text-foreground/60">
        <path d="M400 320 L400 420" strokeDasharray="3 4" />
        <rect x="320" y="420" width="160" height="44" className="text-hairline" />
        <text
          x="400"
          y="446"
          textAnchor="middle"
          className="fill-current text-[10px] uppercase tracking-[0.22em]"
          stroke="none"
        >
          Blockchain Ledger
        </text>
      </g>

      {/* Labels */}
      <text x="20" y="80" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">
        01 / Edge
      </text>
      <text x="20" y="222" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">
        02 / Mesh
      </text>
      <text x="20" y="342" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">
        03 / Core
      </text>
      <text x="20" y="442" className="fill-current text-[9px] uppercase tracking-[0.2em] text-text-muted" stroke="none">
        04 / Trust
      </text>
    </svg>
  );
}

export function TriangleMark({ className = "" }: { className?: string }) {
  // The brand mark — recursive dashed triangles
  return (
    <svg
      viewBox="0 0 240 220"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      {[
        "M120 20 L20 200 L220 200 Z",
        "M120 60 L60 180 L180 180 Z",
        "M120 100 L90 160 L150 160 Z",
        "M120 130 L105 155 L135 155 Z",
      ].map((d, i) => (
        <path key={i} d={d} strokeDasharray="4 5" opacity={1 - i * 0.12} />
      ))}
      <path d="M20 200 L220 200" strokeDasharray="2 4" />
    </svg>
  );
}
