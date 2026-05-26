import { useEffect, useState } from 'react';
import ResponsiveImage from './ResponsiveImage';

/**
 * Image strip rendered at the top of each Programas Sociais card.
 *
 * Accepts `images` in three shapes (so the column can be either a JSON
 * array column or a stringified one — mysql2 sometimes returns either):
 *   - null/undefined  -> renders nothing
 *   - JSON string     -> parsed
 *   - array of urls   -> used directly
 *
 * - 0 images  : nothing rendered (card stays text-only, original look)
 * - 1 image   : static photo, no controls
 * - 2+ images : auto-rotating carousel + dots + arrows
 */
export default function ServiceCardGallery({ images, alt = '' }) {
  let list = [];
  if (Array.isArray(images)) list = images;
  else if (typeof images === 'string' && images.trim()) {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      // single URL stored as plain string
      list = [images];
    }
  }
  list = list.filter(Boolean);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (list.length < 2) return undefined;
    const t = setTimeout(() => setIdx((i) => (i + 1) % list.length), 5000);
    return () => clearTimeout(t);
  }, [idx, list.length]);

  if (list.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'var(--cream)', overflow: 'hidden' }}>
      {list.map((url, i) => (
        <div key={url + i} style={{ position: 'absolute', inset: 0, opacity: i === idx ? 1 : 0, transition: 'opacity .6s ease' }}>
          <ResponsiveImage
            src={url}
            kind="card"
            alt={alt}
            eager={i === 0}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ))}

      {list.length > 1 && (
        <>
          {/* Invisible click zones — left half goes back, right half advances */}
          <button
            type="button"
            onClick={() => setIdx((idx - 1 + list.length) % list.length)}
            aria-label="Foto anterior"
            style={{ position: 'absolute', left: 0, top: 0, bottom: 30, width: '40%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          />
          <button
            type="button"
            onClick={() => setIdx((idx + 1) % list.length)}
            aria-label="Próxima foto"
            style={{ position: 'absolute', right: 0, top: 0, bottom: 30, width: '40%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          />
          {/* Dots: visual indicator + manual nav */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 1 }}>
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Foto ${i + 1}`}
                style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 6, background: i === idx ? '#fff' : 'rgba(255,255,255,.55)', border: 'none', transition: 'all .25s', cursor: 'pointer', padding: 0, boxShadow: '0 1px 4px rgba(0,0,0,.3)' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
