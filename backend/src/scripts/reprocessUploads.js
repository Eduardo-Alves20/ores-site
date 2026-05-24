// One-shot script to (re)generate WebP variants for every original.
// Run inside the backend container after deploys that touch image processing:
//   docker exec ores-site-backend-1 node /app/backend/src/scripts/reprocessUploads.js
//   docker exec ores-site-backend-1 node /app/backend/src/scripts/reprocessUploads.js --force
import { originalsDir } from '../utils/uploads.js';
import { reprocessAll } from '../utils/imageProcessor.js';

const force = process.argv.includes('--force');

console.log(`Reprocessing originals in ${originalsDir}${force ? ' (force regenerate)' : ''}`);
console.time('done');

const result = await reprocessAll({ force });

console.log(`Originals scanned: ${result.total}`);
console.log(`Processed:         ${result.processed}`);
console.timeEnd('done');
process.exit(0);
