import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, useGLTF, Clone } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import satelliteAsset from "@/assets/satellite.glb.asset.json";
import enduranceAsset from "@/assets/endurance.glb.asset.json";

useGLTF.preload(satelliteAsset.url);
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

/* ── Satellites orbiting Earth ─────────────────────────────────────────── */
/* Animated satellites — proper satellite mesh with body + solar panels */
function SatelliteMesh() {
  const { scene } = useGLTF(satelliteAsset.url) as unknown as { scene: THREE.Group };
  const prepared = useMemo(() => {
    const cloned = scene.clone(true);
    // Normalize size to ~unit and apply a clean metallic look
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const norm = 0.2 / maxDim;
    cloned.scale.setScalar(norm);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center.multiplyScalar(norm));
    cloned.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = false;
        m.receiveShadow = false;
        m.material = new THREE.MeshStandardMaterial({
          color: "#c9ced6",
          metalness: 0.85,
          roughness: 0.35,
          emissive: new THREE.Color("#1a2540"),
          emissiveIntensity: 0.15,
        });
      }
    });
    return cloned;
  }, [scene]);
  return <Clone object={prepared} />;
}

function OrbitingSatellites({ count = 25 }: { count?: number }) {
  const refs = useRef<THREE.Group[]>([]);
  const orbits = useMemo(() => {
    const arr: { radius: number; speed: number; tilt: [number, number, number]; phase: number; scale: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        radius: 1.22 + Math.random() * 0.5,
        speed: 0.05 + Math.random() * 0.09,
        tilt: [
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
        ],
        phase: Math.random() * Math.PI * 2,
        scale: 0.7 + Math.random() * 0.6,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const o = orbits[i];
      const a = t * o.speed + o.phase;
      g.position.set(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
      g.rotation.y = -a + Math.PI / 2;
    });
  });

  return (
    <group>
      {orbits.map((o, i) => (
        <group key={i} rotation={o.tilt}>
          <group ref={(el) => { if (el) refs.current[i] = el; }} scale={o.scale}>
            <SatelliteMesh />
          </group>
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

/* ── Endurance flyby (Interstellar) ───────────────────────────────────── */
function EnduranceFlyby({
  progressRef,
  earthScaleRef,
}: {
  progressRef: React.MutableRefObject<number>;
  earthScaleRef: React.MutableRefObject<number>;
}) {
  const { scene } = useGLTF(enduranceAsset.url) as unknown as { scene: THREE.Group };
  const group = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);

  const prepared = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const norm = 1 / maxDim; // normalize to unit; final scale applied by parent
    cloned.scale.setScalar(norm);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center.multiplyScalar(norm));
    cloned.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = new THREE.MeshStandardMaterial({
          color: "#d6dae0",
          metalness: 0.8,
          roughness: 0.45,
          emissive: new THREE.Color("#0e1524"),
          emissiveIntensity: 0.2,
        });
      }
    });
    return cloned;
  }, [scene]);

  useFrame((_, dt) => {
    // Always visible; drift slowly left -> right on a long loop, regardless of Earth size
    const earthR = Math.max(earthScaleRef.current, 0.35);
    const shipSize = earthR * 1.1; // bigger — slightly larger than Earth for prominence
    if (group.current) {
      const t = (performance.now() / 1000) * 0.03; // slow drift
      const cycle = (t % 1); // 0 -> 1 loop
      const x = -earthR * 3.2 + cycle * (earthR * 6.4);
      const y = earthR * 0.35 + Math.sin(t * 4) * earthR * 0.05;
      const z = earthR * 1.2;
      group.current.position.set(x, y, z);
      group.current.scale.setScalar(shipSize);
      group.current.visible = true;
    }
    if (spin.current) spin.current.rotation.y += dt * 0.15;
    void progressRef.current;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={spin} rotation={[0.15, 0, 0.05]}>
        <Clone object={prepared} />
      </group>
    </group>
  );
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
  const progressRef = useRef(0);
  progressRef.current = progress;
  const scaleTarget = useRef(0.12);
  const earthScaleRef = useRef(0.12);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Earth scale: tiny → full over the first 80% of scroll
  const earthProgress = Math.min(1, progress / 0.8);
  scaleTarget.current = 0.12 + earthProgress * 1.35;
  earthScaleRef.current = scaleTarget.current;

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
            <ambientLight intensity={0.35} />
            <directionalLight position={[6, 2, 4]} intensity={2.8} color="#ffffff" />
            <hemisphereLight args={["#b6d0ff", "#1a1a2a", 0.35]} />
            <Suspense fallback={null}>
              <SlowSpin>
                <Stars radius={140} depth={70} count={9000} factor={3.2} saturation={0} fade speed={0.12} />
              </SlowSpin>
              <Earth scaleTarget={scaleTarget} />
              <EnduranceFlyby progressRef={progressRef} earthScaleRef={earthScaleRef} />
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
