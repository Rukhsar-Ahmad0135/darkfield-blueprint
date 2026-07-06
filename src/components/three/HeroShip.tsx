import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import shipAsset from "@/assets/endurance_hero.glb.asset.json";

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
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = new THREE.MeshStandardMaterial({
          color: "#cfd3d9",
          metalness: 0.85,
          roughness: 0.35,
          emissive: new THREE.Color("#0b1220"),
          emissiveIntensity: 0.2,
        });
      }
    });
    return c;
  }, [scene]);

  const group = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Group>(null!);
  const DUR = 16;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = (t % DUR) / DUR; // 0 → 1
    // Right to left translation
    const x = 4 - p * 8;
    // Circular vertical motion (loop-de-loop) while translating
    const angle = p * Math.PI * 2;
    const y = Math.sin(angle) * 1.2;
    const z = -6 + p * 8 + Math.cos(angle) * 0.8;
    const s = 0.8 + p * 2.4;
    if (group.current) {
      group.current.position.set(x, y, z);
      group.current.scale.setScalar(s);
      // Face along path (tangent), no self-spin
      group.current.rotation.y = 0.25 - p * 0.4;
      group.current.rotation.z = angle;
    }
    if (ring.current) ring.current.rotation.z = t * 0.4;
  });


  return (
    <group ref={group}>
      <group ref={ring}>
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 4]} intensity={2.4} color="#ffffff" />
      <hemisphereLight args={["#b6d0ff", "#0a0f1c", 0.35]} />
      <Suspense fallback={null}>
        <Ship />
      </Suspense>
    </Canvas>
  );
}
