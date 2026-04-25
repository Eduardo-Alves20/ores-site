import { ImagePlus, X } from 'lucide-react';
import api from '../../lib/api';

export default function MediaField({ label, value, onChange }) {
  const upload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/admin/media', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    onChange(res.data.url);
  };

  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
      {value && (
        <div style={{ marginBottom:10, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', background:'var(--cream)' }}>
          <img src={value} alt="" style={{ width:'100%', height:150, objectFit:'cover' }} />
        </div>
      )}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <label style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:8, background:'var(--navy)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <ImagePlus size={16} /> Enviar imagem
          <input type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])} style={{ display:'none' }} />
        </label>
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="/uploads/imagem.webp ou https://..." style={{ flex:1, minWidth:0, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, outline:'none' }} />
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ width:38, height:38, borderRadius:8, color:'#ef4444', background:'rgba(239,68,68,.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
