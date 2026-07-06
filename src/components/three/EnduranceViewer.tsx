import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import enduranceAsset from "@/assets/endurance.glb.asset.json";

useGLTF.preload(enduranceAsset.url);

function Endurance() {
  const { scene } = useGLTF(enduranceAsset.url) as any;
  const ref = useRef<THREE.Group>(null);

  const cloned = scene.clone(true);
  const box = new THREE.Box3().setFromObject(cloned);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const s = 3.2 / maxDim;
  cloned.position.sub(center);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.15;
  });

  return (
    <group ref={ref} scale={s}>
      <primitive object={cloned} />
    </group>
  );
}

export function EnduranceViewer() {
  return (
    <Canvas
      camera={{ position: [4, 1.5, 5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#88aaff" />
      <Suspense fallback={null}>
        <Endurance />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={12}
        autoRotate={false}
      />
    </Canvas>
  );
}
