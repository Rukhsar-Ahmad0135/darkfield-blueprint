import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared cinematic canvas wrapper                                           */
/* ────────────────────────────────────────────────────────────────────────── */

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  cameraZ?: number;
  fov?: number;
  bloomIntensity?: number;
  grain?: number;
};

export function SceneCanvas({
  children,
  className = "",
  cameraZ = 6,
  fov = 42,
  bloomIntensity = 0.7,
  grain = 0.035,
}: SceneCanvasProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden />;
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <Suspense fallback={null}>
          {children}
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.75}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.0006, 0.0009)}
              radialModulation={false}
              modulationOffset={0}
            />
            <Vignette eskil={false} offset={0.15} darkness={0.85} />
            <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={grain} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Wormhole — spherical distortion shader with parallax starfield inside     */
/* ────────────────────────────────────────────────────────────────────────── */

const WORMHOLE_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  uniform float uTime;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1))) * 45758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
  }

  void main(){
    // Warp UVs radially and swirl over time — the "lensed sphere" look
    vec2 c = vUv - 0.5;
    float r = length(c);
    float a = atan(c.y, c.x);
    a += (0.6 / max(r, 0.15)) * sin(uTime * 0.25 + r * 12.0) * 0.35;
    a += uTime * 0.05;
    vec2 warped = vec2(cos(a), sin(a)) * r;

    // Star field inside the sphere: bright specks in a noise mask
    float n = noise(warped * 240.0 + uTime * 0.6);
    float stars = smoothstep(0.965, 1.0, n);
    // Dust bands
    float bands = 0.5 + 0.5 * sin(warped.y * 22.0 + uTime * 0.4);
    float dust = smoothstep(0.4, 0.9, noise(warped * 6.0 + uTime * 0.05)) * 0.25 * bands;

    // Rim: Fresnel from camera vector
    vec3 N = normalize(vN);
    vec3 V = normalize(vP);
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.5);

    vec3 rim = mix(vec3(0.15, 0.35, 0.9), vec3(1.0, 0.55, 0.2), 0.5 + 0.5 * sin(uTime * 0.3));
    vec3 col = vec3(stars) * vec3(1.0, 0.92, 0.85);
    col += dust * vec3(0.6, 0.4, 0.9);
    col += rim * fres * 1.2;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const WORMHOLE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main(){
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    vP = -p.xyz;
    gl_Position = projectionMatrix * p;
  }
`;

function WormholeSphere() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const grp = useRef<THREE.Group>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value = s.clock.elapsedTime;
    if (grp.current) grp.current.rotation.y += dt * 0.04;
  });
  return (
    <group ref={grp}>
      <mesh>
        <sphereGeometry args={[2.2, 128, 128]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={WORMHOLE_VERT}
          fragmentShader={WORMHOLE_FRAG}
        />
      </mesh>
      {/* Outer halo */}
      <mesh scale={1.15}>
        <sphereGeometry args={[2.2, 48, 48]} />
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
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 3.0);
              gl_FragColor = vec4(0.6, 0.45, 1.0, f * 0.35); }`}
        />
      </mesh>
    </group>
  );
}

export function WormholeScene({ className = "" }: { className?: string }) {
  return (
    <SceneCanvas className={className} cameraZ={6.5} fov={38} bloomIntensity={0.9}>
      <ambientLight intensity={0.1} />
      <Stars radius={140} depth={70} count={5000} factor={3} saturation={0} fade speed={0.1} />
      <WormholeSphere />
    </SceneCanvas>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tesseract — nested rotating wireframe hypercube (Cooper's tesseract)      */
/* ────────────────────────────────────────────────────────────────────────── */

function TesseractRig() {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (outer.current) {
      outer.current.rotation.x += dt * 0.08;
      outer.current.rotation.y += dt * 0.1;
    }
    if (inner.current) {
      inner.current.rotation.x -= dt * 0.13;
      inner.current.rotation.z += dt * 0.09;
    }
  });

  // Line material for the wireframe cubes
  const edgeMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: new THREE.Color("#ffb066"), transparent: true, opacity: 0.85 }),
    [],
  );
  const edgeMatDim = useMemo(
    () => new THREE.LineBasicMaterial({ color: new THREE.Color("#4d5f9a"), transparent: true, opacity: 0.55 }),
    [],
  );

  const cubes = useMemo(() => {
    const sizes = [3.6, 2.8, 2.0, 1.3, 0.7];
    return sizes.map((s, i) => {
      const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s, s));
      return { geo, mat: i % 2 === 0 ? edgeMat : edgeMatDim, key: i };
    });
  }, [edgeMat, edgeMatDim]);

  return (
    <group>
      <group ref={outer}>
        {cubes.slice(0, 3).map(({ geo, mat, key }) => (
          <lineSegments key={key} args={[geo, mat]} />
        ))}
      </group>
      <group ref={inner}>
        {cubes.slice(3).map(({ geo, mat, key }) => (
          <lineSegments key={key} args={[geo, mat]} />
        ))}
        {/* Central glow */}
        <mesh>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshBasicMaterial color="#ffe0b2" />
        </mesh>
        <pointLight intensity={2.4} color="#ffb066" distance={6} />
      </group>
    </group>
  );
}

export function TesseractScene({ className = "" }: { className?: string }) {
  return (
    <SceneCanvas className={className} cameraZ={7} fov={40} bloomIntensity={1.2}>
      <ambientLight intensity={0.15} />
      <Stars radius={90} depth={40} count={3000} factor={2.4} saturation={0} fade speed={0.06} />
      <TesseractRig />
    </SceneCanvas>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Distant Gargantua — small backdrop version for inner pages                */
/* ────────────────────────────────────────────────────────────────────────── */

function DistantHole() {
  const disk = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.05;
  });
  return (
    <group position={[3.4, -0.4, 0]} rotation={[Math.PI / 2.1, 0, 0.3]}>
      <mesh>
        <sphereGeometry args={[0.6, 48, 48]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh>
        <ringGeometry args={[0.62, 0.66, 128]} />
        <meshBasicMaterial color="#ffe0b2" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={disk}>
        <ringGeometry args={[0.68, 2.0, 128, 1]} />
        <meshBasicMaterial
          color="#ff9c46"
          side={THREE.DoubleSide}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.04, 0.01]} rotation={[-Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[0.9, 0.035, 16, 200, Math.PI]} />
        <meshBasicMaterial
          color="#ffcf8e"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function DistantGargantuaScene({ className = "" }: { className?: string }) {
  return (
    <SceneCanvas className={className} cameraZ={6} fov={45} bloomIntensity={0.9}>
      <ambientLight intensity={0.08} />
      <Stars radius={160} depth={70} count={6000} factor={3.2} saturation={0} fade speed={0.08} />
      <DistantHole />
    </SceneCanvas>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Miller's Water Planet — ocean sphere with wave silhouette                 */
/* ────────────────────────────────────────────────────────────────────────── */

const OCEAN_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  uniform float uTime;

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
    vec3 N = normalize(vN);
    vec3 V = normalize(vP);
    float fres = pow(1.0 - clamp(dot(N,V), 0.0, 1.0), 2.5);

    vec2 uv = vUv * vec2(4.0, 2.0) + vec2(uTime * 0.02, 0.0);
    float w = fbm(uv * 3.0);
    float band = 0.35 + 0.65 * fbm(uv + uTime * 0.05);

    vec3 deep = vec3(0.02, 0.06, 0.11);
    vec3 shallow = vec3(0.18, 0.36, 0.5);
    vec3 col = mix(deep, shallow, w * band);
    col += fres * vec3(0.55, 0.75, 1.0) * 0.9;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function WaterPlanet() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const grp = useRef<THREE.Group>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value = s.clock.elapsedTime;
    if (grp.current) grp.current.rotation.y += dt * 0.02;
  });
  return (
    <group ref={grp} position={[0, -0.2, 0]}>
      <mesh>
        <sphereGeometry args={[2.4, 128, 128]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={WORMHOLE_VERT}
          fragmentShader={OCEAN_FRAG}
        />
      </mesh>
      {/* Wave silhouette in the distance */}
      <mesh position={[0, 0, -0.6]}>
        <torusGeometry args={[2.55, 0.08, 12, 160, Math.PI]} />
        <meshBasicMaterial color="#1a2530" />
      </mesh>
      {/* Atmospheric halo */}
      <mesh scale={1.1}>
        <sphereGeometry args={[2.4, 48, 48]} />
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
            void main(){ float f = pow(1.0 - dot(normalize(vN), normalize(vP)), 2.5);
              gl_FragColor = vec4(0.6, 0.85, 1.0, f * 0.5); }`}
        />
      </mesh>
    </group>
  );
}

export function WaterPlanetScene({ className = "" }: { className?: string }) {
  return (
    <SceneCanvas className={className} cameraZ={6.5} fov={38} bloomIntensity={0.55}>
      <ambientLight intensity={0.15} />
      <directionalLight position={[6, 3, 4]} intensity={1.4} color="#e8f0ff" />
      <Stars radius={140} depth={60} count={4000} factor={2.6} saturation={0} fade speed={0.08} />
      <WaterPlanet />
    </SceneCanvas>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Dust field — Cooper's cornfield dust motes (careers)                      */
/* ────────────────────────────────────────────────────────────────────────── */

function DustField({ count = 1200 }: { count?: number }) {
  const pts = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    if (!pts.current) return;
    pts.current.rotation.y += dt * 0.02;
    const pos = pts.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += dt * 0.08;
      if (pos.array[i * 3 + 1] > 5) pos.array[i * 3 + 1] = -5;
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8b878"
        size={0.035}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function DustFieldScene({ className = "" }: { className?: string }) {
  return (
    <SceneCanvas className={className} cameraZ={7} fov={45} bloomIntensity={0.5} grain={0.05}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 2, 3]} intensity={1.2} color="#f4c98a" />
      <Stars radius={100} depth={40} count={1600} factor={1.8} saturation={0} fade speed={0.05} />
      <DustField />
    </SceneCanvas>
  );
}
