import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const { data, refetch } = useFetch('/admin/settings');
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async () => {
    setLoading(true);
    setMsg('');
    try {
      await api.put('/admin/settings', form);
      setMsg('Configurações salvas com sucesso!');
      refetch();
    } catch { setMsg('Erro ao salvar.'); }
    finally { setLoading(false); }
  };

  const F = ({ label, k, placeholder, type='text', textarea=false }) => (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
      {textarea
        ? <textarea rows={3} value={form[k]||''} onChange={e => setForm({ ...form, [k]:e.target.value })} placeholder={placeholder} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, resize:'vertical', outline:'none' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
        : <input type={type} value={form[k]||''} onChange={e => setForm({ ...form, [k]:e.target.value })} placeholder={placeholder} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
      }
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)' }}>Configurações do Site</h1>
        <button onClick={save} disabled={loading} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:14 }}>
          <Save size={16}/>{loading?'Salvando...':'Salvar'}
        </button>
      </div>
      {msg && <p style={{ marginBottom:20, fontSize:14, color:msg.includes('sucesso')?'#16a34a':'#dc2626', fontWeight:500 }}>{msg}</p>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'28px' }}>
          <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:20 }}>Identidade</h3>
          <F label="Nome do Site" k="site_name" />
          <F label="Endereço" k="site_address" textarea />
          <F label="Horário de Funcionamento" k="secretary_hours" />
          <F label="URL do Google Maps" k="maps_url" />
        </div>

        <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'28px' }}>
          <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:20 }}>Contato</h3>
          <F label="E-mail" k="site_email" type="email" />
          <F label="WhatsApp" k="site_whatsapp" />
          <F label="Telefone" k="site_phone" />
          <F label="Facebook URL" k="site_facebook" />
          <F label="Instagram URL" k="site_instagram" />
          <F label="YouTube URL" k="site_youtube" />
        </div>

        <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'28px' }}>
          <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:20 }}>Hero (Página Inicial)</h3>
          <F label="Título do Hero" k="hero_title" />
          <F label="Subtítulo do Hero" k="hero_subtitle" textarea />
          <F label="Mensagem do Dia" k="daily_message" textarea />
        </div>

        <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'28px' }}>
          <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:20 }}>Web Rádio</h3>
          <F label="URL do Stream (MP3 / Icecast)" k="radio_stream_url" />
          <p style={{ fontSize:12, color:'var(--text-soft)', marginTop:8 }}>Cole a URL do stream de áudio. Ex: http://stream.exemplo.com:8000/radio.mp3</p>
        </div>
      </div>
    </div>
  );
}
