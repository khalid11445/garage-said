export type Vec3 = [number, number, number];
export type PartKey = 'home' | 'engine' | 'tires' | 'body' | 'interior';

export const PART_KEYS: PartKey[] = ['home', 'engine', 'tires', 'body', 'interior'];

// Pour utiliser un vrai modèle : mettez le fichier dans public/models/car.glb
// puis remplacez null par '/models/car.glb'
export const MODEL_URL: string | null = null;

// position = où se place la caméra, target = le point regardé
export const PARTS: Record<PartKey, { position: Vec3; target: Vec3; openHood?: boolean }> = {
  home: { position: [6.2, 2.6, 6.2], target: [0, 0.8, 0] },
  engine: { position: [3.6, 2.8, 2.4], target: [1.4, 0.95, 0], openHood: true },
  tires: { position: [2.6, 0.8, 3.0], target: [1.35, 0.42, 0.95] },
  body: { position: [1.2, 1.5, 4.6], target: [0, 0.9, 0.9] },
  interior: { position: [0.3, 1.6, 3.1], target: [-0.4, 1.3, 0] },
};