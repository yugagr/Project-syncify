import { useEffect, useRef } from "react";
import * as THREE from "three";

type StarfieldProps = {
  starCount?: number;
  depth?: number;
  color?: number;
};

const Starfield = ({ starCount = 2000, depth = 1000, color = 0xffffff }: StarfieldProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const disposeRef = useRef<() => void>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, depth * 2);
    camera.position.z = depth / 12; // slightly closer to make stars appear larger

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * depth;
      positions[i3 + 1] = (Math.random() - 0.5) * depth;
      positions[i3 + 2] = -Math.random() * depth; // push into the scene
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pixelRatio = renderer.getPixelRatio();
    const starSize = 2.4 * (pixelRatio > 1 ? 1.5 : 1); // boost size on HiDPI
    const material = new THREE.PointsMaterial({
      color,
      size: starSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    let rafId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      stars.rotation.y += delta * 0.02;
      stars.rotation.x += delta * 0.005;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);
    animate();

    disposeRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      scene.clear();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };

    return () => {
      disposeRef.current && disposeRef.current();
    };
  }, [starCount, depth, color]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full" />
  );
};

export default Starfield;


