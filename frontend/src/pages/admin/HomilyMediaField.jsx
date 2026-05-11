import { useRef, useState } from 'react';
import { Music, Video, X, Upload, Link } from 'lucide-react';
import api from '../../lib/api';

const MAX_MEDIA_DURATION_SECONDS = 10 * 60 * 60;

function getFileDurationSeconds(file, mediaType) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const element = document.createElement(mediaType === 'video' ? 'video' : 'audio');

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      element.removeAttribute('src');
      element.load();
    };

    element.preload = 'metadata';
    element.onloadedmetadata = () => {
      const duration = Number(element.duration);
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Duracao invalida.'));
        return;
      }
      resolve(duration);
    };
    element.onerror = () => {
      cleanup();
      reject(new Error('Nao foi possivel ler a duracao.'));
    };
    element.src = objectUrl;
  });
}

function SingleMediaInput({ label, icon: Icon, accept, mediaType, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(value ? 'url' : 'url');

  const upload = async (file) => {
    setUploading(true);
    setError('');
    try {
      const durationSeconds = await getFileDurationSeconds(file, mediaType);
      if (durationSeconds > MAX_MEDIA_DURATION_SECONDS) {
        setError('A midia excede o limite de 10 horas.');
        return;
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('duration_seconds', String(Math.round(durationSeconds)));
      const res = await api.post('/admin/homilies/media', fd, { timeout: 0 });
      onChange(res.data.url);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erro no upload.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const style = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans,sans-serif' };

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <Icon size={13} />{label}
      </label>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button type="button" onClick={() => setMode('url')}
          style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', background: mode === 'url' ? 'var(--navy)' : '#fff', color: mode === 'url' ? '#fff' : 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Link size={12} /> URL
        </button>
        <button type="button" onClick={() => setMode('file')}
          style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', background: mode === 'file' ? 'var(--navy)' : '#fff', color: mode === 'file' ? '#fff' : 'var(--text-mid)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Upload size={12} /> Arquivo
        </button>
      </div>

      {mode === 'url' ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={`https://... ou /uploads/arquivo`} style={{ ...style, flex: 1 }} />
          {value && (
            <button type="button" onClick={() => onChange('')} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 8, background: uploading ? '#ccc' : 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            <Upload size={15} />{uploading ? 'Enviando...' : `Selecionar ${mediaType === 'audio' ? 'audio' : 'video'}`}
            <input ref={inputRef} type="file" accept={accept} disabled={uploading}
              onChange={e => e.target.files?.[0] && upload(e.target.files[0])} style={{ display: 'none' }} />
          </label>
          {value && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-soft)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
              <button type="button" onClick={() => onChange('')} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{error}</p>}

      {value && mediaType === 'audio' && (
        <audio src={value} controls style={{ width: '100%', marginTop: 10, borderRadius: 8 }} />
      )}
      {value && mediaType === 'video' && (
        <a href={value} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>
          <Video size={13} /> Ver video
        </a>
      )}
    </div>
  );
}

export default function HomilyMediaField({ audioUrl, videoUrl, onAudioChange, onVideoChange }) {
  return (
    <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '16px 14px', marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Midia</p>
      <SingleMediaInput
        label="Audio" icon={Music} accept="audio/*" mediaType="audio"
        value={audioUrl} onChange={onAudioChange}
      />
      <SingleMediaInput
        label="Video" icon={Video} accept="video/*" mediaType="video"
        value={videoUrl} onChange={onVideoChange}
      />
    </div>
  );
}
