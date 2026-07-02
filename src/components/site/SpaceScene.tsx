import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const TEX_BASE = "https://unpkg.com/three@0.160.0/examples/textures/planets";

function Earth({ position = [2.4, -0.2, 0] as [number, number, number] }) {
  const [colorMap, normalMap, specMap, cloudMap] = useLoader(THREE.TextureLoader, [
    `${TEX_BASE}/earth_atmos_2048.jpg`,
    `${TEX_BASE}/earth_normal_2048.jpg`,
    `${TEX_BASE}/earth_specular_2048.jpg`,
    `${TEX_BASE}/earth_clouds_1024.png`,
  ]);
  const earth = useRef<THREE.Mesh>(null!);
  const clouds = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.03;
    if (clouds.current) clouds.current.rotation.y += dt * 0.04;
  });
  return (
    <group position={position} rotation={[0.22, 0, 0.18]}>
      <mesh ref={earth}>
        <sphereGeometry args={[2, 96, 96]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specMap}
          specular={new THREE.Color("#333")}
          shininess={14}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[2.03, 96, 96]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh scale={2.28}>
        <sphereGeometry args={[1, 64, 64]} />
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
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 2.6);
              gl_FragColor = vec4(0.32, 0.55, 1.0, f * 0.55); }`}
        />
      </mesh>
    </group>
  );
}

function Spaceship() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.04;
    if (!ref.current) return;
    ref.current.position.set(Math.cos(t) * 5.5 - 1, Math.sin(t * 0.6) * 1.2, Math.sin(t) * 4 - 1);
    ref.current.rotation.y = t + Math.PI / 2;
    ref.current.rotation.z += 0.002;
  });
  return (
    <group ref={ref} scale={0.14}>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.55, 0.32, 0.32]} />
            <meshStandardMaterial color="#c8c8d0" metalness={0.75} roughness={0.35} />
          </mesh>
        );
      })}
      <mesh>
        <cylinderGeometry args={[0.14, 0.14, 0.45, 16]} />
        <meshStandardMaterial color="#8b8b92" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Full-bleed cinematic space scene — Earth + drifting spaceship + starfield. */
export function SpaceScene({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden />;
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.08} />
        <directionalLight position={[6, 2, 4]} intensity={2.4} color="#fff5e6" />
        <Suspense fallback={null}>
          <Stars radius={90} depth={50} count={5000} factor={3} saturation={0} fade speed={0.3} />
          <Earth />
          <Spaceship />
        </Suspense>
      </Canvas>
    </div>
  );
}

function BlackHoleMesh() {
  const disk = useRef<THREE.Mesh>(null!);
  const disk2 = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.18;
    if (disk2.current) disk2.current.rotation.z -= dt * 0.11;
  });
  return (
    <group rotation={[Math.PI / 2 - 0.35, 0, 0]}>
      {/* Event horizon */}
      <mesh>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Photon ring */}
      <mesh>
        <ringGeometry args={[0.92, 0.98, 128]} />
        <meshBasicMaterial color="#ffd9a8" side={THREE.DoubleSide} transparent opacity={0.95} />
      </mesh>
      {/* Main accretion disk */}
      <mesh ref={disk}>
        <ringGeometry args={[1.02, 2.8, 256]} />
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          vertexShader={`varying vec2 vUv; void main(){ vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`
            varying vec2 vUv;
            void main(){
              vec2 c = vUv - 0.5;
              float r = length(c) * 2.0;
              float ang = atan(c.y, c.x);
              float bright = smoothstep(0.0, 0.12, r) * (1.0 - smoothstep(0.55, 1.0, r));
              float streak = 0.55 + 0.45 * sin(ang * 42.0 + r * 24.0);
              float dust = 0.7 + 0.3 * sin(ang * 6.0 - r * 3.0);
              vec3 warm = mix(vec3(1.0, 0.5, 0.12), vec3(1.0, 0.88, 0.6), 1.0 - r);
              gl_FragColor = vec4(warm * bright * streak * dust, bright * 0.95);
            }`}
        />
      </mesh>
      {/* Perpendicular arc for the warped Gargantua look */}
      <mesh ref={disk2} rotation={[0.42, 0, 0]}>
        <ringGeometry args={[1.15, 2.3, 256]} />
        <meshBasicMaterial
          color="#ff9445"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Interstellar-style black hole rendered with Three.js. */
export function BlackHoleScene({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden />;
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.7, 5], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Stars radius={60} depth={30} count={2500} factor={2} saturation={0} fade speed={0.2} />
          <BlackHoleMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}
