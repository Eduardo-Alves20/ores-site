// One-shot script to generate responsive WebP variants for existing uploads.
// Run inside the backend container after deploying the image-processor feature:
//   docker exec ores-site-backend-1 node /app/backend/src/scripts/reprocessUploads.js
import { uploadsDir } from '../utils/uploads.js';
import { reprocessDirectory } from '../utils/imageProcessor.js';

const force = process.argv.includes('--force');

console.log(`Reprocessing uploads in ${uploadsDir}${force ? ' (force regenerate)' : ''}`);
console.time('done');

const result = await reprocessDirectory(uploadsDir, { force });

console.log(`Originals scanned: ${result.total}`);
console.log(`Newly processed:   ${result.processed}`);
console.timeEnd('done');
process.exit(0);
