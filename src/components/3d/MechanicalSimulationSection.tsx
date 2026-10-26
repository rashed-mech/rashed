import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Cpu, 
  Wind, 
  Flame, 
  Layers, 
  RotateCw, 
  Gauge,
  Activity,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tv
} from 'lucide-react';

interface ComponentSpec {
  id: string;
  name: string;
  stageNum: string;
  material: string;
  specs: string;
  description: string;
}

const TURBINE_COMPONENTS: ComponentSpec[] = [
  {
    id: 'intake',
    name: 'Bellmouth Intake & Ceramic Bearing',
    stageNum: '01',
    material: 'Aerospace Ti-6Al-4V & Si3N4 Ceramic Balls',
    specs: 'Mass Flow: 0.88 kg/s · Flared Radiused Cowl · 4 Aerofoil Struts',
    description: 'Flared aerodynamic intake with flow-straightening struts and high-speed hybrid ceramic angular contact bearing cartridge.'
  },
  {
    id: 'compressor',
    name: 'Centrifugal Impeller & Radial Diffuser',
    stageNum: '02',
    material: 'Forged 7075-T6 Aluminium / CNC Titanium',
    specs: 'Pressure Ratio: 4.8:1 · 10 Main + 10 Splitter Blades · 16 Wedge Vanes',
    description: 'Backswept centrifugal compressor impeller with alternating splitter blades for stall prevention, paired with a stationary supersonic wedge diffuser.'
  },
  {
    id: 'combustor',
    name: 'Hydrogen Combustor & Injector Ring',
    stageNum: '03',
    material: 'Inconel 625 Superalloy & Thermal Barrier Coating',
    specs: 'Core Temp: 2,218 K · 8 Multi-Orifice Swirl Nozzles · Reverse-Flow',
    description: 'Annular reverse-flow flame tube liner with effusion cooling holes, dual-orifice fuel atomizers, and high-energy spark igniter probe.'
  },
  {
    id: 'turbine',
    name: 'High-Temp Turbine Blisk & NGV Ring',
    stageNum: '04',
    material: 'Single-Crystal Mar-M247 / Inconel 718',
    specs: 'Expansion Ratio: 3.9:1 · 18 Aerofoil NGV Vanes · 20 Twisted Blades',
    description: 'Integral bladed disk (blisk) with 3D twisted aerofoils driven by hot expanding gases directed from stationary nozzle guide vanes.'
  },
  {
    id: 'exhaust',
    name: 'Exhaust Tailcone & Aerodynamic Nozzle',
    stageNum: '05',
    material: '316L Stainless Steel & Titanium Alloy',
    specs: 'Net Thrust: 520 N · 4 Deswirl Struts · Convergent Core Ejector',
    description: 'Aerodynamic central bullet with deswirl exit struts and convergent nozzle converting remaining enthalpy into high-velocity axial exhaust thrust.'
  }
];

export const MechanicalSimulationSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visMode, setVisMode] = useState<'cfd' | 'combustion' | 'fea'>('cfd');
  const [isExploded, setIsExploded] = useState(false);
  const [rpm, setRpm] = useState(38000);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // References for render loop synchronization
  const visModeRef = useRef(visMode);
  visModeRef.current = visMode;

  const isExplodedRef = useRef(isExploded);
  isExplodedRef.current = isExploded;

  const rpmRef = useRef(rpm);
  rpmRef.current = rpm;

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const selectedComponentRef = useRef(selectedComponent);
  selectedComponentRef.current = selectedComponent;

  // External trigger references
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Trigger resize immediately on theater mode toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (resizeHandlerRef.current) {
        resizeHandlerRef.current();
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [isTheaterMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animId: number;
    let isVisible = true;
    let isInitialized = false;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let assemblyGroup: THREE.Group;

    // Sub-assembly Stage Groups (Separable in Exploded View)
    let stage1IntakeGroup: THREE.Group;
    let stage2CompressorGroup: THREE.Group;
    let stage3CombustorGroup: THREE.Group;
    let stage4TurbineGroup: THREE.Group;
    let stage5ExhaustGroup: THREE.Group;
    let casingCutawayGroup: THREE.Group;
    let shaftAssemblyGroup: THREE.Group;

    // Spin Spindles
    let compressorRotorSpindle: THREE.Group;
    let turbineRotorSpindle: THREE.Group;
    let centralShaftMesh: THREE.Mesh;

    // Particle & Light References
    let flowGeo: THREE.BufferGeometry;
    let flowMat: THREE.PointsMaterial;
    let flowSystem: THREE.Points;
    let flamePointLight: THREE.PointLight;
    let nozzleGlowLight: THREE.PointLight;
    let combustionFlameGroup: THREE.Group;
    let flameMantleMesh: THREE.Mesh;
    let flameCoreMesh: THREE.Mesh;
    let injectorPlumes: THREE.Mesh[] = [];
    let flameGeo: THREE.BufferGeometry;
    let flameSystem: THREE.Points;

    // Aerospace Materials
    let titaniumMaterial: THREE.MeshStandardMaterial;
    let goldInconelMaterial: THREE.MeshStandardMaterial;
    let combustorLinerMaterial: THREE.MeshStandardMaterial;
    let statorMaterial: THREE.MeshStandardMaterial;
    let turbineBladeMaterial: THREE.MeshStandardMaterial;
    let ceramicBearingMaterial: THREE.MeshStandardMaterial;
    let cutawayCasingMaterial: THREE.MeshStandardMaterial;
    let copperManifoldMaterial: THREE.MeshStandardMaterial;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 580;

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0.55;
    let sphericalPhi = 1.15;
    let cameraRadius = 13.5;
    const targetCameraTarget = new THREE.Vector3(0, 0, 0);
    const currentCameraTarget = new THREE.Vector3(0, 0, 0);

    const updateCameraPos = () => {
      if (!camera) return;
      currentCameraTarget.lerp(targetCameraTarget, 0.08);
      camera.position.x = currentCameraTarget.x + cameraRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = currentCameraTarget.y + cameraRadius * Math.cos(sphericalPhi);
      camera.position.z = currentCameraTarget.z + cameraRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(currentCameraTarget);
    };

    // Zoom Helpers accessible via UI buttons
    zoomInRef.current = () => {
      cameraRadius = Math.max(3.2, cameraRadius - 1.2);
      updateCameraPos();
    };

    zoomOutRef.current = () => {
      cameraRadius = Math.min(18.0, cameraRadius + 1.2);
      updateCameraPos();
    };

    resetCameraRef.current = () => {
      sphericalTheta = 0.55;
      sphericalPhi = 1.15;
      cameraRadius = 13.5;
      targetCameraTarget.set(0, 0, 0);
      updateCameraPos();
    };

    const triggerResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resizeHandlerRef.current = triggerResize;

    const initThreeScene = () => {
      if (isInitialized || isDisposed || !container) return;
      isInitialized = true;

      width = container.clientWidth || 800;
      height = container.clientHeight || 580;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.022);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      updateCameraPos();

      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      assemblyGroup = new THREE.Group();
      assemblyGroup.position.set(0, 0, 0);
      scene.add(assemblyGroup);

      // --- HIGH-FIDELITY AEROSPACE ENGINEERING MATERIALS ---
      titaniumMaterial = new THREE.MeshStandardMaterial({
        color: 0xcfd8dc,
        metalness: 0.94,
        roughness: 0.2,
        wireframe: false
      });

      goldInconelMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.88,
        roughness: 0.25,
        wireframe: false
      });

      combustorLinerMaterial = new THREE.MeshStandardMaterial({
        color: 0x374151,
        emissive: 0x78350f,
        emissiveIntensity: 0.25,
        metalness: 0.85,
        roughness: 0.35,
        transparent: true,
        opacity: 0.94
      });

      statorMaterial = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.82,
        roughness: 0.32
      });

      turbineBladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xa1a1aa,
        emissive: 0x0284c7,
        emissiveIntensity: 0.18,
        metalness: 0.95,
        roughness: 0.18
      });

      ceramicBearingMaterial = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        metalness: 0.3,
        roughness: 0.1,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4
      });

      cutawayCasingMaterial = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0.22,
        wireframe: false
      });

      copperManifoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.92,
        roughness: 0.25
      });

      // STAGE 1: INTAKE & FRONT CERAMIC BEARING (Densely Subdivided for FEA Mesh)
      stage1IntakeGroup = new THREE.Group();
      stage1IntakeGroup.position.set(0, 0, 0);
      assemblyGroup.add(stage1IntakeGroup);

      const intakeLipGeo = new THREE.TorusGeometry(1.65, 0.08, 24, 64);
      const intakeLip = new THREE.Mesh(intakeLipGeo, titaniumMaterial);
      intakeLip.position.z = -2.4;
      stage1IntakeGroup.add(intakeLip);

      const intakeCowlGeo = new THREE.CylinderGeometry(1.65, 1.55, 0.8, 54, 18, true);
      const intakeCowl = new THREE.Mesh(intakeCowlGeo, cutawayCasingMaterial);
      intakeCowl.rotation.x = Math.PI / 2;
      intakeCowl.position.z = -2.0;
      stage1IntakeGroup.add(intakeCowl);

      const noseConeGeo = new THREE.ConeGeometry(0.48, 1.1, 54, 18);
      const noseConeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.18,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35
      });
      const noseCone = new THREE.Mesh(noseConeGeo, noseConeMat);
      noseCone.position.z = -2.1;
      noseCone.rotation.x = -Math.PI / 2;
      stage1IntakeGroup.add(noseCone);

      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const strutGeo = new THREE.BoxGeometry(0.06, 1.15, 0.28, 3, 10, 4);
        strutGeo.translate(0, 0.95, 0);
        const strut = new THREE.Mesh(strutGeo, titaniumMaterial);
        strut.position.z = -1.95;
        strut.rotation.z = angle;
        stage1IntakeGroup.add(strut);
      }

      const frontBearingHousingGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.32, 36, 8);
      const frontBearingHousing = new THREE.Mesh(frontBearingHousingGeo, statorMaterial);
      frontBearingHousing.rotation.x = Math.PI / 2;
      frontBearingHousing.position.z = -1.6;
      stage1IntakeGroup.add(frontBearingHousing);

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const boltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.06, 12, 2);
        const bolt = new THREE.Mesh(boltGeo, titaniumMaterial);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(Math.cos(angle) * 0.44, Math.sin(angle) * 0.44, -1.43);
        stage1IntakeGroup.add(bolt);
      }

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const ballGeo = new THREE.SphereGeometry(0.07, 18, 18);
        const ball = new THREE.Mesh(ballGeo, ceramicBearingMaterial);
        ball.position.set(Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, -1.6);
        stage1IntakeGroup.add(ball);
      }

      // STAGE 2: CENTRIFUGAL COMPRESSOR & RADIAL DIFFUSER
      stage2CompressorGroup = new THREE.Group();
      stage2CompressorGroup.position.set(0, 0, 0);
      assemblyGroup.add(stage2CompressorGroup);

      compressorRotorSpindle = new THREE.Group();
      compressorRotorSpindle.position.set(0, 0, 0);
      stage2CompressorGroup.add(compressorRotorSpindle);

      const impHubGeo = new THREE.CylinderGeometry(0.35, 1.25, 0.95, 54, 20);
      const impHub = new THREE.Mesh(impHubGeo, titaniumMaterial);
      impHub.rotation.x = Math.PI / 2;
      impHub.position.z = -1.0;
      compressorRotorSpindle.add(impHub);

      const impBackplateGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.12, 54, 4);
      const impBackplate = new THREE.Mesh(impBackplateGeo, titaniumMaterial);
      impBackplate.rotation.x = Math.PI / 2;
      impBackplate.position.z = -0.52;
      compressorRotorSpindle.add(impBackplate);

      const mainBladeCount = 10;
      for (let i = 0; i < mainBladeCount; i++) {
        const angle = (i / mainBladeCount) * Math.PI * 2;
        const bladeGeo = new THREE.BoxGeometry(0.045, 0.72, 0.44, 4, 12, 6);
        bladeGeo.translate(0, 0.8, 0);
        const blade = new THREE.Mesh(bladeGeo, turbineBladeMaterial);
        blade.position.z = -0.95;
        blade.rotation.z = angle;
        blade.rotation.x = 0.52;
        blade.rotation.y = 0.18;
        compressorRotorSpindle.add(blade);
      }

      for (let i = 0; i < mainBladeCount; i++) {
        const angle = ((i + 0.5) / mainBladeCount) * Math.PI * 2;
        const splitterGeo = new THREE.BoxGeometry(0.04, 0.48, 0.28, 4, 8, 4);
        splitterGeo.translate(0, 0.98, 0);
        const splitter = new THREE.Mesh(splitterGeo, titaniumMaterial);
        splitter.position.z = -0.82;
        splitter.rotation.z = angle;
        splitter.rotation.x = 0.38;
        splitter.rotation.y = 0.12;
        compressorRotorSpindle.add(splitter);
      }

      const diffuserRingGeo = new THREE.TorusGeometry(1.58, 0.09, 24, 64);
      const diffuserRing = new THREE.Mesh(diffuserRingGeo, statorMaterial);
      diffuserRing.position.z = -0.52;
      stage2CompressorGroup.add(diffuserRing);

      const diffuserVaneCount = 16;
      for (let i = 0; i < diffuserVaneCount; i++) {
        const angle = (i / diffuserVaneCount) * Math.PI * 2;
        const dVaneGeo = new THREE.BoxGeometry(0.035, 0.35, 0.2, 3, 8, 4);
        dVaneGeo.translate(0, 1.45, 0);
        const dVane = new THREE.Mesh(dVaneGeo, statorMaterial);
        dVane.position.z = -0.52;
        dVane.rotation.z = angle;
        dVane.rotation.x = -0.45;
        stage2CompressorGroup.add(dVane);
      }

      // STAGE 3: HYDROGEN COMBUSTOR & FUEL INJECTORS
      stage3CombustorGroup = new THREE.Group();
      stage3CombustorGroup.position.set(0, 0, 0);
      assemblyGroup.add(stage3CombustorGroup);

      const combustorOuterGeo = new THREE.CylinderGeometry(1.62, 1.55, 1.6, 54, 24, true);
      const combustorOuter = new THREE.Mesh(combustorOuterGeo, cutawayCasingMaterial);
      combustorOuter.rotation.x = Math.PI / 2;
      combustorOuter.position.z = 0.25;
      stage3CombustorGroup.add(combustorOuter);

      const linerGeo = new THREE.CylinderGeometry(1.42, 1.35, 1.45, 54, 24, true);
      const linerMesh = new THREE.Mesh(linerGeo, combustorLinerMaterial);
      linerMesh.rotation.x = Math.PI / 2;
      linerMesh.position.z = 0.25;
      stage3CombustorGroup.add(linerMesh);

      const manifoldRingGeo = new THREE.TorusGeometry(1.15, 0.05, 20, 48);
      const manifoldRing = new THREE.Mesh(manifoldRingGeo, copperManifoldMaterial);
      manifoldRing.position.z = -0.35;
      stage3CombustorGroup.add(manifoldRing);

      const fuelPipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 20, 8);
      const fuelPipe = new THREE.Mesh(fuelPipeGeo, copperManifoldMaterial);
      fuelPipe.position.set(0, 1.42, -0.35);
      stage3CombustorGroup.add(fuelPipe);

      const injectorCount = 8;
      for (let i = 0; i < injectorCount; i++) {
        const angle = (i / injectorCount) * Math.PI * 2;
        const nozBodyGeo = new THREE.CylinderGeometry(0.075, 0.095, 0.32, 24, 6);
        const nozBody = new THREE.Mesh(nozBodyGeo, titaniumMaterial);
        nozBody.position.set(Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, -0.2);
        nozBody.rotation.x = Math.PI / 2;
        stage3CombustorGroup.add(nozBody);

        const swirlerGeo = new THREE.TorusGeometry(0.09, 0.02, 12, 24);
        const swirler = new THREE.Mesh(swirlerGeo, goldInconelMaterial);
        swirler.position.set(Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, -0.04);
        stage3CombustorGroup.add(swirler);
      }

      const igniterBossGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 24, 6);
      const igniterBoss = new THREE.Mesh(igniterBossGeo, statorMaterial);
      igniterBoss.position.set(1.4, 0.35, 0.2);
      igniterBoss.rotation.z = Math.PI / 3;
      stage3CombustorGroup.add(igniterBoss);

      // REALISTIC HYDROGEN COMBUSTION FLAME ASSEMBLY
      // Hydrogen swirl combustion structure:
      // 1. High-temperature Hydroxyl (OH*) chemiluminescence core (pale cyan / electric violet-blue)
      // 2. Solar amber & fiery orange undulating outer flame mantle
      // 3. 8 Conical swirl injector flame plumes emanating directly from fuel injectors
      combustionFlameGroup = new THREE.Group();
      combustionFlameGroup.position.set(0, 0, 0.3);
      stage3CombustorGroup.add(combustionFlameGroup);

      // Outer undulating flame mantle (solar amber/fiery gold)
      const mantleGeo = new THREE.CylinderGeometry(1.05, 0.85, 1.35, 48, 16, true);
      const mantleMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      flameMantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
      flameMantleMesh.rotation.x = Math.PI / 2;
      combustionFlameGroup.add(flameMantleMesh);

      // Inner intense reaction core (electric hydroxyl celestial blue)
      const coreGeo = new THREE.CylinderGeometry(0.72, 0.55, 1.15, 36, 12, true);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      flameCoreMesh = new THREE.Mesh(coreGeo, coreMat);
      flameCoreMesh.rotation.x = Math.PI / 2;
      combustionFlameGroup.add(flameCoreMesh);

      // 8 Conical Swirl Flame Plumes erupting from each fuel injector into the flame tube
      injectorPlumes = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const plumeGeo = new THREE.ConeGeometry(0.18, 0.55, 18, 4, true);
        const plumeMat = new THREE.MeshBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const plume = new THREE.Mesh(plumeGeo, plumeMat);
        const ix = Math.cos(angle) * 1.05;
        const iy = Math.sin(angle) * 1.05;
        plume.position.set(ix, iy, -0.22);
        plume.lookAt(new THREE.Vector3(Math.cos(angle + 0.3) * 0.45, Math.sin(angle + 0.3) * 0.45, 0.4));
        plume.rotateX(Math.PI / 2);
        combustionFlameGroup.add(plume);
        injectorPlumes.push(plume);
      }

      // STAGE 4: TURBINE BLISK & NGV RING
      stage4TurbineGroup = new THREE.Group();
      stage4TurbineGroup.position.set(0, 0, 0);
      assemblyGroup.add(stage4TurbineGroup);

      const ngvOuterRingGeo = new THREE.TorusGeometry(1.48, 0.06, 24, 64);
      const ngvOuterRing = new THREE.Mesh(ngvOuterRingGeo, statorMaterial);
      ngvOuterRing.position.z = 0.95;
      stage4TurbineGroup.add(ngvOuterRing);

      const ngvCount = 18;
      for (let i = 0; i < ngvCount; i++) {
        const angle = (i / ngvCount) * Math.PI * 2;
        const ngvBladeGeo = new THREE.BoxGeometry(0.04, 0.58, 0.22, 3, 10, 4);
        ngvBladeGeo.translate(0, 1.15, 0);
        const ngvBlade = new THREE.Mesh(ngvBladeGeo, goldInconelMaterial);
        ngvBlade.position.z = 0.95;
        ngvBlade.rotation.z = angle;
        ngvBlade.rotation.x = -0.58;
        stage4TurbineGroup.add(ngvBlade);
      }

      turbineRotorSpindle = new THREE.Group();
      turbineRotorSpindle.position.set(0, 0, 0);
      stage4TurbineGroup.add(turbineRotorSpindle);

      const turbDiskGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.42, 54, 14);
      const turbDisk = new THREE.Mesh(turbDiskGeo, goldInconelMaterial);
      turbDisk.rotation.x = Math.PI / 2;
      turbDisk.position.z = 1.25;
      turbineRotorSpindle.add(turbDisk);

      const turbRimGeo = new THREE.CylinderGeometry(0.96, 0.96, 0.12, 54, 4);
      const turbRim = new THREE.Mesh(turbRimGeo, titaniumMaterial);
      turbRim.rotation.x = Math.PI / 2;
      turbRim.position.z = 1.05;
      turbineRotorSpindle.add(turbRim);

      const turbBladeCount = 20;
      for (let i = 0; i < turbBladeCount; i++) {
        const angle = (i / turbBladeCount) * Math.PI * 2;
        const tBladeGeo = new THREE.BoxGeometry(0.048, 0.62, 0.24, 4, 12, 6);
        tBladeGeo.translate(0, 1.15, 0);
        const tBlade = new THREE.Mesh(tBladeGeo, turbineBladeMaterial);
        tBlade.position.z = 1.25;
        tBlade.rotation.z = angle;
        tBlade.rotation.x = -0.42;
        tBlade.rotation.y = -0.15;
        turbineRotorSpindle.add(tBlade);
      }

      const locknutGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.18, 16, 4);
      const locknut = new THREE.Mesh(locknutGeo, titaniumMaterial);
      locknut.rotation.x = Math.PI / 2;
      locknut.position.z = 1.48;
      turbineRotorSpindle.add(locknut);

      // STAGE 5: EXHAUST NOZZLE & TAILCONE
      stage5ExhaustGroup = new THREE.Group();
      stage5ExhaustGroup.position.set(0, 0, 0);
      assemblyGroup.add(stage5ExhaustGroup);

      const exhaustNozzleGeo = new THREE.CylinderGeometry(1.48, 1.15, 1.4, 54, 24, true);
      const exhaustNozzle = new THREE.Mesh(exhaustNozzleGeo, cutawayCasingMaterial);
      exhaustNozzle.rotation.x = Math.PI / 2;
      exhaustNozzle.position.z = 2.15;
      stage5ExhaustGroup.add(exhaustNozzle);

      const exhaustFlangeGeo = new THREE.TorusGeometry(1.5, 0.06, 24, 64);
      const exhaustFlange = new THREE.Mesh(exhaustFlangeGeo, statorMaterial);
      exhaustFlange.position.z = 1.5;
      stage5ExhaustGroup.add(exhaustFlange);

      const tailconeGeo = new THREE.ConeGeometry(0.48, 1.35, 54, 20);
      const tailcone = new THREE.Mesh(tailconeGeo, goldInconelMaterial);
      tailcone.rotation.x = Math.PI / 2;
      tailcone.position.z = 2.3;
      stage5ExhaustGroup.add(tailcone);

      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const eStrutGeo = new THREE.BoxGeometry(0.045, 0.65, 0.25, 3, 10, 4);
        eStrutGeo.translate(0, 0.75, 0);
        const eStrut = new THREE.Mesh(eStrutGeo, statorMaterial);
        eStrut.position.z = 1.95;
        eStrut.rotation.z = angle;
        stage5ExhaustGroup.add(eStrut);
      }

      // CENTRAL ROTOR SHAFT & REAR BEARING
      // FIXED RPM ROTATION: Rotate geometry along Z axis at creation.
      // Rotation during animation will be strictly around Z axis to guarantee ZERO left-right translational wobble!
      shaftAssemblyGroup = new THREE.Group();
      shaftAssemblyGroup.position.set(0, 0, 0);
      assemblyGroup.add(shaftAssemblyGroup);

      const shaftGeo = new THREE.CylinderGeometry(0.14, 0.14, 4.8, 36, 36);
      shaftGeo.rotateX(Math.PI / 2); // Perfectly aligned along Z axis
      centralShaftMesh = new THREE.Mesh(shaftGeo, titaniumMaterial);
      centralShaftMesh.position.set(0, 0, 0);
      centralShaftMesh.rotation.set(0, 0, 0);
      shaftAssemblyGroup.add(centralShaftMesh);

      const rearBearingHousingGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 36, 6);
      const rearBearingHousing = new THREE.Mesh(rearBearingHousingGeo, statorMaterial);
      rearBearingHousing.rotation.x = Math.PI / 2;
      rearBearingHousing.position.z = 0.85;
      shaftAssemblyGroup.add(rearBearingHousing);

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const ballGeo = new THREE.SphereGeometry(0.065, 18, 18);
        const ball = new THREE.Mesh(ballGeo, ceramicBearingMaterial);
        ball.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.85);
        shaftAssemblyGroup.add(ball);
      }

      casingCutawayGroup = new THREE.Group();
      casingCutawayGroup.position.set(0, 0, 0);
      assemblyGroup.add(casingCutawayGroup);

      const casingRib1 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.04, 20, 64), statorMaterial);
      casingRib1.position.z = -1.2;
      casingCutawayGroup.add(casingRib1);

      const casingRib2 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.04, 20, 64), statorMaterial);
      casingRib2.position.z = 0.6;
      casingCutawayGroup.add(casingRib2);

      // HIGH-FIDELITY SWIRLING CFD STREAMLINES (1,000 Particles Optimized)
      const particleCount = 1000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const baseSpeeds = new Float32Array(particleCount);
      const particleRadii = new Float32Array(particleCount);
      const particleAngles = new Float32Array(particleCount);
      const particleStreamlineTypes = new Float32Array(particleCount); // 0: Core swirl, 1: Blade tip vortex, 2: Diffuser spiral

      const cfdCobalt = new THREE.Color(0x0284c7);
      const cfdCyan = new THREE.Color(0x00f0ff);
      const cfdIce = new THREE.Color(0xe0f2fe);
      const cfdTeal = new THREE.Color(0x14b8a6);

      for (let i = 0; i < particleCount; i++) {
        particleRadii[i] = 0.18 + Math.random() * 1.38;
        particleAngles[i] = Math.random() * Math.PI * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5.8;
        baseSpeeds[i] = 0.024 + Math.random() * 0.038;
        particleStreamlineTypes[i] = i % 3;

        positions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i];
        positions[i * 3 + 1] = Math.sin(particleAngles[i]) * particleRadii[i];

        colors[i * 3] = cfdCyan.r;
        colors[i * 3 + 1] = cfdCyan.g;
        colors[i * 3 + 2] = cfdCyan.b;
      }

      flowGeo = new THREE.BufferGeometry();
      flowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      flowGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      flowMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      flowSystem = new THREE.Points(flowGeo, flowMat);
      assemblyGroup.add(flowSystem);

      // DEDICATED TURBULENT HYDROGEN FLAME PARTICLES (600 Fire Particles Optimized)
      const flameParticleCount = 600;
      const fPositions = new Float32Array(flameParticleCount * 3);
      const fColors = new Float32Array(flameParticleCount * 3);
      const fSpeeds = new Float32Array(flameParticleCount);
      const fRadii = new Float32Array(flameParticleCount);
      const fAngles = new Float32Array(flameParticleCount);

      const fWhiteHot = new THREE.Color(0xffffff);
      const fHydroBlue = new THREE.Color(0x38bdf8);
      const fAmber = new THREE.Color(0xf59e0b);
      const fFlameOrange = new THREE.Color(0xea580c);

      for (let i = 0; i < flameParticleCount; i++) {
        fRadii[i] = 0.15 + Math.random() * 0.92;
        fAngles[i] = Math.random() * Math.PI * 2;
        fPositions[i * 3 + 2] = -0.2 + Math.random() * 1.15;
        fSpeeds[i] = 0.03 + Math.random() * 0.05;

        fPositions[i * 3] = Math.cos(fAngles[i]) * fRadii[i];
        fPositions[i * 3 + 1] = Math.sin(fAngles[i]) * fRadii[i];

        fColors[i * 3] = fHydroBlue.r;
        fColors[i * 3 + 1] = fHydroBlue.g;
        fColors[i * 3 + 2] = fHydroBlue.b;
      }

      flameGeo = new THREE.BufferGeometry();
      flameGeo.setAttribute('position', new THREE.BufferAttribute(fPositions, 3));
      flameGeo.setAttribute('color', new THREE.BufferAttribute(fColors, 3));

      const flamePointsMat = new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      flameSystem = new THREE.Points(flameGeo, flamePointsMat);
      stage3CombustorGroup.add(flameSystem);

      // Studio Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 1.25);
      scene.add(ambLight);

      const keySpotLight = new THREE.DirectionalLight(0xffffff, 2.9);
      keySpotLight.position.set(6, 8, 7);
      scene.add(keySpotLight);

      const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
      cyanRimLight.position.set(-6, 4, -4);
      scene.add(cyanRimLight);

      flamePointLight = new THREE.PointLight(0xf59e0b, 2.8, 14);
      flamePointLight.position.set(0, 0, 0.25);
      scene.add(flamePointLight);

      nozzleGlowLight = new THREE.PointLight(0x38bdf8, 1.6, 8);
      nozzleGlowLight.position.set(0, 0, 2.2);
      scene.add(nozzleGlowLight);

      // ANIMATION LOOP
      let currentExplodeZ = 0;
      let frameCount = 0;
      const posAttr = flowGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = flowGeo.attributes.color as THREE.BufferAttribute;
      const fPosAttr = flameGeo.attributes.position as THREE.BufferAttribute;
      const fColAttr = flameGeo.attributes.color as THREE.BufferAttribute;

      const animate = () => {
        if (isDisposed) return;
        animId = requestAnimationFrame(animate);

        if (!isVisible) return;
        frameCount++;
        const timeNow = performance.now();

        // Auto rotation around central longitudinal axis
        if (autoRotateRef.current && !isDragging) {
          sphericalTheta += 0.003;
          updateCameraPos();
        }

        const selComp = selectedComponentRef.current;
        if (selComp === 'intake') {
          targetCameraTarget.set(0, 0, isExplodedRef.current ? -3.4 : -1.8);
        } else if (selComp === 'compressor') {
          targetCameraTarget.set(0, 0, isExplodedRef.current ? -1.8 : -0.8);
        } else if (selComp === 'combustor') {
          targetCameraTarget.set(0, 0, 0.2);
        } else if (selComp === 'turbine') {
          targetCameraTarget.set(0, 0, isExplodedRef.current ? 1.5 : 1.1);
        } else if (selComp === 'exhaust') {
          targetCameraTarget.set(0, 0, isExplodedRef.current ? 3.3 : 2.1);
        } else {
          targetCameraTarget.set(0, 0, 0);
        }
        updateCameraPos();

        // FIXED ROTATION STEP: Rotates purely around Z axis
        const currentRpm = rpmRef.current;
        const rpmFraction = currentRpm / 50000;
        const rotationStep = rpmFraction * 0.44;

        compressorRotorSpindle.rotation.z += rotationStep;
        turbineRotorSpindle.rotation.z += rotationStep;
        centralShaftMesh.rotation.z += rotationStep;

        const targetExplode = isExplodedRef.current ? 1.0 : 0.0;
        currentExplodeZ += (targetExplode - currentExplodeZ) * 0.07;

        stage1IntakeGroup.position.z = -currentExplodeZ * 3.4;
        stage2CompressorGroup.position.z = -currentExplodeZ * 1.7;
        stage3CombustorGroup.position.z = 0;
        stage4TurbineGroup.position.z = currentExplodeZ * 1.6;
        stage5ExhaustGroup.position.z = currentExplodeZ * 3.4;

        const mode = visModeRef.current;

        // REALISTIC FEA STRESS WIREFRAME MESH TOGGLE (Von Mises Rainbow Contour Gradients)
        if (mode === 'fea') {
          // Peak Stress Zone: High centrifugal & thermal stress on turbine blisk blades & disc rim (592 MPa - Radiant Crimson)
          turbineBladeMaterial.wireframe = true;
          turbineBladeMaterial.color.setHex(0xef4444);
          turbineBladeMaterial.emissive.setHex(0xdc2626);
          turbineBladeMaterial.emissiveIntensity = 0.7;

          goldInconelMaterial.wireframe = true;
          goldInconelMaterial.color.setHex(0xf97316);
          goldInconelMaterial.emissive.setHex(0xc2410c);
          goldInconelMaterial.emissiveIntensity = 0.6;

          // Medium-High Stress: Compressor impeller blades & splitter vanes (440 MPa - Amber/Gold)
          titaniumMaterial.wireframe = true;
          titaniumMaterial.color.setHex(0xeab308);
          titaniumMaterial.emissive.setHex(0xa16207);
          titaniumMaterial.emissiveIntensity = 0.5;

          // Moderate Shear Stress: Central shaft and ceramic bearing raceways (280 MPa - Green)
          ceramicBearingMaterial.wireframe = true;
          ceramicBearingMaterial.color.setHex(0x22c55e);
          ceramicBearingMaterial.emissive.setHex(0x16a34a);
          ceramicBearingMaterial.emissiveIntensity = 0.45;

          // Intermediate Stress: Stationary diffuser vanes & combustor liner (160 MPa - Electric Cyan)
          statorMaterial.wireframe = true;
          statorMaterial.color.setHex(0x06b6d4);
          statorMaterial.emissive.setHex(0x0891b2);
          statorMaterial.emissiveIntensity = 0.4;

          combustorLinerMaterial.wireframe = true;
          combustorLinerMaterial.color.setHex(0x0284c7);
          combustorLinerMaterial.emissive.setHex(0x0369a1);
          combustorLinerMaterial.emissiveIntensity = 0.4;

          // Low Stress Structural Shell: Intake cowl and outer casing (45 MPa - Aerospace Royal Blue)
          cutawayCasingMaterial.wireframe = true;
          cutawayCasingMaterial.color.setHex(0x3b82f6);
          cutawayCasingMaterial.emissive.setHex(0x1d4ed8);
          cutawayCasingMaterial.emissiveIntensity = 0.35;
          cutawayCasingMaterial.opacity = 0.45;

          flowSystem.visible = false;
          combustionFlameGroup.visible = false;
          flameSystem.visible = false;
        } else {
          // Restore pristine aerospace metallic materials
          turbineBladeMaterial.wireframe = false;
          turbineBladeMaterial.color.setHex(0xa1a1aa);
          turbineBladeMaterial.emissive.setHex(0x0284c7);
          turbineBladeMaterial.emissiveIntensity = 0.18;

          goldInconelMaterial.wireframe = false;
          goldInconelMaterial.color.setHex(0xd4af37);
          goldInconelMaterial.emissive.setHex(0x000000);
          goldInconelMaterial.emissiveIntensity = 0.0;

          titaniumMaterial.wireframe = false;
          titaniumMaterial.color.setHex(0xcfd8dc);
          titaniumMaterial.emissive.setHex(0x000000);
          titaniumMaterial.emissiveIntensity = 0.0;

          ceramicBearingMaterial.wireframe = false;
          ceramicBearingMaterial.color.setHex(0x0ea5e9);
          ceramicBearingMaterial.emissive.setHex(0x0284c7);
          ceramicBearingMaterial.emissiveIntensity = 0.4;

          statorMaterial.wireframe = false;
          statorMaterial.color.setHex(0x334155);
          statorMaterial.emissive.setHex(0x000000);
          statorMaterial.emissiveIntensity = 0.0;

          combustorLinerMaterial.wireframe = false;
          combustorLinerMaterial.color.setHex(0x374151);
          combustorLinerMaterial.emissive.setHex(0x78350f);
          combustorLinerMaterial.emissiveIntensity = 0.25;

          cutawayCasingMaterial.wireframe = false;
          cutawayCasingMaterial.color.setHex(0x38bdf8);
          cutawayCasingMaterial.emissive.setHex(0x000000);
          cutawayCasingMaterial.emissiveIntensity = 0.0;
          cutawayCasingMaterial.opacity = 0.22;

          flowSystem.visible = mode === 'cfd';
          combustionFlameGroup.visible = mode === 'combustion';
          flameSystem.visible = mode === 'combustion';
        }

        // REALISTIC HYDROGEN FLAME ANIMATION (Dynamic Licking, Swirl & Turbulent Fluctuations)
        if (mode === 'combustion') {
          const tSec = timeNow * 0.001;
          const flameScaleTurb = Math.sin(tSec * 16) * 0.04 + Math.cos(tSec * 22) * 0.03;
          flameMantleMesh.scale.set(
            1.0 + flameScaleTurb * 0.8,
            1.0 + Math.cos(tSec * 18) * 0.04,
            1.0 + Math.sin(tSec * 12) * 0.03
          );
          flameCoreMesh.scale.set(
            1.0 + Math.sin(tSec * 24) * 0.06,
            1.0 + Math.cos(tSec * 28) * 0.06,
            1.0 + Math.sin(tSec * 15) * 0.04
          );

          // Animate the 8 injector swirl plumes with realistic jet wobble
          for (let pIdx = 0; pIdx < injectorPlumes.length; pIdx++) {
            const plume = injectorPlumes[pIdx];
            const pFlicker = Math.sin(tSec * 20 + pIdx * 1.2) * 0.08;
            plume.scale.set(1.0 + pFlicker, 1.0 + pFlicker * 1.4, 1.0 + pFlicker);
          }

          // Dedicated Combustion Flame Particles: Turbulent Swirl & Licking Fire Flakes
          const fpArr = fPosAttr.array as Float32Array;
          const fcArr = fColAttr.array as Float32Array;
          const flameSwirlSpd = (rpmFraction === 0 ? 0.04 : 0.08 + rpmFraction * 0.18);

          for (let i = 0; i < flameParticleCount; i++) {
            fAngles[i] += flameSwirlSpd * (1.2 / Math.max(0.2, fRadii[i]));
            fpArr[i * 3 + 2] += fSpeeds[i] * (1.0 + rpmFraction * 2.2);

            // Re-inject at injector plane
            if (fpArr[i * 3 + 2] > 0.95) {
              fpArr[i * 3 + 2] = -0.2;
              fRadii[i] = 0.15 + Math.random() * 0.92;
            }

            const zF = fpArr[i * 3 + 2];
            // Flame radial waist: pinched at core, flaring at reaction zone
            const flameRadiusFactor = Math.sin(Math.max(0, Math.min(Math.PI, ((zF + 0.2) / 1.15) * Math.PI)));
            const rEff = fRadii[i] * (0.65 + flameRadiusFactor * 0.55);

            fpArr[i * 3] = Math.cos(fAngles[i]) * rEff;
            fpArr[i * 3 + 1] = Math.sin(fAngles[i]) * rEff;

            // Temperature color gradient across flame tube
            if (zF < 0.15) {
              // Ultra-hot OH* chemiluminescent reaction zone (White-hot to Electric Cyan)
              const t = Math.max(0, Math.min(1, (zF + 0.2) / 0.35));
              fcArr[i * 3] = fWhiteHot.r + (fHydroBlue.r - fWhiteHot.r) * t;
              fcArr[i * 3 + 1] = fWhiteHot.g + (fHydroBlue.g - fWhiteHot.g) * t;
              fcArr[i * 3 + 2] = fWhiteHot.b + (fHydroBlue.b - fWhiteHot.b) * t;
            } else if (zF < 0.6) {
              // Solar golden amber intermediate flame brush
              const t = Math.max(0, Math.min(1, (zF - 0.15) / 0.45));
              fcArr[i * 3] = fHydroBlue.r + (fAmber.r - fHydroBlue.r) * t;
              fcArr[i * 3 + 1] = fHydroBlue.g + (fAmber.g - fHydroBlue.g) * t;
              fcArr[i * 3 + 2] = fHydroBlue.b + (fAmber.b - fHydroBlue.b) * t;
            } else {
              // Fiery orange licking flame tips
              const t = Math.max(0, Math.min(1, (zF - 0.6) / 0.35));
              fcArr[i * 3] = fAmber.r + (fFlameOrange.r - fAmber.r) * t;
              fcArr[i * 3 + 1] = fAmber.g + (fFlameOrange.g - fAmber.g) * t;
              fcArr[i * 3 + 2] = fAmber.b + (fFlameOrange.b - fAmber.b) * t;
            }
          }

          fPosAttr.needsUpdate = true;
          if (frameCount % 3 === 0) {
            fColAttr.needsUpdate = true;
          }
        }

        // SWIRLING AERODYNAMIC CFD STREAMLINES ANIMATION
        if (mode === 'cfd') {
          const pArr = posAttr.array as Float32Array;
          const cArr = colAttr.array as Float32Array;

          const flowSpeedMultiplier = rpmFraction === 0 ? 0.025 : 0.03 + rpmFraction * 2.8;
          const baseSwirlMultiplier = rpmFraction === 0 ? 0.04 : 0.06 + rpmFraction * 3.6;

          for (let i = 0; i < particleCount; i++) {
            const zPos = pArr[i * 3 + 2];
            let localSwirl = baseSwirlMultiplier;
            let rEffective = particleRadii[i];

            // Real Gas Turbine Aerodynamics & Helical Swirl Physics:
            if (zPos < -1.4) {
              // Stage 1 Intake: Smooth converging flow into cowl
              localSwirl *= 0.4;
              rEffective = Math.min(1.48, particleRadii[i] * 1.15);
            } else if (zPos >= -1.4 && zPos < -0.4) {
              // Stage 2 Centrifugal Impeller: High tangential acceleration!
              // Swirl spikes proportional to rotor speed and distance along blade
              const impellerProg = (zPos + 1.4) / 1.0;
              localSwirl *= 1.8 + impellerProg * 3.2;
              // Radial expansion as fluid is centrifugally pushed to impeller tip (r ~ 1.35)
              rEffective = 0.35 + (particleRadii[i] * 0.4) + impellerProg * 0.82;
            } else if (zPos >= -0.4 && zPos < 0.2) {
              // Radial Diffuser: Fluid flares outward into spiral vortex paths
              localSwirl *= 1.4;
              rEffective = Math.min(1.52, 0.95 + particleRadii[i] * 0.45);
            } else if (zPos >= 0.2 && zPos < 0.9) {
              // Combustor Recirculation: Helical swirl and core toroidal vortex
              localSwirl *= 1.2;
              rEffective = 0.45 + particleRadii[i] * 0.65;
            } else if (zPos >= 0.9 && zPos < 1.6) {
              // Stage 4 Turbine Blisk: High-velocity expansion through twisted aerofoils
              localSwirl *= 2.2;
              rEffective = 0.55 + particleRadii[i] * 0.68;
            } else {
              // Stage 5 Exhaust Nozzle: High-speed axial discharge, deswirled by exit struts
              localSwirl *= 0.5;
              rEffective = Math.max(0.22, particleRadii[i] * (1.0 - (zPos - 1.6) * 0.35));
            }

            // Helical swirl update (higher angular velocity near smaller radius for free vortex conservation)
            particleAngles[i] += ((baseSpeeds[i] * 3.4) / Math.max(0.25, rEffective)) * localSwirl;
            pArr[i * 3 + 2] += baseSpeeds[i] * flowSpeedMultiplier;

            // Loop streamline particles
            if (pArr[i * 3 + 2] > 3.0) {
              pArr[i * 3 + 2] = -3.0;
              particleRadii[i] = 0.18 + Math.random() * 1.35;
            }

            pArr[i * 3] = Math.cos(particleAngles[i]) * rEffective;
            pArr[i * 3 + 1] = Math.sin(particleAngles[i]) * rEffective;

            // Aerodynamic Mach-Number Velocity Color Gradient
            // Inlet: Cobalt Blue -> Impeller: Electric Cyan -> Throat: Ice White -> Recovery: Emerald Teal
            const normZ = Math.max(0, Math.min(1, (zPos + 3.0) / 6.0));
            if (normZ < 0.32) {
              const t = normZ / 0.32;
              cArr[i * 3] = cfdCobalt.r + (cfdCyan.r - cfdCobalt.r) * t;
              cArr[i * 3 + 1] = cfdCobalt.g + (cfdCyan.g - cfdCobalt.g) * t;
              cArr[i * 3 + 2] = cfdCobalt.b + (cfdCyan.b - cfdCobalt.b) * t;
            } else if (normZ < 0.65) {
              const t = (normZ - 0.32) / 0.33;
              cArr[i * 3] = cfdCyan.r + (cfdIce.r - cfdCyan.r) * t;
              cArr[i * 3 + 1] = cfdCyan.g + (cfdIce.g - cfdCyan.g) * t;
              cArr[i * 3 + 2] = cfdCyan.b + (cfdIce.b - cfdIce.b) * t;
            } else {
              const t = (normZ - 0.65) / 0.35;
              cArr[i * 3] = cfdIce.r + (cfdTeal.r - cfdIce.r) * t;
              cArr[i * 3 + 1] = cfdIce.g + (cfdTeal.g - cfdIce.g) * t;
              cArr[i * 3 + 2] = cfdIce.b + (cfdTeal.b - cfdIce.b) * t;
            }
          }

          posAttr.needsUpdate = true;
          if (frameCount % 3 === 0) {
            colAttr.needsUpdate = true;
          }
        }

        // Acoustic Flutter & Combustion Point Light Modulation
        const acousticFlutter = Math.sin(timeNow * 0.024) * 0.45 * rpmFraction + Math.cos(timeNow * 0.048) * 0.25 * rpmFraction;
        flamePointLight.intensity = Math.max(0.1, (0.5 + rpmFraction * 4.6) + acousticFlutter);
        flamePointLight.distance = 7 + rpmFraction * 14;

        nozzleGlowLight.intensity = Math.max(0.1, (0.25 + rpmFraction * 3.4));

        renderer.render(scene, camera);
      };

      animate();
    };

    // User Orbit Drag and Zoom Handlers
    const onMouseDown = (e: MouseEvent) => {
      // ONLY start 3D orbit drag if user clicked directly on the WebGL canvas, NOT on any HUD buttons or sliders
      if (!renderer || e.target !== renderer.domElement) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= dx * 0.008;
      sphericalPhi = Math.max(0.15, Math.min(Math.PI - 0.15, sphericalPhi - dy * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Natural mouse wheel scrolling: page scrolls freely unless user holds Ctrl or metaKey
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        cameraRadius = Math.max(3.2, Math.min(18.0, cameraRadius + e.deltaY * 0.006));
        updateCameraPos();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    // Touch Support
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (!renderer || e.target !== renderer.domElement) return;
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        sphericalTheta -= dx * 0.008;
        sphericalPhi = Math.max(0.15, Math.min(Math.PI - 0.15, sphericalPhi - dy * 0.008));
        updateCameraPos();
      }
    };
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // Window & Container Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      triggerResize();
    });
    resizeObserver.observe(container);

    // Pre-initialize scene 300ms after initial mount during browser idle
    // so it is 100% built, compiled, and ready in memory before the user scrolls down
    const prewarmTimer = setTimeout(() => {
      if (!isInitialized && !isDisposed) {
        initThreeScene();
      }
    }, 300);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (entry.isIntersecting && !isInitialized) {
          initThreeScene();
        }
      });
    }, { rootMargin: '600px 0px 600px 0px', threshold: 0.01 });

    observer.observe(container);

    return () => {
      isDisposed = true;
      clearTimeout(prewarmTimer);
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);

      if (renderer) {
        renderer.dispose();
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Telemetry Calculations
  const rpmFactor = rpm / 50000;
  const machNumber = (rpmFactor * 1.15).toFixed(2);
  const coreTemperature = Math.round(298 + rpmFactor * 1920);
  const massFlowRate = (rpmFactor * 0.88).toFixed(3);
  const netThrust = Math.round(rpmFactor * 520);

  const getStatusBadge = () => {
    if (rpm === 0) return { label: 'COLD SHUTDOWN', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    if (rpm < 15000) return { label: 'IDLE / SPOOL-UP', bg: 'bg-slate-800/90 text-amber-300 border-amber-600/50' };
    if (rpm < 38000) return { label: 'NOMINAL CRUISE', bg: 'bg-amber-950/60 text-amber-300 border-amber-600/50' };
    return { label: 'MAX AFTERBURN', bg: 'bg-amber-950/90 text-amber-300 border-amber-500' };
  };

  const status = getStatusBadge();
  const activeComponentData = TURBINE_COMPONENTS.find(c => c.id === selectedComponent);

  return (
    <section className={`pt-8 sm:pt-14 pb-10 px-4 sm:px-6 lg:px-8 mx-auto scroll-mt-20 transition-all duration-500 ${
      isTheaterMode ? 'max-w-[98vw]' : 'max-w-7xl'
    }`}>
      
      {/* Section Header */}
      <div className="mb-5 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          Micro-Turbine & Hydrogen Combustor Assembly Lab
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 w-full max-w-none leading-relaxed font-normal text-justify sm:text-left">
          Comprehensive multi-stage micro gas turbine assembly featuring a high-pressure centrifugal compressor with splitter blades, 
          stationary supersonic wedge diffuser, reverse-flow hydrogen combustor liner, single-crystal turbine blisk, and ceramic hybrid bearings.
        </p>
      </div>

      {/* Main 3D Simulation Frame */}
      <div className={`relative rounded-3xl overflow-hidden border-2 border-slate-300/90 dark:border-amber-400/30 bg-[#020617] shadow-[0_20px_60px_rgba(217,119,6,0.12)] transition-all duration-300 ${
        isTheaterMode 
          ? 'h-[820px] w-full' 
          : 'h-[620px] sm:h-[700px]'
      }`}>
        
        {/* Subtle radial depth glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

        {/* WebGL Canvas Container */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10">
          
          {/* Top Left Corner: Live Telemetry HUD (Request 6) */}
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-4 left-3 sm:left-4 z-20 max-w-[210px] sm:max-w-xs w-full pointer-events-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl border border-amber-400/30 shadow-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-100 pb-1.5 border-b border-slate-700/80">
                <span className="flex items-center gap-1.5 text-amber-400 text-[11px]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>TELEMETRY</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${status.bg}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px]">RPM</span>
                  <span className="text-amber-300 font-bold">{rpm.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">VELOCITY</span>
                  <span className="font-bold text-amber-400">
                    Ma {machNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">TEMP (T₀)</span>
                  <span className="text-amber-400 font-bold">{coreTemperature.toLocaleString()} K</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">ṁ FLOW</span>
                  <span className="text-amber-300 font-bold">{massFlowRate} kg/s</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-[9px]">THRUST:</span>
                  <span className="text-amber-300 font-bold text-[10px]">{netThrust} N</span>
                </div>
              </div>

              {/* Dynamic Mode-Specific Engineering Telemetry Bar */}
              {visMode === 'fea' && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">VON MISES STRESS</span>
                    <span className="text-red-400 font-bold">592.4 MPa MAX</span>
                  </div>
                  {/* Rainbow Stress Scale Bar */}
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-amber-400 to-red-500 shadow-sm" />
                  <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-400">
                    <span>15 MPa (Blue)</span>
                    <span>280 (Yield)</span>
                    <span className="text-red-400 font-bold">592 MPa</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-mono pt-0.5 text-slate-300">
                    <span>Mesh: 148.6k Tets</span>
                    <span className="text-emerald-400 font-bold">Safety Factor: 1.44</span>
                  </div>
                </div>
              )}

              {visMode === 'combustion' && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-amber-400 inline" />
                      <span>H₂ SWIRL FLAME</span>
                    </span>
                    <span className="text-cyan-300 font-mono">OH* CORE</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-white via-cyan-400 via-amber-400 to-orange-600 shadow-sm" />
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <span>8 Swirl Nozzles</span>
                    <span className="text-amber-300 font-bold">φ = 0.42 (Lean)</span>
                  </div>
                </div>
              )}

              {visMode === 'cfd' && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Wind className="w-2.5 h-2.5 text-cyan-400 inline" />
                      <span>HELICAL SWIRL VORTEX</span>
                    </span>
                    <span className="text-amber-300 font-mono">2.6k Trails</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-teal-300 to-white shadow-sm" />
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <span>Re: 2.48×10⁵</span>
                    <span className="text-cyan-300 font-bold">Centrifugal Swirl</span>
                  </div>
                </div>
              )}

              {/* Active Component Inspector Banner */}
              {activeComponentData && (
                <div className="mt-1.5 pt-1.5 border-t border-amber-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase truncate">
                      STAGE {activeComponentData.stageNum} · {activeComponentData.name.split(' ')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedComponent(null)}
                      className="text-slate-400 hover:text-white cursor-pointer ml-1"
                      title="Clear selection"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[9px] font-mono text-slate-300 mt-0.5 line-clamp-2 leading-tight">
                    {activeComponentData.specs}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Middle of Left Side: Assembly Stages Vertical Toolbar (Request 6) */}
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 p-1 sm:p-1.5 rounded-2xl bg-slate-900/95 border border-amber-400/30 backdrop-blur-xl shadow-2xl pointer-events-auto"
          >
            <div className="px-2.5 py-1 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Stages</span>
            </div>
            
            <button
              type="button"
              onClick={() => setSelectedComponent(null)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                selectedComponent === null
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Full Assembly</span>
            </button>
            
            {TURBINE_COMPONENTS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedComponent(c.id === selectedComponent ? null : c.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                  selectedComponent === c.id
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span className="text-[10px] font-mono opacity-70">{c.stageNum}</span>
                <span>{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Top Right: Zoom Controls, Circular Arrow (Auto-Rotate), and Widescreen Toggle */}
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto"
          >
            
            {/* Quick Zoom Buttons for Easy Mouse/Trackpad Control */}
            <div className="hidden sm:flex items-center bg-slate-900/90 rounded-xl border border-slate-700/80 p-0.5 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => zoomInRef.current?.()}
                className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => zoomOutRef.current?.()}
                className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => resetCameraRef.current?.()}
                className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Reset Camera View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Arrow Button: Auto-Rotation Toggle */}
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                autoRotate
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-amber-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={autoRotate ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
            >
              <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>

            {/* Widescreen Toggle (Moved to replace expand fullscreen, placed to the right of the circular arrow button) */}
            <button
              type="button"
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-lg flex items-center gap-1.5 ${
                isTheaterMode
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-amber-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isTheaterMode ? "Standard Viewport Size" : "Widescreen Cinema Expansion"}
            >
              <Tv className="w-4 h-4" />
              <span className="text-xs font-mono hidden sm:inline">{isTheaterMode ? 'Standard' : 'Widescreen'}</span>
            </button>
          </div>

          {/* Bottom Bar: Mode Switcher, Exploded View Toggle, Dynamic RPM Speed Slider */}
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-4 right-4 z-20 flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-400/30 shadow-2xl pointer-events-auto"
          >
            
            {/* Simulation Mode Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setVisMode('cfd')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  visMode === 'cfd'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>CFD Streamlines</span>
              </button>
              
              <button
                type="button"
                onClick={() => setVisMode('combustion')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  visMode === 'combustion'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-slate-950" />
                <span>Hydrogen Flame</span>
              </button>
              
              {/* Congested Wireframe FEA Mode */}
              <button
                type="button"
                onClick={() => setVisMode('fea')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  visMode === 'fea'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-slate-950" />
                <span>FEA Wireframe Mesh</span>
              </button>
            </div>

            {/* Exploded View Toggle Button & Dynamic RPM Speed Controller */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                type="button"
                onClick={() => setIsExploded(!isExploded)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-md ${
                  isExploded
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-amber-500/25'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExploded ? 'Assemble Core (Close)' : 'Explode Assembly View'}</span>
              </button>

              {/* Dynamic RPM Controller with strictly coaxial spin (No lateral translation or camera orbit) */}
              <div 
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-amber-400/30 shadow-inner"
              >
                <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400">TURBINE RPM</span>
                    <span className="text-[11px] font-mono text-amber-300 font-bold">
                      {(rpm / 1000).toFixed(0)}k RPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={rpm}
                    onChange={(e) => setRpm(Number(e.target.value))}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="w-24 sm:w-36 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    title="Drag to dynamically accelerate or slow turbine RPM"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Mouse Orbit Instruction Hint - Strictly One Line (Request 5) */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-amber-400/40 text-[11px] font-mono text-amber-200 pointer-events-none z-20 shadow-xl flex items-center gap-2 whitespace-nowrap select-none max-w-[90vw] overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Drag to rotate 360° · Scroll page freely · Zoom with buttons or hold Ctrl while scrolling</span>
          </div>

        </div>

      </div>
    </section>
  );
};
