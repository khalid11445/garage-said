'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Link } from '@/i18n/navigation';
import {
  HOOD_NODE_NAMES,
  HOOD_OPEN_DEG,
  MODEL_FRONT,
  MODEL_URL,
  MODEL_VIEWS,
  PARTS,
  PART_KEYS,
  type PartKey,
} from '@/lib/carParts';
import { buildCar } from '@/lib/buildCar';

type View = { pos: THREE.Vector3; target: THREE.Vector3; hood: boolean; glass: boolean };
type GlassEntry = { mat: THREE.Material; opacity: number; transparent: boolean; depthWrite: boolean };

const GLASS_RE = /glass|window|windshield|vitre|verre|pare.?brise/i;
const HOOD_RE = /hood|bonnet|capot/i;

export default function CarShowcase({ model = false }: { model?: boolean }) {
  const t = useTranslations('Car');
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ go: (k: PartKey) => void } | null>(null);
  const [active, setActive] = useState<PartKey>('home');
  const [status, setStatus] = useState<'loading' | 'ready' | 'stylized'>(model ? 'loading' : 'stylized');
  const [debugInfo, setDebugInfo] = useState<string[] | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const debug = new URLSearchParams(window.location.search).has('debug');

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL indisponible : la section reste vide, le reste du site fonctionne
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(...PARTS.home.position);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(5, 8, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0xe11d2e, 40, 20);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    // Plateau
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.4, 0.05, 64),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 })
    );
    floor.position.y = -0.025;
    scene.add(floor);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.1, 3.2, 64),
      new THREE.MeshBasicMaterial({ color: 0xe11d2e, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // Voiture stylisée (remplacée par le vrai modèle s'il se charge)
    const { group: car, hood } = buildCar();
    scene.add(car);

    // Vues de la caméra
    const views = {} as Record<PartKey, View>;
    PART_KEYS.forEach((k) => {
      views[k] = {
        pos: new THREE.Vector3(...PARTS[k].position),
        target: new THREE.Vector3(...PARTS[k].target),
        hood: !!PARTS[k].openHood,
        glass: false,
      };
    });

    let hoodTargets: THREE.Object3D[] = [hood];
    let hoodMax = 0.9;
    let hoodGoal = 0;
    const glassMats: GlassEntry[] = [];
    let glassLevel = 0;
    let glassGoal = 0;
    let goalPos: THREE.Vector3 | null = null;
    let goalTarget: THREE.Vector3 | null = null;
    let disposed = false;

    // Contrôles
    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(views.home.target);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.6;

    api.current = {
      go: (k) => {
        const v = views[k];
        goalPos = v.pos.clone();
        goalTarget = v.target.clone();
        hoodGoal = v.hood ? hoodMax : 0;
        glassGoal = v.glass ? 1 : 0;
        controls.autoRotate = k === 'home';
      },
    };
    // Si le visiteur prend la main, on arrête le déplacement automatique
    controls.addEventListener('start', () => {
      goalPos = null;
      goalTarget = null;
    });

    // ---------- Chargement du vrai modèle ----------
    let draco: DRACOLoader | null = null;
    if (model) {
      draco = new DRACOLoader();
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        MODEL_URL,
        (gltf) => {
          if (disposed) return;

          // Orientation : l'avant du modèle doit regarder vers +X
          const yaw = { x: 0, '-x': Math.PI, z: Math.PI / 2, '-z': -Math.PI / 2 }[MODEL_FRONT];
          const holder = new THREE.Group();
          holder.add(gltf.scene);
          holder.rotation.y = yaw;
          holder.updateMatrixWorld(true);

          // Mise à l'échelle (longueur 4,2) et pose sur le plateau
          let box = new THREE.Box3().setFromObject(holder);
          let size = box.getSize(new THREE.Vector3());
          holder.scale.setScalar(4.2 / Math.max(size.x, size.z));
          holder.updateMatrixWorld(true);
          box = new THREE.Box3().setFromObject(holder);
          size = box.getSize(new THREE.Vector3());
          const c = box.getCenter(new THREE.Vector3());
          holder.position.set(-c.x, -box.min.y, -c.z);
          holder.updateMatrixWorld(true);

          scene.remove(car);
          scene.add(holder);

          // Vues adaptées à la taille réelle du modèle
          const L = size.x;
          const H = size.y;
          PART_KEYS.forEach((k) => {
            const v = MODEL_VIEWS[k];
            views[k] = {
              pos: new THREE.Vector3(v.pos[0] * L, v.pos[1] * H, v.pos[2] * L),
              target: new THREE.Vector3(v.target[0] * L, v.target[1] * H, v.target[2] * L),
              hood: !!v.hood,
              glass: !!v.glass,
            };
          });
          camera.position.copy(views.home.pos);
          controls.target.copy(views.home.target);
          controls.update();

          // Recherche du capot
          const names: string[] = [];
          const candidates: THREE.Object3D[] = [];
          holder.traverse((o) => {
            if (o === holder) return;
            if (o.name) names.push(o.name);
            const isHood = HOOD_NODE_NAMES.length ? HOOD_NODE_NAMES.includes(o.name) : HOOD_RE.test(o.name);
            if (isHood) candidates.push(o);
          });
          // On garde seulement les pièces de plus haut niveau (pas leurs enfants)
          const tops = candidates.filter((n) => !candidates.some((other) => other !== n && other.getObjectById(n.id)));

          if (tops.length) {
            const hb = new THREE.Box3();
            tops.forEach((n) => hb.expandByObject(n));
            const pivot = new THREE.Group();
            pivot.position.set(hb.min.x, hb.max.y, (hb.min.z + hb.max.z) / 2); // charnière à l'arrière du capot
            scene.add(pivot);
            pivot.updateMatrixWorld(true);
            tops.forEach((n) => pivot.attach(n));
            hoodTargets = [pivot];
            hoodMax = (HOOD_OPEN_DEG * Math.PI) / 180;
          } else {
            hoodTargets = [];
            hoodMax = 0;
          }

          // Vitres : on mémorise leurs matériaux pour les rendre transparentes (vue intérieur)
          holder.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh) return;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if ((GLASS_RE.test(m.name) || GLASS_RE.test(mesh.name)) && !glassMats.some((g) => g.mat === m)) {
                glassMats.push({ mat: m, opacity: m.opacity, transparent: m.transparent, depthWrite: m.depthWrite });
              }
            });
          });

          if (debug) {
            setDebugInfo([
              `capot : ${tops.length ? tops.map((n) => n.name).join(', ') : 'AUCUN trouvé'}`,
              `vitres trouvées : ${glassMats.length}`,
              `taille : L ${L.toFixed(2)} · H ${H.toFixed(2)}`,
              '--- pièces du modèle ---',
              ...names.slice(0, 150),
            ]);
          }
          setStatus('ready');
        },
        undefined,
        () => {
          if (!disposed) setStatus('stylized'); // échec : on garde la voiture stylisée
        }
      );
    }

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // On ne dessine que lorsque la section est visible
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;

      if (goalPos && goalTarget) {
        camera.position.lerp(goalPos, 0.06);
        controls.target.lerp(goalTarget, 0.06);
        if (camera.position.distanceTo(goalPos) < 0.01) {
          goalPos = null;
          goalTarget = null;
        }
      }

      hoodTargets.forEach((h) => {
        h.rotation.z += (hoodGoal - h.rotation.z) * 0.08;
      });

      if (glassMats.length) {
        glassLevel += (glassGoal - glassLevel) * 0.08;
        const fading = glassLevel > 0.01;
        glassMats.forEach((g) => {
          const wantTransparent = g.transparent || fading;
          if (g.mat.transparent !== wantTransparent) {
            g.mat.transparent = wantTransparent;
            g.mat.needsUpdate = true;
          }
          g.mat.depthWrite = fading ? false : g.depthWrite;
          g.mat.opacity = fading ? g.opacity + (0.1 - g.opacity) * glassLevel : g.opacity;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      draco?.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      pmrem.dispose();
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
      api.current = null;
    };
  }, [model]);

  const select = (k: PartKey) => {
    setActive(k);
    api.current?.go(k);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-brand" />
      <p className="mt-4 max-w-2xl text-gray-600">{t('subtitle')}</p>

      <div className="relative mt-8 h-[380px] sm:h-[520px]">
        <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

        {status === 'loading' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
          </div>
        )}

        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-gray-300">
          {t('hint')}
        </p>

        {debugInfo && (
          <div className="absolute left-3 top-3 max-h-56 w-72 overflow-y-auto rounded bg-black/85 p-3 text-[11px] leading-snug text-yellow-300">
            {debugInfo.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PART_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => select(k)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === k ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
            }`}
          >
            {t(`parts.${k}.label`)}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-soft p-6">
        <h3 className="text-xl font-bold">{t(`parts.${active}.title`)}</h3>
        <p className="mt-2 text-gray-600">{t(`parts.${active}.text`)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/booking"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            {t('cta')}
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black"
          >
            {t('more')}
          </Link>
        </div>
      </div>
    </section>
  );
}
