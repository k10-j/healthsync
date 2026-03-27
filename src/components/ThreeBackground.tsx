import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingOrb({
  position, color, speed, distort, scale, opacity = 0.18,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
  scale: number;
  opacity?: number;
}) {
  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={1.4}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 48, 48]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={1.8}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.025;
    ref.current.rotation.x = state.clock.elapsedTime * 0.012;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(
    () => new THREE.PointsMaterial({ size: 0.07, color: "#0d9488", transparent: true, opacity: 0.5, sizeAttenuation: true }),
    []
  );

  return <points ref={ref} geometry={geo} material={mat} />;
}

function RingMesh({
  position, rotation, color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.18;
    ref.current.rotation.x = state.clock.elapsedTime * 0.09;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <torusGeometry args={[1.5, 0.035, 16, 80]} />
      <meshStandardMaterial color={color} transparent opacity={0.22} metalness={0.6} roughness={0.2} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ccfbf1" />
      <pointLight position={[-4, -4, -4]} intensity={0.5} color="#0d9488" />
      <pointLight position={[4, -2, 2]} intensity={0.4} color="#06b6d4" />

      {/* Teal / cyan orbs — visible but subtle on white */}
      <FloatingOrb position={[-4.5, 2.5, -4]} color="#0d9488" speed={0.5} distort={0.45} scale={2.2} opacity={0.22} />
      <FloatingOrb position={[4.5, -2.5, -5]} color="#06b6d4" speed={0.35} distort={0.38} scale={2.6} opacity={0.18} />
      <FloatingOrb position={[0.5, -4, -6]} color="#14b8a6" speed={0.6} distort={0.55} scale={1.8} opacity={0.15} />
      <FloatingOrb position={[-3, -1, -3]} color="#0891b2" speed={0.45} distort={0.3} scale={1.3} opacity={0.2} />
      <FloatingOrb position={[3.5, 3.5, -4]} color="#2dd4bf" speed={0.7} distort={0.42} scale={1.5} opacity={0.16} />

      <RingMesh position={[-2.5, 1.5, -3]} rotation={[0.5, 0.3, 0]} color="#0d9488" />
      <RingMesh position={[3, -1.5, -4]} rotation={[1.1, 0.5, 0.3]} color="#06b6d4" />
      <RingMesh position={[0, 2.5, -5]} rotation={[0.2, 1.0, 0.5]} color="#14b8a6" />

      <ParticleField />
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
