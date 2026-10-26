import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Capabilities3DOrbProps {
  activeCategoryId?: string;
  className?: string;
}

export const Capabilities3DOrb: React.FC<Capabilities3DOrbProps> = ({ 
  activeCategoryId = 'all', 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCategoryRef = useRef(activeCategoryId);
  activeCategoryRef.current = activeCategoryId;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animId: number;
    let isVisible = true;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let mainGroup: THREE.Group;

    // Sub-models for different engineering disciplines
    let cfdGroup: THREE.Group;
    let energyGroup: THREE.Group;
    let atomGroup: THREE.Group;
    let dataGroup: THREE.Group;

    // Particle flow
    let particleGeo: THREE.BufferGeometry;
    let particleMat: THREE.PointsMaterial;
    let particleSystem: THREE.Points;

    let targetRotX = 0.2;
    let targetRotY = 0.4;
    let currentRotX = 0.2;
    let currentRotY = 0.4;

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = nx * 0.7 + 0.4;
      targetRotX = -ny * 0.4 + 0.2;
    };

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. CFD & MULTIPHYSICS SUB-MODEL: Aerodynamic Camber Ring & Streamline Field
    cfdGroup = new THREE.Group();
    mainGroup.add(cfdGroup);

    const aeroRingGeo = new THREE.TorusGeometry(1.2, 0.04, 16, 48);
    const aeroRingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3
    });
    const aeroRing1 = new THREE.Mesh(aeroRingGeo, aeroRingMat);
    cfdGroup.add(aeroRing1);

    const aeroRing2 = new THREE.Mesh(aeroRingGeo, aeroRingMat);
    aeroRing2.rotation.x = Math.PI / 2;
    cfdGroup.add(aeroRing2);

    // Aerofoil camber core
    const camberCoreGeo = new THREE.ConeGeometry(0.35, 1.4, 24);
    const camberCoreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: true
    });
    const camberCore = new THREE.Mesh(camberCoreGeo, camberCoreMat);
    camberCore.rotation.z = Math.PI / 2;
    cfdGroup.add(camberCore);

    // 2. ENERGY & OPTIMIZATION SUB-MODEL: Solar Photovoltaic Flux Waves
    energyGroup = new THREE.Group();
    mainGroup.add(energyGroup);

    const pvFrameGeo = new THREE.BoxGeometry(1.6, 0.04, 1.2);
    const pvMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
      wireframe: true
    });
    const pvPanel = new THREE.Mesh(pvFrameGeo, pvMat);
    pvPanel.rotation.x = 0.5;
    energyGroup.add(pvPanel);

    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8
      })
    );
    sunOrb.position.set(0, 0.7, 0);
    energyGroup.add(sunOrb);

    // 3. ATOMISTICS & MOLECULAR DYNAMICS SUB-MODEL: FCC Crystal Lattice
    atomGroup = new THREE.Group();
    mainGroup.add(atomGroup);

    const atomGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const atomMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x059669,
      emissiveIntensity: 0.5
    });

    const latticeCoords = [
      [-0.6, -0.6, -0.6], [0.6, -0.6, -0.6], [-0.6, 0.6, -0.6], [0.6, 0.6, -0.6],
      [-0.6, -0.6, 0.6], [0.6, -0.6, 0.6], [-0.6, 0.6, 0.6], [0.6, 0.6, 0.6],
      [0, 0, -0.6], [0, 0, 0.6], [0, -0.6, 0], [0, 0.6, 0], [-0.6, 0, 0], [0.6, 0, 0]
    ];

    latticeCoords.forEach(([x, y, z]) => {
      const atom = new THREE.Mesh(atomGeo, atomMat);
      atom.position.set(x, y, z);
      atomGroup.add(atom);
    });

    // Molecular bond lines
    const bondGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const bondMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.35 });
    const bondBox = new THREE.Mesh(bondGeo, bondMat);
    atomGroup.add(bondBox);

    // 4. DATA & PROGRAMMING SUB-MODEL: Tensor Compute Matrix Cube
    dataGroup = new THREE.Group();
    mainGroup.add(dataGroup);

    const tensorCubeGeo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
    const tensorMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.4
    });
    const tensorCube = new THREE.Mesh(tensorCubeGeo, tensorMat);
    dataGroup.add(tensorCube);

    // 5. 500 DYNAMIC SIMULATION PARTICLES
    const pCount = 500;
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const pSpeeds: number[] = [];
    const pRadii: number[] = [];
    const pAngles: number[] = [];

    const cyanCol = new THREE.Color(0x38bdf8);
    const goldCol = new THREE.Color(0xf59e0b);
    const emeraldCol = new THREE.Color(0x10b981);

    for (let i = 0; i < pCount; i++) {
      const r = 0.5 + Math.random() * 1.3;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 2.8;

      pRadii.push(r);
      pAngles.push(angle);
      pSpeeds.push(0.015 + Math.random() * 0.02);

      pPositions[i * 3] = Math.cos(angle) * r;
      pPositions[i * 3 + 1] = Math.sin(angle) * r;
      pPositions[i * 3 + 2] = z;

      pColors[i * 3] = cyanCol.r;
      pColors[i * 3 + 1] = cyanCol.g;
      pColors[i * 3 + 2] = cyanCol.b;
    }

    particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // Studio Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(amb);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x38bdf8, 2, 8);
    cyanPoint.position.set(0, 0, 0);
    scene.add(cyanPoint);

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { isVisible = e.isIntersecting; });
    }, { threshold: 0.05 });
    observer.observe(container);

    const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = particleGeo.attributes.color as THREE.BufferAttribute;

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;
      mainGroup.rotation.x = currentRotX;
      mainGroup.rotation.y = currentRotY;

      // Rotate sub-models continuously
      cfdGroup.rotation.z += 0.015;
      energyGroup.rotation.y += 0.02;
      atomGroup.rotation.x += 0.012;
      atomGroup.rotation.y += 0.018;
      dataGroup.rotation.x -= 0.015;
      dataGroup.rotation.z += 0.012;

      // Discipline Visibility morphing based on active category
      const cat = activeCategoryRef.current;
      const isCfd = cat === 'sg-5' || cat === 'all';
      const isEnergy = cat === 'sg-1';
      const isAtom = cat === 'sg-2';
      const isData = cat === 'sg-3' || cat === 'sg-4';

      cfdGroup.visible = isCfd || cat === 'all';
      energyGroup.visible = isEnergy;
      atomGroup.visible = isAtom;
      dataGroup.visible = isData;

      // Scale transition
      cfdGroup.scale.lerp(new THREE.Vector3(isCfd ? 1 : 0.001, isCfd ? 1 : 0.001, isCfd ? 1 : 0.001), 0.08);
      energyGroup.scale.lerp(new THREE.Vector3(isEnergy ? 1 : 0.001, isEnergy ? 1 : 0.001, isEnergy ? 1 : 0.001), 0.08);
      atomGroup.scale.lerp(new THREE.Vector3(isAtom ? 1 : 0.001, isAtom ? 1 : 0.001, isAtom ? 1 : 0.001), 0.08);
      dataGroup.scale.lerp(new THREE.Vector3(isData ? 1 : 0.001, isData ? 1 : 0.001, isData ? 1 : 0.001), 0.08);

      // Particle loop
      const pArr = posAttr.array as Float32Array;
      const cArr = colAttr.array as Float32Array;
      const activeColor = isEnergy ? goldCol : isAtom ? emeraldCol : cyanCol;

      for (let i = 0; i < pCount; i++) {
        pAngles[i] += pSpeeds[i] * 1.5;
        pPositions[i * 3 + 2] += pSpeeds[i] * 0.8;

        if (pPositions[i * 3 + 2] > 1.4) {
          pPositions[i * 3 + 2] = -1.4;
        }

        pArr[i * 3] = Math.cos(pAngles[i]) * pRadii[i];
        pArr[i * 3 + 1] = Math.sin(pAngles[i]) * pRadii[i];
        pArr[i * 3 + 2] = pPositions[i * 3 + 2];

        cArr[i * 3] = activeColor.r;
        cArr[i * 3 + 1] = activeColor.g;
        cArr[i * 3 + 2] = activeColor.b;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (container) {
        container.removeEventListener('mousemove', onMouseMove);
      }
      if (renderer) {
        renderer.dispose();
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      aeroRingGeo?.dispose();
      aeroRingMat?.dispose();
      camberCoreGeo?.dispose();
      camberCoreMat?.dispose();
      pvFrameGeo?.dispose();
      pvMat?.dispose();
      atomGeo?.dispose();
      atomMat?.dispose();
      tensorCubeGeo?.dispose();
      tensorMat?.dispose();
      particleGeo?.dispose();
      particleMat?.dispose();
    };
  }, []);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[260px] cursor-grab active:cursor-grabbing relative z-10" />

      {/* Floating 3D Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>3D SIMULATION LATTICE</span>
      </div>

      <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md pointer-events-none">
        <span>Active Matrix: {activeCategoryId === 'all' ? 'Multiphysics' : activeCategoryId.toUpperCase()}</span>
        <span className="text-cyan-400">Interactive 360°</span>
      </div>
    </div>
  );
};
