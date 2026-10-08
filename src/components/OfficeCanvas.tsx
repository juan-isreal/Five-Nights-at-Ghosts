import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { GhostState, CameraView, GameStatus } from './GameContainer'

interface OfficeCanvasProps {
  ghostPosition: GhostState
  doorClosed: boolean
  flashlightOn: boolean
  panAngle: number
  cameraView: CameraView
  jumpscare: boolean
  gameStatus: GameStatus
}

const STAGE_POS = new THREE.Vector3(0, 1.5, -8)
const CAM2_POS = new THREE.Vector3(-6, 1.5, -5)
const CAM3_POS = new THREE.Vector3(6, 1.5, -5)
const DOOR_POS = new THREE.Vector3(-3.5, 1.5, -0.5)
const WINDOW_POS = new THREE.Vector3(3.5, 1.8, -0.5)

const CAM1_LOOK = new THREE.Vector3(0, 1.5, -8)
const CAM2_LOOK = new THREE.Vector3(-6, 1.5, -5)
const CAM3_LOOK = new THREE.Vector3(6, 1.5, -5)

const GHOST_POSITIONS: Record<GhostState, THREE.Vector3> = {
  0: STAGE_POS,
  1: CAM2_POS,
  2: CAM3_POS,
  3: DOOR_POS,
  4: WINDOW_POS,
}

function Ghost({ position, visible }: { position: THREE.Vector3; visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = position.y + Math.sin(t * 2) * 0.08
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Head */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial
          color="#d0d0e0"
          emissive="#8888aa"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Eyes - glowing emissive */}
      <mesh position={[-0.15, 0.95, 0.32]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.15, 0.95, 0.32]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* Body - cone shape */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <coneGeometry args={[0.45, 1.2, 16]} />
        <meshStandardMaterial
          color="#c0c0d0"
          emissive="#6666aa"
          emissiveIntensity={0.15}
          roughness={0.7}
          metalness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Bottom wisp */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.05, 0.35, 0.4, 16]} />
        <meshStandardMaterial
          color="#a0a0c0"
          emissive="#4444aa"
          emissiveIntensity={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  )
}

function Wall({ position, size, rotation = [0, 0, 0] }: {
  position: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#1a1a22" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

function Floor() {
  return (
    <mesh position={[0, 0, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#0d0d14" roughness={1} metalness={0} />
    </mesh>
  )
}

function Ceiling() {
  return (
    <mesh position={[0, 4, -3]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#0a0a12" roughness={1} metalness={0} />
    </mesh>
  )
}

function DoorFrame() {
  return (
    <group position={[-3.5, 0, -0.5]}>
      {/* Top frame */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.3]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-1.1, 1.6, 0]} castShadow>
        <boxGeometry args={[0.3, 3.2, 0.3]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Right frame */}
      <mesh position={[1.1, 1.6, 0]} castShadow>
        <boxGeometry args={[0.3, 3.2, 0.3]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
    </group>
  )
}

function DoorBarrier({ closed }: { closed: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetY = closed ? 1.6 : 3.5

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.15
  })

  return (
    <mesh ref={meshRef} position={[-3.5, 3.5, -0.4]} castShadow>
      <boxGeometry args={[2.0, 3.0, 0.15]} />
      <meshStandardMaterial
        color="#333344"
        emissive="#222244"
        emissiveIntensity={0.1}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  )
}

function WindowFrame() {
  return (
    <group position={[3.5, 0, -0.5]}>
      {/* Frame top */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[2.0, 0.2, 0.2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Frame bottom */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[2.0, 0.2, 0.2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-1.0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.2, 1.8, 0.2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Right frame */}
      <mesh position={[1.0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.2, 1.8, 0.2]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Glass pane */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.8, 1.6, 0.05]} />
        <meshStandardMaterial
          color="#0a0a18"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  )
}

function StagePlatform() {
  return (
    <group position={[0, 0, -8]}>
      {/* Platform */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#15152a" roughness={0.9} />
      </mesh>
      {/* Curtain left */}
      <mesh position={[-2.2, 2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color="#2a0a0a" roughness={0.95} />
      </mesh>
      {/* Curtain right */}
      <mesh position={[2.2, 2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color="#2a0a0a" roughness={0.95} />
      </mesh>
      {/* Curtain top */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[4.5, 0.3, 3]} />
        <meshStandardMaterial color="#2a0a0a" roughness={0.95} />
      </mesh>
    </group>
  )
}

function CameraMount({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.15, 0]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      {/* Mount arm */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Label is invisible in 3D space but could be used for debugging */}
      <group userData={{ label }} />
    </group>
  )
}

function OfficeRoom() {
  return (
    <group>
      <Floor />
      <Ceiling />
      {/* Back wall */}
      <Wall position={[0, 2, -10]} size={[16, 4, 0.3]} />
      {/* Left wall */}
      <Wall position={[-8, 2, -3]} size={[0.3, 4, 14]} />
      {/* Right wall */}
      <Wall position={[8, 2, -3]} size={[0.3, 4, 14]} />
      {/* Front left wall (with door gap) */}
      <Wall position={[-6, 2, 0.5]} size={[5, 4, 0.3]} />
      {/* Front right wall (with window gap) */}
      <Wall position={[6, 2, 0.5]} size={[5, 4, 0.3]} />
      {/* Door frame */}
      <DoorFrame />
      {/* Window */}
      <WindowFrame />
      {/* Stage area */}
      <StagePlatform />
      {/* Camera mounts */}
      <CameraMount position={[0, 3.8, -9.5]} label="CAM 1" />
      <CameraMount position={[-7, 3.8, -6]} label="CAM 2" />
      <CameraMount position={[7, 3.8, -6]} label="CAM 3" />
    </group>
  )
}

function Flashlight({ on, target }: { on: boolean; target: THREE.Vector3 }) {
  const spotlightRef = useRef<THREE.SpotLight>(null)

  useFrame(() => {
    if (!spotlightRef.current) return
    spotlightRef.current.target.position.copy(target)
    spotlightRef.current.target.updateMatrixWorld()
  })

  return (
    <spotLight
      ref={spotlightRef}
      position={[0, 2.5, 1.5]}
      angle={0.6}
      penumbra={0.5}
      intensity={on ? 8 : 0}
      distance={15}
      decay={1.5}
      color="#ffeecc"
      castShadow
    />
  )
}

function CameraController({
  panAngle,
  cameraView,
  jumpscare,
  ghostPosition,
}: {
  panAngle: number
  cameraView: CameraView
  jumpscare: boolean
  ghostPosition: GhostState
}) {
  const { camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const jumpscareRef = useRef(jumpscare)
  const zoomProgress = useRef(0)

  jumpscareRef.current = jumpscare

  useFrame(() => {
    if (jumpscareRef.current) {
      zoomProgress.current = Math.min(1, zoomProgress.current + 0.04)
      const ghostPos = GHOST_POSITIONS[ghostPosition]
      const targetX = ghostPos.x
      const targetY = ghostPos.y + 1.5
      const targetZ = ghostPos.z + 0.5
      camera.position.x += (targetX - camera.position.x) * 0.2
      camera.position.y += (targetY - camera.position.y) * 0.2
      camera.position.z += (targetZ - camera.position.z) * 0.2
      camera.lookAt(ghostPos.x, ghostPos.y, ghostPos.z)
      cam.fov = 90 - zoomProgress.current * 50
      cam.updateProjectionMatrix()
      return
    }

    zoomProgress.current = 0
    cam.fov = 75
    cam.updateProjectionMatrix()

    if (cameraView === 'office') {
      const targetX = 0
      const targetY = 2.2
      const targetZ = 2.5
      const angleRad = (panAngle * Math.PI) / 180
      camera.position.x += (targetX - camera.position.x) * 0.1
      camera.position.y += (targetY - camera.position.y) * 0.1
      camera.position.z += (targetZ - camera.position.z) * 0.1
      camera.lookAt(
        Math.sin(angleRad) * -3,
        1.8,
        -3 - Math.cos(angleRad) * 3 + 3,
      )
    } else if (cameraView === 'cam1') {
      camera.position.x += (0.5 - camera.position.x) * 0.1
      camera.position.y += (3.5 - camera.position.y) * 0.1
      camera.position.z += (-8.5 - camera.position.z) * 0.1
      camera.lookAt(CAM1_LOOK)
    } else if (cameraView === 'cam2') {
      camera.position.x += (-7.5 - camera.position.x) * 0.1
      camera.position.y += (3.5 - camera.position.y) * 0.1
      camera.position.z += (-5.5 - camera.position.z) * 0.1
      camera.lookAt(CAM2_LOOK)
    } else if (cameraView === 'cam3') {
      camera.position.x += (7.5 - camera.position.x) * 0.1
      camera.position.y += (3.5 - camera.position.y) * 0.1
      camera.position.z += (-5.5 - camera.position.z) * 0.1
      camera.lookAt(CAM3_LOOK)
    }
  })

  return null
}

export default function OfficeCanvas({
  ghostPosition,
  doorClosed,
  flashlightOn,
  panAngle,
  cameraView,
  jumpscare,
  gameStatus,
}: OfficeCanvasProps) {
  const ghostWorldPos = useMemo(() => GHOST_POSITIONS[ghostPosition], [ghostPosition])

  const ghostVisible = useMemo(() => {
    if (gameStatus === 'menu') return false
    if (ghostPosition === 3 && flashlightOn) return true
    if (ghostPosition === 4) return true
    if (cameraView !== 'office') {
      if (cameraView === 'cam1' && ghostPosition === 0) return true
      if (cameraView === 'cam2' && ghostPosition === 1) return true
      if (cameraView === 'cam3' && ghostPosition === 2) return true
    }
    if (flashlightOn && ghostPosition <= 2) return true
    return false
  }, [ghostPosition, flashlightOn, cameraView, gameStatus])

  const flashlightTarget = useMemo(() => {
    if (ghostPosition === 3) return DOOR_POS.clone()
    if (ghostPosition === 4) return WINDOW_POS.clone()
    return new THREE.Vector3(0, 1.5, -5)
  }, [ghostPosition])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.2, 2.5], fov: 75, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 8, 20]} />

      {/* Ambient - very dark */}
      <ambientLight intensity={0.04} color="#222244" />

      {/* Flashlight spotlight */}
      <Flashlight on={flashlightOn} target={flashlightTarget} />

      {/* Subtle light from window */}
      <pointLight
        position={[3.5, 1.8, -0.3]}
        intensity={0.15}
        distance={6}
        color="#3344aa"
      />

      {/* Stage spotlight from CAM 1 area */}
      <spotLight
        position={[0, 3.5, -9]}
        angle={0.5}
        penumbra={0.6}
        intensity={0.5}
        distance={8}
        decay={1.5}
        color="#aa88ff"
      />

      <OfficeRoom />

      <DoorBarrier closed={doorClosed} />

      <Ghost position={ghostWorldPos} visible={ghostVisible} />

      <CameraController
        panAngle={panAngle}
        cameraView={cameraView}
        jumpscare={jumpscare}
        ghostPosition={ghostPosition}
      />
    </Canvas>
  )
}
