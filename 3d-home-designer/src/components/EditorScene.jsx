import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  RoundedBox,
  TransformControls,
} from "@react-three/drei";
import * as THREE from "three";
import { FurnitureObject, FurnitureRegistry } from "../lib/furniture";
import { useEditor } from "../lib/editorStore";

function useFinish(type) {
  return useMemo(() => {
    if (!["wood", "tile", "plaster", "fabric"].includes(type)) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 256, 256);
    if (type === "wood") {
      for (let i = 0; i < 32; i++) {
        ctx.fillStyle = `rgba(90,65,35,${0.03 + (i % 5) * 0.012})`;
        ctx.fillRect(i * 8, 0, 7, 256);
        ctx.fillStyle = "#b3a594";
        ctx.fillRect(i * 32, 0, 1, 256);
      }
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "#d0c9bc";
        ctx.fillRect((i % 4) * 64, (i * 73) % 256, 64, 1);
      }
    } else if (type === "tile") {
      ctx.strokeStyle = "#b7afa3";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 128, 128);
      ctx.strokeRect(128, 128, 128, 128);
      ctx.strokeRect(128, 0, 128, 128);
      ctx.strokeRect(0, 128, 128, 128);
    } else {
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = `rgba(80,70,60,${(i % 4) * 0.03})`;
        ctx.fillRect((i * 37) % 256, (i * 59) % 256, 1, 1);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(type === "wood" ? 4 : 3, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [type]);
}
function Surface({
  surface,
  floor,
  isWall,
  selected,
  onSelect,
  onFloorPoint,
  walking,
}) {
  const mat = floor.materials[surface.id] || {
    color: "#e8dfcf",
    type: "plaster",
  };
  const map = useFinish(mat.type);
  const down = useRef(null);
  let position, args, rotation;
  if (isWall) {
    const [a, b] = [surface.from, surface.to];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    position = [(a[0] + b[0]) / 2, surface.height / 2, (a[1] + b[1]) / 2];
    args = [length, surface.height, surface.thickness || 0.15];
    rotation = [0, -Math.atan2(b[1] - a[1], b[0] - a[0]), 0];
  } else {
    const [a, b] = surface.bounds;
    position = [(a[0] + b[0]) / 2, -0.1, (a[1] + b[1]) / 2];
    args = [b[0] - a[0], 0.2, b[1] - a[1]];
  }
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      onPointerDown={(e) => {
        down.current = [e.clientX, e.clientY];
      }}
      onPointerUp={(e) => {
        if (
          down.current &&
          Math.hypot(e.clientX - down.current[0], e.clientY - down.current[1]) <
            5
        ) {
          e.stopPropagation();
          if (!walking) {
            onSelect(surface.id);
            if (!isWall) onFloorPoint([e.point.x, 1.65, e.point.z]);
          }
        }
        down.current = null;
      }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={mat.color}
        map={map}
        roughness={mat.type === "tile" ? 0.45 : 0.88}
        emissive={selected ? "#a87846" : "#000"}
        emissiveIntensity={selected ? 0.14 : 0}
      />
    </mesh>
  );
}
function Plant({ color }) {
  return (
    <group>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.2, 0.48, 24]} />
        <meshStandardMaterial color="#c0ac90" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 1.5, 8]} />
        <meshStandardMaterial color="#7f6647" />
      </mesh>
      {[
        [0, 1.85, 0, 0.55],
        [-0.3, 1.6, 0.1, 0.4],
        [0.3, 1.65, -0.1, 0.4],
        [0.12, 2.2, 0, 0.4],
        [-0.2, 2, 0.25, 0.32],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.85, 0.8]} castShadow>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
function Piece({ object }) {
  if (FurnitureRegistry[object.type])
    return <FurnitureObject type={object.type} color={object.color} />;
  if (object.type === "plant") return <Plant color={object.color} />;
  if (object.type === "rug")
    return (
      <RoundedBox
        args={[4, 0.025, 3]}
        radius={0.04}
        position={[0, 0.015, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={object.color} roughness={1} />
      </RoundedBox>
    );
  if (object.type === "art")
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[1.35, 1.05, 0.06]} />
          <meshStandardMaterial color="#6c503b" />
        </mesh>
        <mesh position={[0, 0, 0.036]}>
          <planeGeometry args={[1.23, 0.93]} />
          <meshStandardMaterial color="#e6d8be" />
        </mesh>
        <mesh position={[-0.15, -0.05, 0.04]}>
          <circleGeometry args={[0.32, 48]} />
          <meshStandardMaterial color={object.color} />
        </mesh>
        <mesh position={[0.27, 0.17, 0.045]}>
          <planeGeometry args={[0.27, 0.5]} />
          <meshStandardMaterial color="#bda58a" />
        </mesh>
      </group>
    );
  return (
    <RoundedBox
      args={[0.7, 1.8, 0.65]}
      position={[0, 0.9, 0]}
      radius={0.04}
      castShadow
    >
      <meshStandardMaterial
        color={object.color}
        metalness={0.4}
        roughness={0.4}
      />
    </RoundedBox>
  );
}
function EditableObject({ object, selected, mode, walking, onSelect }) {
  const group = useRef();
  const down = useRef();
  const update = useEditor((s) => s.updateObject);
  const commit = () => {
    const g = group.current;
    if (g)
      update(object.id, {
        position: g.position.toArray().map((v) => +v.toFixed(3)),
        rotation: +THREE.MathUtils.radToDeg(g.rotation.y).toFixed(1),
        scale: g.scale.toArray().map((v) => +Math.max(0.1, v).toFixed(3)),
      });
  };
  const content = (
    <group
      ref={group}
      position={object.position}
      rotation={[0, (object.rotation * Math.PI) / 180, 0]}
      scale={object.scale}
      onPointerDown={(e) => {
        down.current = [e.clientX, e.clientY];
      }}
      onPointerUp={(e) => {
        if (
          !walking &&
          down.current &&
          Math.hypot(e.clientX - down.current[0], e.clientY - down.current[1]) <
            5
        ) {
          e.stopPropagation();
          onSelect(object.id);
        }
        down.current = null;
      }}
    >
      <Piece object={object} />
    </group>
  );
  return selected && !walking ? (
    <TransformControls
      mode={mode}
      showX={mode !== "rotate"}
      showY
      showZ={mode !== "rotate"}
      onMouseUp={commit}
    >
      {content}
    </TransformControls>
  ) : (
    content
  );
}
// Three.js camera is mutable by design; React's immutability rule does not apply to it.
/* eslint-disable react-hooks/immutability */
function CameraRig({ walk, reset, top, floor, zoom }) {
  const { camera, gl } = useThree();
  const controls = useRef();
  useEffect(() => {
    if (walk) {
      camera.position.set(...walk);
      camera.rotation.order = "YXZ";
      camera.rotation.set(0, 0, 0);
      camera.fov = 70;
    } else {
      const size = Math.max(floor.width, floor.depth) * zoom;
      camera.position.set(
        top ? 0 : size * 0.95,
        top ? size * 1.5 : size * 0.9,
        top ? 0.01 : size * 1.1,
      );
      camera.fov = 38;
    }
    camera.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.set(0, 0, 0);
      controls.current.update();
    }
  }, [camera, walk, reset, top, floor.width, floor.depth, zoom]);
  useEffect(() => {
    if (!walk) return;
    let dragging = false,
      lastX = 0,
      lastY = 0;
    const down = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      gl.domElement.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!dragging) return;
      camera.rotation.y -= (e.clientX - lastX) * 0.004;
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x - (e.clientY - lastY) * 0.004,
        -Math.PI / 2 + 0.02,
        Math.PI / 2 - 0.02,
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      dragging = false;
    };
    const key = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const side = new THREE.Vector3().crossVectors(
        dir,
        new THREE.Vector3(0, 1, 0),
      );
      if (["w", "ArrowUp"].includes(e.key))
        camera.position.addScaledVector(dir, 0.25);
      if (["s", "ArrowDown"].includes(e.key))
        camera.position.addScaledVector(dir, -0.25);
      if (["a", "ArrowLeft"].includes(e.key))
        camera.position.addScaledVector(side, -0.25);
      if (["d", "ArrowRight"].includes(e.key))
        camera.position.addScaledVector(side, 0.25);
    };
    const el = gl.domElement;
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    window.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", key);
    };
  }, [walk, camera, gl]);
  return (
    !walk && (
      <OrbitControls
        ref={controls}
        makeDefault
        enableZoom={false}
        enableDamping={!matchMedia("(prefers-reduced-motion: reduce)").matches}
        enableRotate={!top}
        maxPolarAngle={Math.PI / 2 - 0.06}
        minDistance={3}
        maxDistance={50}
      />
    )
  );
}
/* eslint-enable react-hooks/immutability */
export default function EditorScene({
  floor,
  selected,
  mode,
  walk,
  reset,
  zoom,
  top,
  onFloorPoint,
  onSelect,
}) {
  const [error, setError] = useState(false);
  return error ? (
    <div className="canvas-error">
      3D needs WebGL. Please enable hardware acceleration in your browser.
    </div>
  ) : (
    <Canvas
      shadows
      camera={{ position: [12, 11, 14], fov: 38 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) =>
        gl.domElement.addEventListener("webglcontextlost", () => setError(true))
      }
      fallback={
        <div className="canvas-error">Your browser does not support WebGL.</div>
      }
    >
      <color attach="background" args={["#eeeae3"]} />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#fff7e8", "#a89b87", 1.5]} />
      <directionalLight
        position={[2, 14, 7]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0003}
      />
      {floor.rooms.map((room) => (
        <Surface
          key={room.id}
          surface={room}
          floor={floor}
          selected={selected === room.id}
          onSelect={onSelect}
          onFloorPoint={onFloorPoint}
          walking={!!walk}
        />
      ))}
      {floor.walls.map((wall) => (
        <Surface
          key={wall.id}
          surface={wall}
          floor={floor}
          isWall
          selected={selected === wall.id}
          onSelect={onSelect}
          walking={!!walk}
        />
      ))}
      {floor.objects.map((object) => (
        <EditableObject
          key={object.id}
          object={object}
          selected={selected === object.id}
          mode={mode}
          walking={!!walk}
          onSelect={onSelect}
        />
      ))}
      <ContactShadows
        position={[0, -0.21, 0]}
        opacity={0.3}
        scale={35}
        blur={2.5}
        far={6}
        resolution={512}
        color="#635241"
      />
      <CameraRig
        walk={walk}
        reset={reset}
        top={top}
        floor={floor}
        zoom={zoom}
      />
    </Canvas>
  );
}
