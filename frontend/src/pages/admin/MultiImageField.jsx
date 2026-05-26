import { useState } from 'react';
import { ImagePlus, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../lib/api';

/**
 * Multi-image upload field. Stores an array of URLs.
 * Accepts `value` as either an array, a JSON-stringified array, or a single
 * URL string (legacy) — always emits an array via onChange.
 */
function normalize(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return [value];
    }
  }
  return [];
}

export default function MultiImageField({ label, value, onChange }) {
  const images = normalize(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setError('');
    setUploading(true);
    const next = [...images];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/admin/media', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        });
        if (res.data?.url) next.push(res.data.url);
      }
      onChange(next);
    } catch (e) {
      setError(e.response?.data?.error || 'Falha no upload de uma das imagens.');
      onChange(next); // commit what we have so far
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (idx) => onChange(images.filter((_, i) => i !== idx));
  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = images.slice();
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const moveDown = (idx) => {
    if (idx >= images.length - 1) return;
    const next = images.slice();
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 12 }}>
          {images.map((url, idx) => (
            <div key={url + idx} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--cream)' }}>
              <img src={url} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => removeAt(idx)} title="Remover"
                  style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(239,68,68,.92)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={13} />
                </button>
              </div>
              <div style={{ position: 'absolute', bottom: 4, left: 4, display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} title="Mover esquerda"
                  style={{ width: 24, height: 24, borderRadius: 6, background: idx === 0 ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.65)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
                  <ArrowUp size={12} />
                </button>
                <button type="button" onClick={() => moveDown(idx)} disabled={idx >= images.length - 1} title="Mover direita"
                  style={{ width: 24, height: 24, borderRadius: 6, background: idx >= images.length - 1 ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.65)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: idx >= images.length - 1 ? 'not-allowed' : 'pointer' }}>
                  <ArrowDown size={12} />
                </button>
              </div>
              <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,.7)', color: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 8, background: uploading ? '#94a3b8' : 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}>
        {uploading ? <><Loader2 size={16} className="spin" /> Enviando…</> : <><ImagePlus size={16} /> {images.length === 0 ? 'Enviar fotos' : 'Adicionar mais fotos'}</>}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          style={{ display: 'none' }}
        />
      </label>

      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}
      <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>
        {images.length === 0
          ? 'Suba 1 foto (vira imagem única) ou várias (vira carrossel automático).'
          : `${images.length} foto${images.length === 1 ? '' : 's'} adicionada${images.length === 1 ? '' : 's'}.${images.length === 1 ? ' Adicione mais para virar carrossel.' : ''}`}
      </p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
