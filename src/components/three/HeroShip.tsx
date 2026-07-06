import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import shipAsset from "@/assets/endurance_hifi.glb.asset.json";

useGLTF.preload(shipAsset.url);

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
    return c;
  }, [scene]);

  const group = useRef<THREE.Group>(null!);
  const spinner = useRef<THREE.Group>(null!);
  const DUR = 26; // slow

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = (t % DUR) / DUR; // 0 → 1
    // Right → left translation
    const x = 5 - p * 10;
    const y = Math.sin(p * Math.PI) * 0.3 - 0.2;
    // Move slightly closer to camera as it moves left (bigger)
    const z = -2 + p * 3;
    // Bigger on the left
    const s = 1.2 + p * 3.2;
    if (group.current) {
      group.current.position.set(x, y, z);
      group.current.scale.setScalar(s);
    }
    // Clockwise spin around its ring axis (viewed from front → negative Z rotation)
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
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 4]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#b6d0ff" />
      <hemisphereLight args={["#b6d0ff", "#0a0f1c", 0.4]} />
      <Suspense fallback={null}>
        <Ship />
      </Suspense>
    </Canvas>
  );
}
