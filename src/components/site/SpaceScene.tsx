import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const TEX_BASE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets";

/* -------------------------------------------------------------------------- */
/*  EARTH — photoreal, slow rotation, atmospheric rim light                   */
/* -------------------------------------------------------------------------- */
function Earth({ position = [2.8, -0.4, 0] as [number, number, number] }) {
  const [colorMap, normalMap, specMap, cloudMap] = useLoader(THREE.TextureLoader, [
    `${TEX_BASE}/earth_atmos_2048.jpg`,
    `${TEX_BASE}/earth_normal_2048.jpg`,
    `${TEX_BASE}/earth_specular_2048.jpg`,
    `${TEX_BASE}/earth_clouds_1024.png`,
  ]);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const earth = useRef<THREE.Mesh>(null!);
  const clouds = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.012;
    if (clouds.current) clouds.current.rotation.y += dt * 0.018;
  });
  return (
    <group position={position} rotation={[0.32, 0, 0.22]}>
      <mesh ref={earth}>
        <sphereGeometry args={[2.2, 128, 128]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specMap}
          specular={new THREE.Color("#2a2a2a")}
          shininess={9}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[2.235, 128, 128]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {/* Atmospheric fresnel */}
      <mesh scale={2.55}>
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
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 3.0);
              gl_FragColor = vec4(0.28, 0.52, 1.0, f * 0.6); }`}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  ENDURANCE — Interstellar-accurate ring spacecraft                         */
/*  12 modules on a torus + central hub + landers + docking arms              */
/* -------------------------------------------------------------------------- */
function Endurance() {
  const root = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!root.current) return;
    // Slow, cinematic orbit path — far, drifting past camera
    const p = t * 0.012;
    root.current.position.set(
      Math.cos(p) * 7.5 - 2,
      Math.sin(p * 0.7) * 1.4 + 0.2,
      Math.sin(p) * 5.5 - 3,
    );
    // Face along motion vector, slight bank
    root.current.rotation.set(0.08, p + Math.PI / 2, Math.sin(t * 0.1) * 0.05);
    // The habitation ring spins for artificial gravity
    if (ring.current) ring.current.rotation.z += 0.006;
  });

  // 12 identical hab modules distributed on the ring
  const modules = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <group ref={root} scale={0.22}>
      {/* Habitation ring — 12 modules + connective tube */}
      <group ref={ring}>
        {/* Structural torus (thin backbone) */}
        <mesh>
          <torusGeometry args={[1.4, 0.045, 16, 128]} />
          <meshStandardMaterial color="#9ea0a6" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Modules */}
        {modules.map((i) => {
          const a = (i / 12) * Math.PI * 2;
          const x = Math.cos(a) * 1.4;
          const y = Math.sin(a) * 1.4;
          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, a + Math.PI / 2]}>
              {/* Main can */}
              <mesh>
                <boxGeometry args={[0.42, 0.28, 0.28]} />
                <meshStandardMaterial color="#d4d5d9" metalness={0.7} roughness={0.4} />
              </mesh>
              {/* Panel detail */}
              <mesh position={[0, 0, 0.145]}>
                <boxGeometry args={[0.36, 0.22, 0.005]} />
                <meshStandardMaterial color="#2a2c30" metalness={0.9} roughness={0.5} />
              </mesh>
              {/* Small viewport */}
              <mesh position={[0, 0, 0.15]}>
                <circleGeometry args={[0.035, 24]} />
                <meshStandardMaterial
                  color="#ffb066"
                  emissive="#ff8a3a"
                  emissiveIntensity={0.8}
                  metalness={0}
                  roughness={0.2}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Central hub */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.55, 24]} />
        <meshStandardMaterial color="#b8b9be" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Docking cap */}
      <mesh position={[0, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.18, 16]} />
        <meshStandardMaterial color="#8f9096" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.18, 16]} />
        <meshStandardMaterial color="#8f9096" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* 4 spoke arms hub → ring */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} rotation={[0, 0, a]}>
            <boxGeometry args={[0.02, 1.4, 0.02]} />
            <meshStandardMaterial color="#7a7c82" metalness={0.9} roughness={0.35} />
          </mesh>
        );
      })}

      {/* Warning nav-light blink */}
      <pointLight position={[0, 0, 0.4]} intensity={0.25} distance={1.2} color="#ff5522" />
    </group>
  );
}

/** Full-bleed cinematic space scene — Earth + Endurance + starfield. */
export function SpaceScene({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden />;
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.06} />
        <directionalLight position={[6, 2, 4]} intensity={2.6} color="#fff2dc" />
        <Suspense fallback={null}>
          <Stars radius={120} depth={60} count={8000} factor={3.4} saturation={0} fade speed={0.15} />
          <Earth />
          <Endurance />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  GARGANTUA — shader-based accretion disk with gravitational lensing feel   */
/* -------------------------------------------------------------------------- */
const GARGANTUA_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  // Hash + smooth noise for hot filaments in the disk
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1))) * 45758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    float ang = atan(c.y, c.x);

    // Radial falloff — bright inner edge tapering to dark outer
    float inner = smoothstep(0.02, 0.08, r - 0.0);
    float outer = 1.0 - smoothstep(0.55, 1.0, r);
    float disk  = inner * outer;

    // Rotating hot filaments (Keplerian shear)
    float shear = 1.0 / max(r, 0.15);
    vec2 pol = vec2(ang * 6.0 + uTime * 0.35 * shear, r * 5.0);
    float filaments = fbm(pol * vec2(1.6, 3.0));
    filaments = pow(filaments, 1.4);

    // Relativistic doppler — one side brighter than the other
    float doppler = 0.55 + 0.45 * cos(ang);

    // Warm color ramp: white-hot inner → amber → deep orange
    vec3 hot   = vec3(1.0, 0.95, 0.82);
    vec3 mid   = vec3(1.0, 0.62, 0.22);
    vec3 cool  = vec3(0.55, 0.18, 0.05);
    vec3 col   = mix(hot, mid, smoothstep(0.05, 0.35, r));
    col        = mix(col, cool, smoothstep(0.35, 0.9, r));

    float I = disk * filaments * (0.55 + doppler);
    // Very bright inner rim (photon-adjacent)
    I += smoothstep(0.11, 0.05, r) * 0.9;

    gl_FragColor = vec4(col * I * 1.4, clamp(I * 1.1, 0.0, 1.0));
  }
`;

const GARGANTUA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

function GargantuaCore() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s) => { if (mat.current) (mat.current.uniforms.uTime.value = s.clock.elapsedTime); });

  return (
    <group>
      {/* Event horizon — perfect black sphere */}
      <mesh>
        <sphereGeometry args={[0.95, 96, 96]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Einstein ring — thin bright photon ring wrapping the shadow */}
      <mesh>
        <ringGeometry args={[0.965, 1.005, 256]} />
        <meshBasicMaterial color="#ffe0b2" side={THREE.DoubleSide} transparent opacity={1} />
      </mesh>

      {/* Accretion disk — near-edge on, shader-lit */}
      <mesh rotation={[Math.PI / 2 - 0.28, 0, 0]}>
        <ringGeometry args={[1.02, 3.2, 512, 1]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={GARGANTUA_VERT}
          fragmentShader={GARGANTUA_FRAG}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Lensed "top arc" that wraps over the sphere — Interstellar signature */}
      <mesh rotation={[Math.PI / 2 - 0.28, 0, 0]} position={[0, 0, 0.001]}>
        <ringGeometry args={[1.02, 1.75, 256, 1, 0, Math.PI)]}>
        </ringGeometry>
        <meshBasicMaterial
          color="#ffb266"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Front lensed arc curving UP over the sphere (fakes gravitational lensing) */}
      <mesh position={[0, 0.02, 0.01]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.35, 0.06, 24, 220, Math.PI]} />
        <meshBasicMaterial
          color="#ffb066"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.06, 0.02]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.55, 0.03, 24, 220, Math.PI]} />
        <meshBasicMaterial
          color="#fff0d6"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Soft outer glow */}
      <mesh>
        <sphereGeometry args={[3.5, 48, 48]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec3 vN; varying vec3 vP;
            void main(){ vN = normalize(normalMatrix * normal);
              vec4 p = modelViewMatrix * vec4(position,1.0); vP = -p.xyz;
              gl_Position = projectionMatrix * p; }`}
          fragmentShader={`varying vec3 vN; varying vec3 vP;
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 3.5);
              gl_FragColor = vec4(1.0, 0.55, 0.2, f * 0.18); }`}
        />
      </mesh>
    </group>
  );
}

/** Interstellar-style Gargantua black hole. */
export function BlackHoleScene({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden />;
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.55, 5.2], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Stars radius={80} depth={40} count={3500} factor={2.2} saturation={0} fade speed={0.12} />
          <GargantuaCore />
        </Suspense>
      </Canvas>
    </div>
  );
}
