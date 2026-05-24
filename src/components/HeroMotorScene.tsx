import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroMotorScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4.8, 3.1, 6.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Slate-steel & carbon titanium materials
    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x8ba6c6, // Lighter, visible slate-blue steel
      metalness: 0.6, // Premium metal sheen
      roughness: 0.2, // catching details nicely
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x47566b, // Slate carbon steel
      metalness: 0.7,
      roughness: 0.25,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x00a8ff, // Cobalt accent
      emissive: 0x0066cc,
      emissiveIntensity: 1.3,
      metalness: 0.1,
      roughness: 0.15,
    });
    const successMaterial = new THREE.MeshStandardMaterial({
      color: 0x3ef0af,
      emissive: 0x12a075,
      emissiveIntensity: 1.3,
      metalness: 0.1,
      roughness: 0.15,
    });

    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 2.9, 64, 1, false),
      shellMaterial,
    );
    motor.rotation.z = Math.PI / 2;
    group.add(motor);

    const frontCap = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.22, 64), darkMaterial);
    frontCap.rotation.z = Math.PI / 2;
    frontCap.position.x = 1.55;
    group.add(frontCap);

    const rearCap = frontCap.clone();
    rearCap.position.x = -1.55;
    group.add(rearCap);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.8, 40), accentMaterial);
    shaft.rotation.z = Math.PI / 2;
    group.add(shaft);

    for (let i = 0; i < 12; i += 1) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.045, 0.16), darkMaterial);
      const angle = (i / 12) * Math.PI * 2;
      fin.position.set(0, Math.cos(angle) * 1.22, Math.sin(angle) * 1.22);
      fin.rotation.x = angle;
      group.add(fin);
    }

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.35), darkMaterial);
    base.position.y = -1.25;
    group.add(base);

    // Glowing orbital telemetry rings
    const rings = new THREE.Group();
    group.add(rings);
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.4 + i * 0.45, 0.015, 16, 120),
        i === 1 ? successMaterial : accentMaterial,
      );
      ring.rotation.x = Math.PI / 2 + i * 0.28;
      ring.rotation.y = i * 0.4;
      rings.add(ring);
    }

    // Telemetry particle stream floating around motor
    const particles = new THREE.Group();
    group.add(particles);
    const particleCount = 24;
    const particleGeometry = new THREE.SphereGeometry(0.024, 8, 8);
    const particleData: {
      mesh: THREE.Mesh;
      angle: number;
      radius: number;
      speed: number;
      y: number;
    }[] = [];

    for (let i = 0; i < particleCount; i += 1) {
      const mesh = new THREE.Mesh(particleGeometry, i % 2 === 0 ? successMaterial : accentMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.1 + Math.random() * 0.55;
      const speed = 0.008 + Math.random() * 0.016;
      const y = (Math.random() - 0.5) * 2.8;
      mesh.position.set(y, Math.cos(angle) * radius, Math.sin(angle) * radius);
      particles.add(mesh);
      particleData.push({ mesh, angle, radius, speed, y });
    }

    const nodes: THREE.Mesh[] = [];
    const nodePositions = [
      [0.9, 1.9, 0.9],
      [-1.1, 1.7, -1.1],
      [1.45, -0.6, -1.9],
      [-1.55, -0.4, 1.9],
    ];
    nodePositions.forEach((position, index) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 24, 24),
        index % 2 ? successMaterial : accentMaterial,
      );
      node.position.set(position[0], position[1], position[2]);
      group.add(node);
      nodes.push(node);
    });

    const grid = new THREE.GridHelper(6, 14, 0x1d2838, 0x0c121a);
    grid.position.y = -1.42;
    scene.add(grid);

    // Premium multi-point studio lighting rig
    scene.add(new THREE.AmbientLight(0xffffff, 2.5)); // Strong ambient bounce

    const keyLight = new THREE.DirectionalLight(0xffffff, 6.0); // Ultra-bright key
    keyLight.position.set(6, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8cb6ff, 5.0); // Front-left camera fill
    fillLight.position.set(-4, 4, 6);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0x3ef0af, 5.0); // Intense cyan rim highlight
    backRimLight.position.set(-5, 2, -5);
    scene.add(backRimLight);

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let disposed = false;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    let isVisible = true;
    let animationFrameId: number | null = null;

    const animate = () => {
      if (disposed) return;
      
      frame += 0.012;
      group.rotation.y += (pointerX * 0.18 - group.rotation.y) * 0.035;
      group.rotation.x += (-pointerY * 0.1 - group.rotation.x) * 0.035;
      motor.rotation.x = Math.sin(frame * 1.8) * 0.015;
      shaft.rotation.x += 0.045;
      rings.rotation.z += 0.006;
      rings.rotation.y = Math.sin(frame) * 0.08;

      // Animate floating telemetry particles wrapping motor
      particleData.forEach((p) => {
        p.angle += p.speed;
        p.mesh.position.y = Math.cos(p.angle) * p.radius;
        p.mesh.position.z = Math.sin(p.angle) * p.radius;
        p.mesh.position.x += Math.sin(frame + p.radius) * 0.004;
        if (p.mesh.position.x > 1.6) p.mesh.position.x = -1.6;
        if (p.mesh.position.x < -1.6) p.mesh.position.x = 1.6;
      });

      nodes.forEach((node, index) => {
        const pulse = 1 + Math.sin(frame * 4 + index) * 0.18;
        node.scale.setScalar(pulse);
      });
      renderer.render(scene, camera);

      if (isVisible) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const viewportObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const nextVisible = entry.isIntersecting;
          if (nextVisible && !isVisible) {
            isVisible = true;
            // Resume render loop when scrolled back in-view
            animationFrameId = requestAnimationFrame(animate);
          } else if (!nextVisible && isVisible) {
            isVisible = false;
            // Pause render loop completely when off-screen
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      },
      { threshold: 0.01 }
    );

    resize();
    animate();
    viewportObserver.observe(host);
    host.addEventListener("pointermove", onPointerMove);
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      disposed = true;
      observer.disconnect();
      viewportObserver.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      host.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="absolute inset-0 min-h-[420px] overflow-hidden"
    />
  );
}
