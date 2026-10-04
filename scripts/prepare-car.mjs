import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const input = 'car-raw';
const output = 'public/car360';

fs.mkdirSync(output, { recursive: true });

const files = fs
  .readdirSync(input)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.log('Aucune photo trouvée dans le dossier car-raw');
  process.exit(1);
}

let i = 0;
for (const f of files) {
  i++;
  const name = String(i).padStart(2, '0') + '.jpg';
  await sharp(path.join(input, f))
    .rotate()
    .resize({ width: 1600 })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(output, name));
  console.log(f, '->', name);
}

console.log(`${files.length} photos prêtes dans ${output}`);