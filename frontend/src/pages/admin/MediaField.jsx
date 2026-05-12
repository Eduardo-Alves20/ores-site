import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, X } from 'lucide-react';
import api from '../../lib/api';

function CropModal({ file, onClose, onUpload }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#f9f7f4';
    ctx.fillRect(0, 0, size, size);

    const cover = Math.max(size / image.width, size / image.height) * zoom;
    const w = image.width * cover;
    const h = image.height * cover;
    ctx.drawImage(image, (size - w) / 2 + pos.x, (size - h) / 2 + pos.y, w, h);
  }, [image, zoom, pos]);

  const pointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: e.clientX, y: e.clientY, px: pos.x, py: pos.y });
  };

  const pointerMove = (e) => {
    if (!drag) return;
    setPos({ x: drag.px + e.clientX - drag.x, y: drag.py + e.clientY - drag.y });
  };

  const save = async () => {
    setSaving(true);
    canvasRef.current.toBlob(async (blob) => {
      const ext = file.type === 'image/png' ? 'png' : 'jpg';
      const cropped = new File([blob], `foto-recortada.${ext}`, { type: blob.type });
      await onUpload(cropped);
      setSaving(false);
      onClose();
    }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:4000, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:520, background:'#fff', borderRadius:14, boxShadow:'0 24px 64px rgba(0,0,0,.25)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)' }}>Ajustar foto</h3>
          <button type="button" onClick={onClose} style={{ width:34, height:34, borderRadius:8, color:'var(--text-soft)' }}><X size={18}/></button>
        </div>
        <div style={{ padding:22 }}>
          <div
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={() => setDrag(null)}
            style={{ width:'min(100%,360px)', aspectRatio:'1 / 1', margin:'0 auto 18px', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', cursor:drag?'grabbing':'grab', background:'var(--cream)' }}>
            <canvas ref={canvasRef} width={720} height={720} style={{ width:'100%', height:'100%', display:'block' }} />
          </div>

          <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Zoom</label>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width:'100%', accentColor:'var(--gold)' }} />

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
            <button type="button" onClick={onClose} style={{ padding:'10px 18px', borderRadius:8, border:'1px solid var(--border)', color:'var(--text-mid)', fontSize:13 }}>Cancelar</button>
            <button type="button" onClick={save} disabled={!image || saving} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:8, background:'var(--gold)', color:'#fff', fontWeight:700, fontSize:13 }}>
              <Check size={15}/>{saving ? 'Enviando...' : 'Usar foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaField({ label, value, onChange }) {
  const [cropFile, setCropFile] = useState(null);

  const upload = async (file) => {
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
          <img className="uploaded-media-fit" src={value} alt="" style={{ width:'100%', height:150, objectFit:'cover' }} />
        </div>
      )}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <label style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:8, background:'var(--navy)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <ImagePlus size={16} /> Enviar imagem
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setCropFile(e.target.files[0])} style={{ display:'none' }} />
        </label>
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="/uploads/imagem.webp ou https://..." style={{ flex:1, minWidth:0, padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, outline:'none' }} />
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ width:38, height:38, borderRadius:8, color:'#ef4444', background:'rgba(239,68,68,.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} />
          </button>
        )}
      </div>
      {cropFile && <CropModal file={cropFile} onClose={() => setCropFile(null)} onUpload={upload} />}
    </div>
  );
}
