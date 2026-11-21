import { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const YELLOW = '#fcee0a';
const CYAN = '#00f0ff';
const PINK = '#ff2a6d';

// The camera flies this far down the street while the page scrolls from top to bottom.
const LENGTH = 86;
const PER_SIDE = 44;
const STEP = 2.15;

// Same numbers every load, so the city never changes between visits.
const rnd = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function Rig({ scroll, still }) {
  useFrame((state, dt) => {
    const cam = state.camera;
    const px = still ? 0 : state.pointer.x;
    const py = still ? 0 : state.pointer.y;
    cam.position.z = THREE.MathUtils.damp(cam.position.z, 7 - scroll.current * LENGTH, 4, dt);
    cam.position.x = THREE.MathUtils.damp(cam.position.x, px * 0.8, 3, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.8 + py * 0.35, 3, dt);
    cam.lookAt(cam.position.x * 0.5, 2.1, cam.position.z - 12);
  });
  return null;
}

function City() {
  const { blocks, gates, dashes } = useMemo(() => {
    const blocks = [];
    let id = 0;
    for (const side of [-1, 1]) {
      for (let i = 0; i < PER_SIDE; i += 1) {
        id += 1;
        const w = 1.3 + rnd(id + 3) * 2;
        const d = 1.4 + rnd(id + 5) * 1.6;
        const h = 2.5 + rnd(id + 7) * rnd(id + 9) * 17 + rnd(id + 2) * 2;
        blocks.push({
          x: side * (3.6 + rnd(id + 11) * 4 + w / 2),
          z: 9 - i * STEP - rnd(id) * 0.7,
          w,
          d,
          h,
          side,
          color: rnd(id + 13) > 0.5 ? CYAN : YELLOW,
          strips: [0.25 + rnd(id + 17) * 0.2, 0.6 + rnd(id + 19) * 0.3].map((t) => t * h),
        });
      }
    }
    const gates = Array.from({ length: 6 }, (_, i) => ({ z: -10 - i * 15, color: i % 2 ? YELLOW : CYAN }));
    const dashes = Array.from({ length: 36 }, (_, i) => 6 - i * 3);
    return { blocks, gates, dashes };
  }, []);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -42]}>
        <planeGeometry args={[7, 150]} />
        <meshBasicMaterial color="#04050a" />
      </mesh>
      <gridHelper args={[220, 220, CYAN, '#0d2a4d']} position={[0, 0, -40]} material-transparent material-opacity={0.32} />

      {dashes.map((z) => (
        <mesh key={z} rotation-x={-Math.PI / 2} position={[0, 0.01, z]}>
          <planeGeometry args={[0.18, 1.3]} />
          <meshBasicMaterial color={YELLOW} />
        </mesh>
      ))}

      {blocks.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.h / 2, b.z]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color="#080a14" roughness={0.7} metalness={0.3} />
            <Edges color={b.color} threshold={15} />
          </mesh>
          {b.strips.map((y, j) => (
            <mesh key={j} position={[b.x - b.side * (b.w / 2 + 0.02), y, b.z]} rotation-y={-b.side * (Math.PI / 2)}>
              <planeGeometry args={[b.d * 0.8, 0.12]} />
              <meshBasicMaterial color={j ? PINK : b.color} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}

      {gates.map((g) => (
        <mesh key={g.z} position={[0, 3.2, g.z]}>
          <torusGeometry args={[3.1, 0.05, 8, 64]} />
          <meshBasicMaterial color={g.color} />
        </mesh>
      ))}

      <Sparkles count={260} scale={[26, 14, 120]} position={[0, 6, -40]} size={2.5} speed={0.4} color={CYAN} />
      <Sparkles count={90} scale={[26, 14, 120]} position={[0, 6, -40]} size={4} speed={0.5} color={YELLOW} />
    </>
  );
}

export default function Scene({ scroll }) {
  const still = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.8, 7], fov: 62, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
    >
      <fog attach="fog" args={['#05060a', 10, 58]} />
      <hemisphereLight args={['#6a7bff', '#05060a', 0.9]} />
      <directionalLight position={[2, 8, 4]} intensity={0.8} />
      <Rig scroll={scroll} still={still} />
      <City />
    </Canvas>
  );
}
