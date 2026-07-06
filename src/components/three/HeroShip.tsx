import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Clone, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor, Environment } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import shipAsset from "@/assets/endurance_hifi.glb.asset.json";

// Film-accurate Endurance materials: off-white/gray PBR panels,
// dark graphite trusses, blue-black glazing. Applied by name heuristics
// with per-mesh subtle variation so the hull reads as many panels, not one shell.
function applyEnduranceMaterials(root: THREE.Object3D) {
  const rand = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  const hullBase = new THREE.Color("#d8d8d6"); // off-white
  const grayBase = new THREE.Color("#8a8a8c"); // light gray
  const trussCol = new THREE.Color("#1c1e22"); // dark graphite
  const glassCol = new THREE.Color("#050914"); // blue-black glass

  let idx = 0;
  root.traverse((o: any) => {
    if (!o.isMesh) return;
    idx++;
    const name = (o.name || "").toLowerCase();
    const r = rand(idx);

    const isGlass = /(window|glass|glaz|port|canopy|cockpit)/.test(name);
    const isTruss = /(truss|frame|strut|joint|beam|spine|dock|antenna|rig|arm|clamp|bolt|thrust|engine|nozzle)/.test(
      name
    );

    let mat: THREE.MeshStandardMaterial;

    if (isGlass) {
      mat = new THREE.MeshStandardMaterial({
        color: glassCol,
        metalness: 0.9,
        roughness: 0.08,
        envMapIntensity: 1.4,
      });
    } else if (isTruss) {
      mat = new THREE.MeshStandardMaterial({
        color: trussCol.clone().offsetHSL(0, 0, (r - 0.5) * 0.05),
        metalness: 0.85,
        roughness: 0.55 + r * 0.15,
        envMapIntensity: 0.8,
      });
    } else {
      // Hull panels: mix of off-white and light gray, subtle brightness variance
      const base = r > 0.72 ? grayBase : hullBase;
      const tint = base.clone().offsetHSL(0, 0, (r - 0.5) * 0.08);
      // Occasional dark accent panel
      const accent = r > 0.93 ? trussCol.clone() : tint;
      mat = new THREE.MeshStandardMaterial({
        color: accent,
        metalness: 0.7 + r * 0.2,
        roughness: 0.35 + r * 0.3, // brushed aluminum / titanium variance
        envMapIntensity: 1.0,
      });
    }

    // Preserve any existing normal/AO/roughness maps from the glb if present
    const prev = o.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
    const prevSingle = Array.isArray(prev) ? prev[0] : prev;
    if (prevSingle) {
      if ((prevSingle as any).normalMap) mat.normalMap = (prevSingle as any).normalMap;
      if ((prevSingle as any).aoMap) mat.aoMap = (prevSingle as any).aoMap;
      if ((prevSingle as any).roughnessMap) mat.roughnessMap = (prevSingle as any).roughnessMap;
      if ((prevSingle as any).metalnessMap) mat.metalnessMap = (prevSingle as any).metalnessMap;
    }

    o.material = mat;
  });
}

function Ship() {
  const { scene } = useGLTF(shipAsset.url) as unknown as { scene: THREE.Group };

  const prepared = useMemo(() => {
    const c = scene.clone(true);

    // Normalize scale + recenter to true bbox center (pivot = center of mass approx)
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const norm = 1 / (Math.max(size.x, size.y, size.z) || 1);
    c.scale.setScalar(norm);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.sub(center.multiplyScalar(norm));

    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        o.frustumCulled = true;
      }
    });

    applyEnduranceMaterials(c);
    return c;
  }, [scene]);

  const group = useRef<THREE.Group>(null!);
  const spinner = useRef<THREE.Group>(null!);
  const DUR = 26;

  // 1.5 RPM ≈ 0.157 rad/s — realistic artificial-gravity spin rate
  const SPIN = (1.5 * 2 * Math.PI) / 60;

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = (t % DUR) / DUR;
    const x = 5 - p * 10;
    const y = Math.sin(p * Math.PI) * 0.3 - 0.2;
    const z = -2 + p * 3;
    const s = 1.2 + p * 3.2;
    if (group.current) {
      group.current.position.set(x, y, z);
      group.current.scale.setScalar(s);
    }
    if (spinner.current) {
      // Rotate the entire spacecraft as one rigid body around longitudinal axis.
      // Clockwise when viewed from +Z (after the X-axis pre-rotation this is the ship's own central axis).
      spinner.current.rotation.z -= dt * SPIN;
    }
  });

  return (
    <group ref={group}>
      <group ref={spinner} rotation={[Math.PI / 2, 0, 0]}>
        <Clone object={prepared} />
      </group>
    </group>
  );
}

export function HeroShipScene({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [dprMax, setDprMax] = useState(1.5);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (visible) useGLTF.preload(shipAsset.url);
  }, [visible]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      {visible && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, dprMax]}
          frameloop={visible ? "always" : "demand"}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
        >
          <PerformanceMonitor
            onDecline={() => setDprMax((d) => Math.max(1, d - 0.25))}
            onIncline={() => setDprMax((d) => Math.min(2, d + 0.25))}
          />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          {/* Sun: strong crisp directional key light */}
          <directionalLight position={[6, 3, 4]} intensity={3.2} color="#fff4e6" />
          {/* Cool fill from planet/earthshine */}
          <directionalLight position={[-5, -2, 1]} intensity={0.35} color="#8fb4ff" />
          <ambientLight intensity={0.08} />
          <Suspense fallback={null}>
            <Ship />
            {/* Env map drives realistic metallic reflections */}
            <Environment preset="city" background={false} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
