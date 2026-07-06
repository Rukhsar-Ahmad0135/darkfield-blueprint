import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Clone, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import shipAsset from "@/assets/endurance_hifi.glb.asset.json";

function Ship() {
  const { scene } = useGLTF(shipAsset.url) as unknown as { scene: THREE.Group };
  const prepared = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const norm = 1 / (Math.max(size.x, size.y, size.z) || 1);
    c.scale.setScalar(norm);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.sub(center.multiplyScalar(norm));
    // Drop shadow cost
    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        o.frustumCulled = true;
      }
    });
    return c;
  }, [scene]);

  const group = useRef<THREE.Group>(null!);
  const spinner = useRef<THREE.Group>(null!);
  const DUR = 26;

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
      spinner.current.rotation.z -= dt * 0.6;
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

  // Only mount canvas when in viewport
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

  // Preload GLB only when the section is near viewport
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
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
        >
          <PerformanceMonitor
            onDecline={() => setDprMax((d) => Math.max(1, d - 0.25))}
            onIncline={() => setDprMax((d) => Math.min(2, d + 0.25))}
          />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 3, 4]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#b6d0ff" />
          <hemisphereLight args={["#b6d0ff", "#0a0f1c", 0.4]} />
          <Suspense fallback={null}>
            <Ship />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
