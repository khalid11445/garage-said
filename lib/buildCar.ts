import * as THREE from 'three';

export function buildCar() {
  const group = new THREE.Group();

  const paint = new THREE.MeshStandardMaterial({ color: 0xe11d2e, metalness: 0.65, roughness: 0.28 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9fb4c7, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.28,
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, metalness: 0.3, roughness: 0.7 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 1, roughness: 0.25 });
  const headlight = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
  const taillight = new THREE.MeshStandardMaterial({ color: 0xff2030, emissive: 0xff1020, emissiveIntensity: 1.2 });

  const box = (
    w: number, h: number, d: number, mat: THREE.Material,
    x: number, y: number, z: number, parent: THREE.Object3D = group
  ) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // Carrosserie
  box(2.9, 0.7, 1.8, paint, -0.65, 0.65, 0);
  box(1.3, 0.5, 1.8, paint, 1.45, 0.55, 0);
  box(1.3, 0.3, 0.06, paint, 1.45, 0.95, 0.87);
  box(1.3, 0.3, 0.06, paint, 1.45, 0.95, -0.87);
  box(0.05, 0.3, 1.7, dark, 2.1, 0.95, 0);
  box(0.14, 0.3, 1.84, dark, 2.12, 0.42, 0);
  box(0.14, 0.3, 1.84, dark, -2.12, 0.42, 0);

  // Habitacle : vitres, montants, toit
  box(1.9, 0.62, 1.64, glass, -0.5, 1.31, 0);
  for (const x of [-1.4, 0.4]) for (const z of [0.78, -0.78]) box(0.08, 0.62, 0.08, paint, x, 1.31, z);
  box(1.8, 0.06, 1.66, paint, -0.5, 1.65, 0);

  // Feux et rétroviseurs
  for (const z of [0.65, -0.65]) {
    box(0.05, 0.14, 0.42, headlight, 2.14, 0.72, z);
    box(0.05, 0.14, 0.42, taillight, -2.14, 0.8, z);
  }
  for (const z of [0.95, -0.95]) box(0.1, 0.1, 0.18, paint, 0.35, 1.2, z);

  // Roues
  for (const x of [1.35, -1.35]) {
    for (const z of [0.95, -0.95]) {
      const wheel = new THREE.Group();
      wheel.position.set(x, 0.42, z);
      wheel.rotation.x = Math.PI / 2;
      wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 32), dark));
      wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.32, 24), metal));
      group.add(wheel);
    }
  }

  // Moteur (visible quand le capot s'ouvre)
  box(0.9, 0.2, 0.8, metal, 1.45, 0.9, 0);
  box(0.55, 0.06, 0.5, dark, 1.45, 1.03, 0);
  box(0.25, 0.18, 0.3, dark, 1.9, 0.89, 0.55);
  box(0.3, 0.18, 0.35, paint, 1.9, 0.89, -0.5);

  // Capot articulé à l'arrière
  const hood = new THREE.Group();
  hood.position.set(0.8, 1.1, 0);
  group.add(hood);
  box(1.3, 0.06, 1.8, paint, 0.65, 0, 0, hood);

  // Intérieur
  for (const z of [0.4, -0.4]) {
    box(0.5, 0.2, 0.5, dark, -0.6, 1.12, z);
    box(0.1, 0.45, 0.5, dark, -0.9, 1.35, z);
  }
  box(0.3, 0.18, 1.5, dark, 0.2, 1.1, 0);
  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 12, 32), dark);
  steering.position.set(0.0, 1.35, 0.4);
  steering.rotation.y = Math.PI / 2;
  group.add(steering);

  return { group, hood };
}