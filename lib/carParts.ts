export type Vec3 = [number, number, number];
export type PartKey = 'home' | 'engine' | 'tires' | 'body' | 'interior';

export const PART_KEYS: PartKey[] = ['home', 'engine', 'tires', 'body', 'interior'];

// ======================= VRAI MODÈLE 3D DE JEEP =======================

// Emplacement du fichier du modèle (dans le dossier public du projet).
// Si vous avez un dossier Sketchfab avec scene.gltf, mettez par exemple '/models/jeep/scene.gltf'
export const MODEL_URL = '/models/car.glb';

// De quel côté est l'avant du modèle ? 'x', '-x', 'z' ou '-z'.
// Si la voiture apparaît de côté ou à l'envers, essayez les 4 valeurs une par une.
export const MODEL_FRONT: 'x' | '-x' | 'z' | '-z' = 'z';

// Noms exacts des pièces du capot dans le modèle.
// Laissez vide : le site cherche tout seul un nom contenant hood, bonnet ou capot.
// Si le capot ne s'ouvre pas, ouvrez localhost:3000/fr?debug pour voir les noms, puis écrivez-les ici.
export const HOOD_NODE_NAMES: string[] = [];

// Angle d'ouverture du capot, en degrés
export const HOOD_OPEN_DEG = 62;

// Vues de la caméra, en proportion de la taille de la voiture :
// x et z sont multipliés par la longueur, y par la hauteur.
// x : vers l'avant (+) ou l'arrière (-) ; y : vers le haut ; z : côté visible
export const MODEL_VIEWS: Record<
  PartKey,
  { pos: Vec3; target: Vec3; hood?: boolean; glass?: boolean }
> = {
  home: { pos: [1.45, 1.65, 1.45], target: [0, 0.5, 0] },
  engine: { pos: [0.9, 1.3, 0.62], target: [0.28, 0.62, 0], hood: true },
  tires: { pos: [0.55, 0.24, 0.5], target: [0.3, 0.24, 0.2] },
  body: { pos: [0.55, 0.85, 0.95], target: [0.05, 0.5, 0] },
  // glass : les vitres deviennent transparentes pour voir l'habitacle
  interior: { pos: [0.2, 1.25, 0.55], target: [0.02, 0.6, 0], glass: true },
};

// ======================= VOITURE STYLISÉE (secours) =======================
// Utilisée seulement si aucun modèle ni aucune photo n'est disponible.
export const PARTS: Record<PartKey, { position: Vec3; target: Vec3; openHood?: boolean }> = {
  home: { position: [6.2, 2.6, 6.2], target: [0, 0.8, 0] },
  engine: { position: [3.6, 2.8, 2.4], target: [1.4, 0.95, 0], openHood: true },
  tires: { position: [2.6, 0.8, 3.0], target: [1.35, 0.42, 0.95] },
  body: { position: [1.2, 1.5, 4.6], target: [0, 0.9, 0.9] },
  interior: { position: [0.3, 1.6, 3.1], target: [-0.4, 1.3, 0] },
};
