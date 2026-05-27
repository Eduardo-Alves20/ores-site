import { useState, useRef } from 'react';
import { Music, X, Loader2, Play, Pause } from 'lucide-react';
import api from '../../lib/api';

export default function AudioField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/audio', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // music files can be big
      });
      onChange(res.data.url);
    } catch (e) {
      setError(e.response?.data?.error || 'Falha no upload.');
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>

      {value && (
        <div style={{ marginBottom: 10, padding: '12px 14px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={togglePlay}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>Áudio anexado</div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.split('/').pop()}</div>
          </div>
          <audio
            ref={audioRef}
            src={value}
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 8, background: uploading ? '#94a3b8' : 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? <><Loader2 size={16} className="spin" /> Enviando…</> : <><Music size={16} /> {value ? 'Trocar áudio' : 'Enviar áudio'}</>}
          <input
            type="file"
            accept="audio/*"
            disabled={uploading}
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
            style={{ display: 'none' }}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} title="Remover"
            style={{ width: 38, height: 38, borderRadius: 8, color: '#ef4444', background: 'rgba(239,68,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}
      <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>
        MP3, WAV, OGG, AAC ou M4A — até 20MB. Recomenda-se manter abaixo de 5MB para um carregamento rápido.
      </p>
    </div>
  );
}
