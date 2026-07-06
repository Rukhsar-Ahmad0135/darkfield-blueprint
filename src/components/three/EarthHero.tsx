import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, useGLTF, Clone } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import enduranceAsset from "@/assets/endurance.glb.asset.json";

useGLTF.preload(enduranceAsset.url);

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

/* ── Earth as a horizon curve at the bottom of frame ─────────────────── */
function EarthHorizon({ yRef }: { yRef: React.MutableRefObject<number> }) {
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
  const smooth = useRef(-5.6);

  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.02;
    if (clouds.current) clouds.current.rotation.y += dt * 0.028;
    // smooth easing toward scroll-driven y target
    smooth.current += (yRef.current - smooth.current) * Math.min(1, dt * 1.4);
    if (group.current) group.current.position.y = smooth.current;
  });

  // Big Earth positioned way below camera → only the horizon arc is visible.
  return (
    <group ref={group} position={[0, -5.6, 0]}>
      <mesh ref={earth}>
        <sphereGeometry args={[5.2, 160, 160]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specMap}
          specular={new THREE.Color("#2f2f2f")}
          shininess={10}
          emissive={new THREE.Color("#0a1428")}
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[5.235, 160, 160]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.48} depthWrite={false} />
      </mesh>
      {/* Thin bright atmospheric rim — the signature horizon glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[5.2, 96, 96]} />
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
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 5.0);
              gl_FragColor = vec4(0.55, 0.78, 1.0, f * 0.55); }`}
        />
      </mesh>
    </group>
  );
}

/* ── Interstellar Endurance floating centered above the horizon ───────── */
function FloatingEndurance() {
  const { scene } = useGLTF(enduranceAsset.url) as unknown as { scene: THREE.Group };
  const prepared = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const norm = 1 / maxDim;
    cloned.scale.setScalar(norm);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center.multiplyScalar(norm));
    cloned.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = new THREE.MeshStandardMaterial({
          color: "#c9ccd2",
          metalness: 0.82,
          roughness: 0.38,
          emissive: new THREE.Color("#0a111e"),
          emissiveIntensity: 0.18,
        });
      }
    });
    return cloned;
  }, [scene]);

  const group = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Slow floating drift centered above the horizon
      group.current.position.set(Math.sin(t * 0.12) * 0.15, 0.55 + Math.sin(t * 0.18) * 0.08, 0);
      group.current.rotation.x = 0.05 + Math.sin(t * 0.1) * 0.03;
    }
    // Habitation ring rotates slowly — Endurance signature
    if (ring.current) ring.current.rotation.z = t * 0.25;
  });

  return (
    <group ref={group} scale={1.15}>
      <group ref={ring}>
        <Clone object={prepared} />
      </group>
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
 * Full-bleed hero: Earth-horizon view with Interstellar Endurance floating above.
 * Children (hero text) receive `progress` (0..1) to fade in near peak scroll.
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
  const yRef = useRef(-5.6);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Ease Earth slightly upward on scroll — a subtle parallax rise.
  const eased = progress * progress * (3 - 2 * progress);
  yRef.current = -5.6 + eased * 0.9;

  // Text reveal after user scrolls a bit past the horizon
  const textReveal = Math.max(0, Math.min(1, (progress - 0.7) / 0.22));

  return (
    <section ref={sectionRef} className="relative bg-black" style={{ minHeight }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 6], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="absolute inset-0"
          >
            <ambientLight intensity={0.28} />
            <directionalLight position={[5, 3, 4]} intensity={2.6} color="#ffffff" />
            <hemisphereLight args={["#b6d0ff", "#0a0f1c", 0.32]} />
            <Suspense fallback={null}>
              <SlowSpin>
                <Stars radius={140} depth={70} count={9000} factor={3.2} saturation={0} fade speed={0.12} />
              </SlowSpin>
              <EarthHorizon yRef={yRef} />
              <FloatingEndurance />
            </Suspense>
          </Canvas>
        )}

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
