import { useFrame } from "@react-three/fiber";
import { Stars, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SceneCanvas } from "./InterstellarScenes";
import enduranceAsset from "@/assets/endurance.glb.asset.json";

useGLTF.preload(enduranceAsset.url);

/** Global normalized scroll (0..1) shared across scene rigs. */
const scrollRef = { current: 0 };
let scrollBound = false;
function useScrollProgress() {
  useEffect(() => {
    if (scrollBound || typeof window === "undefined") return;
    scrollBound = true;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / max));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return scrollRef;
}

/**
 * Photoreal black hole ported from VoXelo's CodePen (wBKvJxd):
 *  - Kerr-style tilted accretion disk with simplex-noise turbulence & spiral flow
 *  - Event-horizon fresnel glow with pulse
 *  - Solid black hole sphere
 * Lensing/chromatic-aberration post-pass is skipped; SceneCanvas Bloom handles glow.
 */

const BLACK_HOLE_RADIUS = 1.3;
const DISK_INNER_RADIUS = BLACK_HOLE_RADIUS + 0.2;
const DISK_OUTER_RADIUS = 8.0;
const DISK_TILT = Math.PI / 3.0;

/* ── Accretion disk shader ────────────────────────────────────────────── */

const DISK_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vRadius;
  varying float vAngle;
  void main() {
    vUv = uv;
    vRadius = length(position.xy);
    vAngle = atan(position.y, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISK_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorHot;
  uniform vec3 uColorMid1;
  uniform vec3 uColorMid2;
  uniform vec3 uColorMid3;
  uniform vec3 uColorOuter;
  uniform float uNoiseScale;
  uniform float uFlowSpeed;
  uniform float uDensity;
  uniform float uInner;
  uniform float uOuter;

  varying vec2 vUv;
  varying float vRadius;
  varying float vAngle;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float normalizedRadius = smoothstep(uInner, uOuter, vRadius);

    float spiral = vAngle * 3.0 - (1.0 / (normalizedRadius + 0.1)) * 2.0;
    vec2 noiseUv = vec2(
      vUv.x + uTime * uFlowSpeed * (2.0 / (vRadius * 0.3 + 1.0)) + sin(spiral) * 0.1,
      vUv.y * 0.8 + cos(spiral) * 0.1
    );
    float n1 = snoise(vec3(noiseUv * uNoiseScale, uTime * 0.15));
    float n2 = snoise(vec3(noiseUv * uNoiseScale * 3.0 + 0.8, uTime * 0.22));
    float n3 = snoise(vec3(noiseUv * uNoiseScale * 6.0 + 1.5, uTime * 0.3));
    float noiseVal = (n1 * 0.45 + n2 * 0.35 + n3 * 0.2);
    noiseVal = (noiseVal + 1.0) * 0.5;

    vec3 color = uColorOuter;
    color = mix(color, uColorMid3, smoothstep(0.0, 0.25, normalizedRadius));
    color = mix(color, uColorMid2, smoothstep(0.2, 0.55, normalizedRadius));
    color = mix(color, uColorMid1, smoothstep(0.5, 0.75, normalizedRadius));
    color = mix(color, uColorHot,  smoothstep(0.7, 0.95, normalizedRadius));

    color *= (0.5 + noiseVal * 1.0);
    float brightness = pow(1.0 - normalizedRadius, 1.0) * 3.5 + 0.5;
    brightness *= (0.3 + noiseVal * 2.2);

    float pulse = sin(uTime * 1.8 + normalizedRadius * 12.0 + vAngle * 2.0) * 0.15 + 0.85;
    brightness *= pulse;

    float alpha = uDensity * (0.2 + noiseVal * 0.9);
    alpha *= smoothstep(0.0, 0.15, normalizedRadius);
    alpha *= (1.0 - smoothstep(0.85, 1.0, normalizedRadius));
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(color * brightness, alpha);
  }
`;

/* ── Event horizon glow shader ────────────────────────────────────────── */

const EH_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EH_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCameraPosition;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDirection = normalize(uCameraPosition - vPosition);
    float fresnel = 1.0 - abs(dot(vNormal, viewDirection));
    fresnel = pow(fresnel, 2.5);
    vec3 glowColor = vec3(1.0, 0.4, 0.1);
    float pulse = sin(uTime * 2.5) * 0.15 + 0.85;
    gl_FragColor = vec4(glowColor * fresnel * pulse, fresnel * 0.4);
  }
`;

function BlackHoleRig({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const diskRef = useRef<THREE.Mesh>(null!);
  const diskMat = useRef<THREE.ShaderMaterial>(null!);
  const ehMat = useRef<THREE.ShaderMaterial>(null!);
  const smoothScroll = useRef(0);
  useScrollProgress();

  const diskUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Warm monochrome amber — Interstellar Gargantua palette, no rainbow
      uColorHot: { value: new THREE.Color(0xfff2d8) },
      uColorMid1: { value: new THREE.Color(0xffcc7a) },
      uColorMid2: { value: new THREE.Color(0xffa347) },
      uColorMid3: { value: new THREE.Color(0xd06a1a) },
      uColorOuter: { value: new THREE.Color(0x6a2f08) },
      uNoiseScale: { value: 2.5 },
      uFlowSpeed: { value: 0.22 },
      uDensity: { value: 1.3 },
      uInner: { value: DISK_INNER_RADIUS },
      uOuter: { value: DISK_OUTER_RADIUS },
    }),
    [],
  );

  const ehUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
    }),
    [],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    // ease scroll toward target for smooth compress/decompress
    const target = scrollRef.current;
    smoothScroll.current += (target - smoothScroll.current) * Math.min(1, dt * 4);
    const s = smoothScroll.current; // 0..1

    if (diskMat.current) {
      diskMat.current.uniforms.uTime.value = t;
      // Ring decompresses (spreads out) on scroll down, compresses on scroll up
      diskMat.current.uniforms.uOuter.value = DISK_OUTER_RADIUS * (1 + s * 0.9);
      diskMat.current.uniforms.uInner.value = DISK_INNER_RADIUS * (1 - s * 0.25);
      diskMat.current.uniforms.uNoiseScale.value = 2.5 * (1 - s * 0.55);
      diskMat.current.uniforms.uFlowSpeed.value = 0.22 * (1 + s * 1.4);
    }
    if (ehMat.current) {
      ehMat.current.uniforms.uTime.value = t;
      ehMat.current.uniforms.uCameraPosition.value.copy(state.camera.position);
    }
    // Disk rotates slowly and visibly at all times
    if (diskRef.current) diskRef.current.rotation.z += dt * (0.12 + s * 0.15);
    if (groupRef.current) {
      // Whole scene stretches outward — the "space decompression"
      const scl = scale * (1 + s * 0.6);
      groupRef.current.scale.setScalar(scl);
      // Slow continuous yaw so rotation is obvious
      groupRef.current.rotation.y = s * 0.4 + t * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Solid black core */}
      <mesh renderOrder={0}>
        <sphereGeometry args={[BLACK_HOLE_RADIUS, 128, 64]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>

      {/* Event horizon fresnel glow */}
      <mesh>
        <sphereGeometry args={[BLACK_HOLE_RADIUS * 1.05, 128, 64]} />
        <shaderMaterial
          ref={ehMat}
          uniforms={ehUniforms}
          vertexShader={EH_VERT}
          fragmentShader={EH_FRAG}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Tilted accretion disk — geometry sized generously; shader controls visible radii */}
      <mesh ref={diskRef} rotation={[DISK_TILT, 0, 0]} renderOrder={1}>
        <ringGeometry args={[DISK_INNER_RADIUS * 0.6, DISK_OUTER_RADIUS * 2.0, 256, 128]} />
        <shaderMaterial
          ref={diskMat}
          uniforms={diskUniforms}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function StarField() {
  const ref = useRef<THREE.Group>(null!);
  const smooth = useRef(0);
  useFrame((_, dt) => {
    const target = scrollRef.current;
    smooth.current += (target - smooth.current) * Math.min(1, dt * 4);
    if (ref.current) {
      // Stars pull outward on scroll (space decompresses), inward on scroll up
      const s = 1 + smooth.current * 1.2;
      ref.current.scale.setScalar(s);
      ref.current.rotation.z = smooth.current * 0.2;
    }
  });
  return (
    <group ref={ref}>
      <Stars radius={300} depth={120} count={9000} factor={4} saturation={0} fade speed={0.08} />
    </group>
  );
}

export function VoxeloBlackHoleScene({
  className = "",
  scale = 1,
  cameraZ = 12,
}: {
  className?: string;
  scale?: number;
  cameraZ?: number;
}) {
  return (
    <SceneCanvas className={className} cameraZ={cameraZ} fov={60} bloomIntensity={0.9}>
      <ambientLight intensity={0.05} />
      <StarField />
      <BlackHoleRig scale={scale} />
    </SceneCanvas>
  );
}

