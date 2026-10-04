// Nombre de photos dans public/car360 (le script vous l'affiche à la fin)
export const FRAME_COUNT = 36;

// Les photos sont nommées 01.jpg, 02.jpg, 03.jpg...
export const FRAME_PATH = (index: number) =>
  `/car360/${String(index + 1).padStart(2, '0')}.jpg`;

// Format des photos : largeur / hauteur (16 / 9 pour un téléphone en paysage)
export const ASPECT = 16 / 9;

// Passez à true si la voiture tourne dans le mauvais sens quand on glisse
export const DRAG_INVERT = false;

export type PartKey = 'home' | 'engine' | 'tires' | 'body' | 'interior';
export const PART_KEYS: PartKey[] = ['home', 'engine', 'tires', 'body', 'interior'];

// angle : de quel côté on regarde la voiture (0 = face avant, 90 = côté, 180 = arrière)
// x, y   : centre du zoom, en % de la photo (0 à 100)
// zoom   : agrandissement (2 = deux fois plus grand)
// Ce sont des valeurs de départ : on les ajuste avec le mode ?debug (voir plus bas)
export const PARTS: Record<PartKey, { angle: number; x: number; y: number; zoom: number }> = {
  home: { angle: 0, x: 50, y: 50, zoom: 1 },
  engine: { angle: 0, x: 50, y: 58, zoom: 1.9 },
  tires: { angle: 90, x: 30, y: 76, zoom: 2.4 },
  body: { angle: 45, x: 50, y: 55, zoom: 1.5 },
  interior: { angle: 90, x: 50, y: 40, zoom: 2 },
};

export const angleToFrame = (angle: number) =>
  Math.round((angle / 360) * FRAME_COUNT) % FRAME_COUNT;