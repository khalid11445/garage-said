'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Link } from '@/i18n/navigation';
import { PARTS, PART_KEYS, MODEL_URL, type PartKey } from '@/lib/carParts';
import { buildCar } from '@/lib/buildCar';

export default function CarShowcase() {
  const t = useTranslations('Car');
  const mountRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ go: (k: PartKey) => void } | null>(null);
  const [active, setActive] = useState<PartKey>('home');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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

    // Voiture
    const { group: car, hood } = buildCar();
    scene.add(car);

    if (MODEL_URL) {
      new GLTFLoader().load(
        MODEL_URL,
        (gltf) => {
          const model = gltf.scene;
          const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
          model.scale.setScalar(4.2 / Math.max(size.x, size.z));
          const box = new THREE.Box3().setFromObject(model);
          const c = box.getCenter(new THREE.Vector3());
          model.position.set(-c.x, -box.min.y, -c.z);
          scene.remove(car);
          scene.add(model);
        },
        undefined,
        () => {} // en cas d'échec, on garde la voiture stylisée
      );
    }

    // Contrôles
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(...PARTS.home.target);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.6;

    let goalPos: THREE.Vector3 | null = null;
    let goalTarget: THREE.Vector3 | null = null;
    let hoodGoal = 0;

    api.current = {
      go: (k) => {
        const p = PARTS[k];
        goalPos = new THREE.Vector3(...p.position);
        goalTarget = new THREE.Vector3(...p.target);
        hoodGoal = p.openHood ? 0.9 : 0;
        controls.autoRotate = k === 'home';
      },
    };
    // Si le visiteur prend la main, on arrête le déplacement automatique
    controls.addEventListener('start', () => {
      goalPos = null;
      goalTarget = null;
    });

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
      hood.rotation.z += (hoodGoal - hood.rotation.z) * 0.08;
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
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
  }, []);

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
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-gray-300">
          {t('hint')}
        </p>
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