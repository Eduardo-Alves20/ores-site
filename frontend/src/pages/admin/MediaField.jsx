import { useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import api from '../../lib/api';

// Single source of truth for image uploads in the admin.
// CropModal removed — the backend's imageProcessor (sharp) now generates
// 4 responsive variants (hero/mobile/card/thumb) with smart attention-based
// cropping, so client-side cropping is no longer needed.
export default function MediaField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // sharp processing can take a few seconds for large files
      });
      onChange(res.data.url);
    } catch (e) {
      setError(e.response?.data?.error || 'Falha no upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {value && (
        <div style={{ marginBottom: 10, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--cream)' }}>
          <img className="uploaded-media-fit" src={value} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 8, background: uploading ? '#94a3b8' : 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? <><Loader2 size={16} className="spin" /> Enviando…</> : <><ImagePlus size={16} /> Enviar imagem</>}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
        </label>
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/imagem.webp ou https://..."
          style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none' }}
        />
        {value && (
          <button type="button" onClick={() => onChange('')} title="Limpar"
            style={{ width: 38, height: 38, borderRadius: 8, color: '#ef4444', background: 'rgba(239,68,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}
      <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>
        PNG, JPG, WEBP ou GIF — até 16MB. O sistema gera versões otimizadas automaticamente.
      </p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
