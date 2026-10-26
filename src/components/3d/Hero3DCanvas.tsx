import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Wind, Flame, Cpu, Activity, Sparkles, Layers } from 'lucide-react';

interface Hero3DCanvasProps {
  className?: string;
  onOpenLab?: () => void;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '', onOpenLab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVisMode, setActiveVisMode] = useState<'cfd' | 'thermal' | 'cad'>('cfd');
  const activeVisModeRef = useRef(activeVisMode);
  activeVisModeRef.current = activeVisMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animId: number;
    let isVisible = true;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let mainTurbineGroup: THREE.Group;
    let compressorRotorGroup: THREE.Group;
    let turbineRotorGroup: THREE.Group;

    // Materials
    let titaniumMat: THREE.MeshStandardMaterial;
    let goldInconelMat: THREE.MeshStandardMaterial;
    let statorMat: THREE.MeshStandardMaterial;
    let bladeMat: THREE.MeshStandardMaterial;
    let combustorLinerMat: THREE.MeshStandardMaterial;
    let casingMat: THREE.MeshStandardMaterial;
    let particleGeometry: THREE.BufferGeometry;
    let particleMaterial: THREE.PointsMaterial;

    let targetRotX = 0.15;
    let targetRotY = -0.35;
    let currentRotX = 0.15;
    let currentRotY = -0.35;

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = nx * 0.65 - 0.35;
      targetRotX = -ny * 0.35 + 0.15;
    };

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 290;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const initTimer = setTimeout(() => {
      if (isDisposed || !container) return;

      const width = container.clientWidth || 400;
      const height = container.clientHeight || 290;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0.8, 5.0);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.appendChild(renderer.domElement);

      mainTurbineGroup = new THREE.Group();
      scene.add(mainTurbineGroup);

      // --- AUTHENTIC AEROSPACE MATERIALS ---
      titaniumMat = new THREE.MeshStandardMaterial({
        color: 0xcfd8dc,
        metalness: 0.94,
        roughness: 0.22,
        wireframe: false
      });

      goldInconelMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.88,
        roughness: 0.24,
        wireframe: false
      });

      statorMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.82,
        roughness: 0.32
      });

      bladeMat = new THREE.MeshStandardMaterial({
        color: 0xa1a1aa,
        emissive: 0x0284c7,
        emissiveIntensity: 0.2,
        metalness: 0.95,
        roughness: 0.18
      });

      combustorLinerMat = new THREE.MeshStandardMaterial({
        color: 0x374151,
        emissive: 0x78350f,
        emissiveIntensity: 0.25,
        metalness: 0.85,
        roughness: 0.32,
        transparent: true,
        opacity: 0.92
      });

      casingMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.18,
        wireframe: false
      });

      // =======================================================================
      // 1. INTAKE NOSE CONE & FLUID DUCT
      // =======================================================================
      const noseGeo = new THREE.ConeGeometry(0.42, 0.95, 32);
      const noseMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.18,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35
      });
      const noseMesh = new THREE.Mesh(noseGeo, noseMat);
      noseMesh.position.z = -1.85;
      noseMesh.rotation.x = -Math.PI / 2;
      mainTurbineGroup.add(noseMesh);

      // Flared Intake Lip Ring
      const intakeLip = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 16, 36), titaniumMat);
      intakeLip.position.z = -2.0;
      mainTurbineGroup.add(intakeLip);

      // =======================================================================
      // 2. CENTRIFUGAL COMPRESSOR IMPELLER (MAIN BLADES + SPLITTER BLADES)
      // =======================================================================
      compressorRotorGroup = new THREE.Group();
      mainTurbineGroup.add(compressorRotorGroup);

      // Impeller Conical Hub
      const hubGeo = new THREE.CylinderGeometry(0.3, 1.15, 0.85, 32);
      const hubMesh = new THREE.Mesh(hubGeo, titaniumMat);
      hubMesh.rotation.x = Math.PI / 2;
      hubMesh.position.z = -1.0;
      compressorRotorGroup.add(hubMesh);

      // 8 Main Full-Length Blades
      const bladeCount = 8;
      for (let i = 0; i < bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;
        const bGeo = new THREE.BoxGeometry(0.045, 0.65, 0.4);
        bGeo.translate(0, 0.75, 0);
        const blade = new THREE.Mesh(bGeo, bladeMat);
        blade.position.z = -0.95;
        blade.rotation.z = angle;
        blade.rotation.x = 0.48; // aerodynamic pitch
        blade.rotation.y = 0.15;
        compressorRotorGroup.add(blade);
      }

      // 8 Splitter Blades (Authentic Centrifugal Impeller Geometry)
      for (let i = 0; i < bladeCount; i++) {
        const angle = ((i + 0.5) / bladeCount) * Math.PI * 2;
        const sGeo = new THREE.BoxGeometry(0.038, 0.42, 0.25);
        sGeo.translate(0, 0.9, 0);
        const splitter = new THREE.Mesh(sGeo, titaniumMat);
        splitter.position.z = -0.82;
        splitter.rotation.z = angle;
        splitter.rotation.x = 0.35;
        compressorRotorGroup.add(splitter);
      }

      // =======================================================================
      // 3. RADIAL STATOR DIFFUSER RING
      // =======================================================================
      const diffuserRing = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.07, 16, 36), statorMat);
      diffuserRing.position.z = -0.55;
      mainTurbineGroup.add(diffuserRing);

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dVaneGeo = new THREE.BoxGeometry(0.03, 0.32, 0.18);
        dVaneGeo.translate(0, 1.25, 0);
        const dVane = new THREE.Mesh(dVaneGeo, statorMat);
        dVane.position.z = -0.55;
        dVane.rotation.z = angle;
        dVane.rotation.x = -0.42;
        mainTurbineGroup.add(dVane);
      }

      // =======================================================================
      // 4. HYDROGEN INJECTOR MANIFOLD & REVERSE-FLOW COMBUSTOR LINER
      // =======================================================================
      // Fuel Manifold Ring
      const fuelManifold = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 16, 32), goldInconelMat);
      fuelManifold.position.z = -0.32;
      mainTurbineGroup.add(fuelManifold);

      // Discrete Fuel Nozzles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const nozGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.24, 12);
        const noz = new THREE.Mesh(nozGeo, titaniumMat);
        noz.position.set(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, -0.2);
        noz.rotation.x = Math.PI / 2;
        mainTurbineGroup.add(noz);
      }

      // Combustor Flame Tube Liner
      const combustorLiner = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.2, 1.3, 32, 1, true),
        combustorLinerMat
      );
      combustorLiner.rotation.x = Math.PI / 2;
      combustorLiner.position.z = 0.25;
      mainTurbineGroup.add(combustorLiner);

      // =======================================================================
      // 5. HIGH-TEMPERATURE TURBINE BLISK & EXHAUST TAILCONE
      // =======================================================================
      turbineRotorGroup = new THREE.Group();
      mainTurbineGroup.add(turbineRotorGroup);

      const turbDisk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.78, 0.35, 32),
        goldInconelMat
      );
      turbDisk.rotation.x = Math.PI / 2;
      turbDisk.position.z = 1.15;
      turbineRotorGroup.add(turbDisk);

      // 16 Twisted Turbine Blades
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const tGeo = new THREE.BoxGeometry(0.04, 0.52, 0.22);
        tGeo.translate(0, 1.0, 0);
        const tBlade = new THREE.Mesh(tGeo, bladeMat);
        tBlade.position.z = 1.15;
        tBlade.rotation.z = angle;
        tBlade.rotation.x = -0.38;
        turbineRotorGroup.add(tBlade);
      }

      // Exhaust Tailcone Bullet
      const tailcone = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 1.1, 24),
        goldInconelMat
      );
      tailcone.rotation.x = Math.PI / 2;
      tailcone.position.z = 1.95;
      mainTurbineGroup.add(tailcone);

      // Outer Translucent Aerospace Casing Shroud
      const outerCasing = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.25, 3.8, 24, 1, true),
        casingMat
      );
      outerCasing.rotation.x = Math.PI / 2;
      outerCasing.position.z = 0.05;
      mainTurbineGroup.add(outerCasing);

      // Central Drive Shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 4.2, 20),
        titaniumMat
      );
      shaft.rotation.x = Math.PI / 2;
      mainTurbineGroup.add(shaft);

      // =======================================================================
      // 6. 850 HIGH-PERFORMANCE CFD VELOCITY STREAMLINE PARTICLES
      // =======================================================================
      const particleCount = 850;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const particleData: Array<{ radius: number; angle: number; z: number; speed: number; radialSpeed: number }> = [];

      const cfdCobalt = new THREE.Color(0x0284c7);
      const cfdCyan = new THREE.Color(0x00d4ff);
      const cfdIce = new THREE.Color(0xe0f2fe);

      const thermalCore = new THREE.Color(0x38bdf8);
      const thermalAmber = new THREE.Color(0xf59e0b);
      const thermalPlume = new THREE.Color(0xd97706);

      for (let i = 0; i < particleCount; i++) {
        const radius = 0.45 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        const z = (Math.random() - 0.5) * 4.6;
        const speed = 0.024 + Math.random() * 0.032;
        const radialSpeed = (Math.random() - 0.5) * 0.002;

        particleData.push({ radius, angle, z, speed, radialSpeed });

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = z;

        colors[i * 3] = cfdCyan.r;
        colors[i * 3 + 1] = cfdCyan.g;
        colors[i * 3 + 2] = cfdCyan.b;
      }

      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      particleMaterial = new THREE.PointsMaterial({
        size: 0.068,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending
      });

      const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      mainTurbineGroup.add(particleSystem);

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(4, 5, 5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
      fillLight.position.set(-4, -2, -3);
      scene.add(fillLight);

      const combustorLight = new THREE.PointLight(0xf59e0b, 1.6, 6);
      combustorLight.position.set(0, 0, 0.25);
      scene.add(combustorLight);

      container.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', onResize);

      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const colAttr = particleGeometry.attributes.color as THREE.BufferAttribute;

      const animate = () => {
        if (isDisposed) return;
        animId = requestAnimationFrame(animate);

        if (!isVisible || document.hidden) return;

        // Smooth mouse follow parallax
        currentRotX += (targetRotX - currentRotX) * 0.06;
        currentRotY += (targetRotY - currentRotY) * 0.06;
        mainTurbineGroup.rotation.x = currentRotX;
        mainTurbineGroup.rotation.y = currentRotY;

        // Impeller and Turbine Rotation
        compressorRotorGroup.rotation.z += 0.06;
        turbineRotorGroup.rotation.z += 0.06;

        const mode = activeVisModeRef.current;
        const posArr = posAttr.array as Float32Array;
        const colArr = colAttr.array as Float32Array;

        if (mode === 'cad') {
          titaniumMat.wireframe = true;
          bladeMat.wireframe = true;
          goldInconelMat.wireframe = true;
          combustorLinerMat.wireframe = true;
          casingMat.wireframe = true;
          particleMaterial.size = 0.035;
        } else {
          titaniumMat.wireframe = false;
          bladeMat.wireframe = false;
          goldInconelMat.wireframe = false;
          combustorLinerMat.wireframe = false;
          casingMat.wireframe = false;
          particleMaterial.size = 0.068;
        }

        for (let i = 0; i < particleCount; i++) {
          const p = particleData[i];
          p.angle += (p.speed * 2.8) / Math.max(0.3, p.radius);
          p.z += p.speed;
          p.radius += p.radialSpeed;

          if (p.radius < 0.45 || p.radius > 1.8) {
            p.radialSpeed *= -1;
          }

          if (p.z > 2.3) {
            p.z = -2.3;
            p.radius = 0.5 + Math.random() * 0.8;
          }

          posArr[i * 3] = Math.cos(p.angle) * p.radius;
          posArr[i * 3 + 1] = Math.sin(p.angle) * p.radius;
          posArr[i * 3 + 2] = p.z;

          if (mode === 'cfd') {
            const normVel = Math.min(1, Math.max(0, 1.6 / p.radius - 0.4));
            if (normVel < 0.5) {
              const t = normVel * 2.0;
              colArr[i * 3] = cfdCobalt.r + (cfdCyan.r - cfdCobalt.r) * t;
              colArr[i * 3 + 1] = cfdCobalt.g + (cfdCyan.g - cfdCobalt.g) * t;
              colArr[i * 3 + 2] = cfdCobalt.b + (cfdCyan.b - cfdCobalt.b) * t;
            } else {
              const t = (normVel - 0.5) * 2.0;
              colArr[i * 3] = cfdCyan.r + (cfdIce.r - cfdCyan.r) * t;
              colArr[i * 3 + 1] = cfdCyan.g + (cfdIce.g - cfdCyan.g) * t;
              colArr[i * 3 + 2] = cfdCyan.b + (cfdIce.b - cfdCyan.b) * t;
            }
          } else if (mode === 'thermal') {
            const normTemp = Math.max(0, Math.min(1, (p.z + 2.3) / 4.6));
            if (normTemp < 0.5) {
              const t = normTemp * 2.0;
              colArr[i * 3] = thermalCore.r + (thermalAmber.r - thermalCore.r) * t;
              colArr[i * 3 + 1] = thermalCore.g + (thermalAmber.g - thermalCore.g) * t;
              colArr[i * 3 + 2] = thermalCore.b + (thermalAmber.b - thermalCore.b) * t;
            } else {
              const t = (normTemp - 0.5) * 2.0;
              colArr[i * 3] = thermalAmber.r + (thermalPlume.r - thermalAmber.r) * t;
              colArr[i * 3 + 1] = thermalAmber.g + (thermalPlume.g - thermalAmber.g) * t;
              colArr[i * 3 + 2] = thermalAmber.b + (thermalPlume.b - thermalAmber.b) * t;
            }
          }
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();
    }, 60);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    observer.observe(container);

    return () => {
      isDisposed = true;
      clearTimeout(initTimer);
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
      titaniumMat?.dispose();
      goldInconelMat?.dispose();
      statorMat?.dispose();
      bladeMat?.dispose();
      combustorLinerMat?.dispose();
      casingMat?.dispose();
      particleGeometry?.dispose();
      particleMaterial?.dispose();
    };
  }, []);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-sky-500/30 dark:border-sky-500/25 bg-gradient-to-br from-slate-900/95 via-[#061226]/95 to-[#020617] backdrop-blur-2xl shadow-[0_12px_45px_rgba(14,165,233,0.15)] ${className}`}>
      
      {/* Refined ambient radial glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)' }} />

      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-[290px] sm:h-[330px] cursor-grab active:cursor-grabbing relative z-10" />

      {/* Floating Header Overlay */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-200 uppercase bg-slate-900/90 px-3 py-1 rounded-lg border border-cyan-500/40 shadow-md">
            ⚡ Micro-Turbine CFD & Aerodynamic Core
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-cyan-300 bg-slate-900/80 border border-cyan-500/30 px-3 py-1 rounded-lg shadow-sm">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Centrifugal Compressor · 38k RPM Nominal</span>
        </div>
      </div>

      {/* Interactive Controls Dock at Bottom of Canvas */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2.5 z-20">
        <div className="flex items-center gap-1.5 bg-slate-900/95 p-1 rounded-xl border border-slate-700/90 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveVisMode('cfd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeVisMode === 'cfd'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Velocity Field</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVisMode('thermal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeVisMode === 'thermal'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Hydrogen Flame</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVisMode('cad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeVisMode === 'cad'
                ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>CAD Mesh</span>
          </button>
        </div>

        {onOpenLab && (
          <button
            type="button"
            onClick={onOpenLab}
            className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-cyan-400/40"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-200" />
            <span>Explode 3D Assembly & Lab</span>
          </button>
        )}
      </div>
    </div>
  );
};
