import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const TEX_BASE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets";

/** Scroll progress within the hero container (0 = top, 1 = fully scrolled). */
function useHeroScroll(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return setP(0);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setP(scrolled / total);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);
  return p;
}

/* ── Satellites orbiting Earth ─────────────────────────────────────────── */
function Satellites({ count = 25 }: { count?: number }) {
  const group = useRef<THREE.Group>(null!);
  const orbits = useMemo(() => {
    const arr: { radius: number; speed: number; tilt: THREE.Euler; phase: number; size: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        radius: 1.25 + Math.random() * 0.55,
        speed: 0.15 + Math.random() * 0.35,
        tilt: new THREE.Euler(
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
        ),
        phase: Math.random() * Math.PI * 2,
        size: 0.008 + Math.random() * 0.008,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const o = orbits[i];
      const a = t * o.speed + o.phase;
      child.position.set(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
    });
  });

  return (
    <group>
      {orbits.map((o, i) => (
        <group key={i} rotation={o.tilt}>
          <group ref={i === 0 ? group : undefined}>
            {/* the ref above only attaches once — use a shared parent instead */}
          </group>
          <mesh position={[o.radius, 0, 0]}>
            <sphereGeometry args={[o.size, 8, 8]} />
            <meshBasicMaterial color="#e8f0ff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* Proper animated satellites — one group per orbit with its own tilt */
function OrbitingSatellites({ count = 25 }: { count?: number }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const orbits = useMemo(() => {
    const arr: { radius: number; speed: number; tilt: [number, number, number]; phase: number; size: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        radius: 1.22 + Math.random() * 0.5,
        speed: 0.18 + Math.random() * 0.35,
        tilt: [
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
        ],
        phase: Math.random() * Math.PI * 2,
        size: 0.009 + Math.random() * 0.008,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const o = orbits[i];
      const a = t * o.speed + o.phase;
      m.position.set(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
    });
  });

  return (
    <group>
      {orbits.map((o, i) => (
        <group key={i} rotation={o.tilt}>
          <mesh ref={(el) => { if (el) refs.current[i] = el; }}>
            <sphereGeometry args={[o.size, 10, 10]} />
            <meshStandardMaterial color="#f5f7ff" emissive="#8fb4ff" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Earth + Clouds + Atmosphere ──────────────────────────────────────── */
function Earth({ scaleTarget }: { scaleTarget: React.MutableRefObject<number> }) {
  const [colorMap, normalMap, specMap, cloudMap] = useLoader(THREE.TextureLoader, [
    `${TEX_BASE}/earth_atmos_2048.jpg`,
    `${TEX_BASE}/earth_normal_2048.jpg`,
    `${TEX_BASE}/earth_specular_2048.jpg`,
    `${TEX_BASE}/earth_clouds_1024.png`,
  ]);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const group = useRef<THREE.Group>(null!);
  const earth = useRef<THREE.Mesh>(null!);
  const clouds = useRef<THREE.Mesh>(null!);
  const smooth = useRef(0);

  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.045;
    if (clouds.current) clouds.current.rotation.y += dt * 0.06;
    smooth.current += (scaleTarget.current - smooth.current) * Math.min(1, dt * 3);
    if (group.current) group.current.scale.setScalar(smooth.current);
  });

  return (
    <group ref={group} scale={0.001}>
      <mesh ref={earth}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specMap}
          specular={new THREE.Color("#3a3a3a")}
          shininess={12}
          emissive={new THREE.Color("#0a1428")}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[1.015, 128, 128]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* Slim, faded atmospheric rim */}
      <mesh scale={1.055}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          vertexShader={`varying vec3 vN; varying vec3 vP;
            void main(){ vN = normalize(normalMatrix * normal);
              vec4 p = modelViewMatrix * vec4(position,1.0); vP = -p.xyz;
              gl_Position = projectionMatrix * p; }`}
          fragmentShader={`varying vec3 vN; varying vec3 vP;
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 6.0);
              gl_FragColor = vec4(0.55, 0.75, 1.0, f * 0.28); }`}
        />
      </mesh>
      {/* Satellites scale with Earth */}
      <OrbitingSatellites count={25} />
    </group>
  );
}

function SlowSpin({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.008;
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Full-bleed hero: tiny Earth in space that grows as the user scrolls.
 * Children (hero text) receive `progress` (0..1) to fade in near peak size.
 */
export function EarthHeroScene({
  children,
  minHeight = "220vh",
}: {
  children: (progress: number) => ReactNode;
  minHeight?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useHeroScroll(sectionRef);
  const scaleTarget = useRef(0.12);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Earth scale: tiny → full over the first 80% of scroll
  const earthProgress = Math.min(1, progress / 0.8);
  scaleTarget.current = 0.12 + earthProgress * 1.35;

  // Text reveal after Earth reaches peak
  const textReveal = Math.max(0, Math.min(1, (progress - 0.75) / 0.2));

  return (
    <section
      ref={sectionRef}
      className="relative bg-black"
      style={{ minHeight }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 6], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="absolute inset-0"
          >
            <ambientLight intensity={0.08} />
            <directionalLight position={[6, 2, 4]} intensity={2.4} color="#fff2dc" />
            <Suspense fallback={null}>
              <SlowSpin>
                <Stars radius={140} depth={70} count={9000} factor={3.2} saturation={0} fade speed={0.12} />
              </SlowSpin>
              <Earth scaleTarget={scaleTarget} />
            </Suspense>
          </Canvas>
        )}

        {/* text overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="h-full w-full transition-opacity duration-300"
            style={{ opacity: textReveal, pointerEvents: textReveal > 0.4 ? "auto" : "none" }}
          >
            {children(textReveal)}
          </div>
        </div>
      </div>
    </section>
  );
}
