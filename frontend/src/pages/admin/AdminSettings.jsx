import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import { Save } from 'lucide-react';
import MediaField from './MediaField';

const sections = [
  {
    title: 'Identidade',
    fields: [
      ['site_name', 'Nome do site'],
      ['site_tagline', 'Linha de apoio'],
      ['site_logo_url', 'Logo', 'image'],
      ['site_address', 'Endereço', 'textarea'],
      ['secretary_hours', 'Horário de funcionamento'],
      ['maps_url', 'URL do Google Maps'],
    ],
  },
  {
    title: 'Contato e redes',
    fields: [
      ['site_email', 'E-mail', 'email'],
      ['site_whatsapp', 'WhatsApp'],
      ['site_phone', 'Telefone'],
      ['site_facebook', 'Facebook URL'],
      ['site_instagram', 'Instagram URL'],
      ['site_youtube', 'YouTube URL'],
      ['radio_stream_url', 'URL da Web Rádio'],
    ],
  },
  {
    title: 'Home',
    fields: [
      ['hero_eyebrow', 'Texto acima do título'],
      ['hero_title', 'Título principal'],
      ['hero_subtitle', 'Subtítulo', 'textarea'],
      ['hero_image_url', 'Imagem do hero', 'image'],
      ['hero_primary_label', 'Botão principal'],
      ['hero_primary_url', 'Link do botão principal'],
      ['hero_secondary_label', 'Botão secundário'],
      ['hero_secondary_url', 'Link do botão secundário'],
      ['daily_message', 'Mensagem do dia', 'textarea'],
      ['home_quick_title', 'Título dos acessos rápidos'],
      ['home_mission_eyebrow', 'Missão: etiqueta'],
      ['home_mission_title', 'Missão: título'],
      ['home_mission_text', 'Missão: texto', 'textarea'],
      ['home_mission_primary_label', 'Missão: botão principal'],
      ['home_mission_primary_url', 'Missão: link principal'],
      ['home_mission_secondary_label', 'Missão: botão secundário'],
      ['home_mission_secondary_url', 'Missão: link secundário'],
    ],
  },
  {
    title: 'Conheça',
    fields: [
      ['conheca_eyebrow', 'Etiqueta'],
      ['conheca_title', 'Título'],
      ['conheca_subtitle', 'Subtítulo', 'textarea'],
      ['conheca_history_title', 'Bloco: título'],
      ['conheca_history_text_1', 'Bloco: texto 1', 'textarea'],
      ['conheca_history_text_2', 'Bloco: texto 2', 'textarea'],
    ],
  },
  {
    title: 'Obra Social',
    fields: [
      ['obra_social_eyebrow', 'Etiqueta'],
      ['obra_social_title', 'Título'],
      ['obra_social_subtitle', 'Subtítulo', 'textarea'],
      ['obra_social_mission_title', 'Missão: título'],
      ['obra_social_mission_text', 'Missão: texto', 'textarea'],
      ['obra_social_cta_label', 'Botão'],
      ['obra_social_cta_url', 'Link do botão'],
    ],
  },
  {
    title: 'Voluntário',
    fields: [
      ['voluntario_eyebrow', 'Etiqueta'],
      ['voluntario_title', 'Título'],
      ['voluntario_subtitle', 'Subtítulo', 'textarea'],
      ['voluntario_cta_title', 'CTA: título'],
      ['voluntario_cta_text', 'CTA: texto', 'textarea'],
      ['voluntario_cta_label', 'CTA: botão'],
      ['voluntario_cta_url', 'CTA: link'],
    ],
  },
  {
    title: 'Cabeçalhos',
    fields: [
      ['news_title', 'Notícias: título'],
      ['news_subtitle', 'Notícias: subtítulo'],
      ['radio_title', 'Rádio: título'],
      ['radio_subtitle', 'Rádio: subtítulo'],
      ['homilies_title', 'Homilias: título'],
      ['homilies_subtitle', 'Homilias: subtítulo'],
      ['contact_title', 'Contato: título'],
      ['contact_subtitle', 'Contato: subtítulo'],
      ['priests_title', 'Padres: título'],
      ['priests_subtitle', 'Padres: subtítulo'],
      ['facilities_title', 'Instalações: título'],
      ['facilities_subtitle', 'Instalações: subtítulo'],
      ['calendar_title', 'Calendário: título'],
      ['calendar_subtitle', 'Calendário: subtítulo'],
      ['rooms_title', 'Salas: título'],
      ['rooms_subtitle', 'Salas: subtítulo'],
      ['groups_title', 'Grupos: título'],
      ['groups_subtitle', 'Grupos: subtítulo'],
      ['pastorals_title', 'Pastorais: título'],
      ['pastorals_subtitle', 'Pastorais: subtítulo'],
      ['communities_title', 'Comunidades: título'],
      ['communities_subtitle', 'Comunidades: subtítulo'],
    ],
  },
];

export default function AdminSettings() {
  const { data, refetch } = useFetch('/admin/settings');
  const [form, setForm] = useState({});
  const [active, setActive] = useState(sections[0].title);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setLoading(true);
    setMsg('');
    try {
      await api.put('/admin/settings', form);
      setMsg('Configurações salvas com sucesso.');
      refetch();
    } catch {
      setMsg('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ field }) => {
    const [key, label, type] = field;
    if (type === 'image') return <MediaField label={label} value={form[key] || ''} onChange={v => set(key, v)} />;
    const common = {
      value: form[key] || '',
      onChange: e => set(key, e.target.value),
      style: { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' },
      onFocus: e => e.target.style.borderColor = 'var(--gold)',
      onBlur: e => e.target.style.borderColor = 'var(--border)',
    };
    return (
      <div style={{ marginBottom:18 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
        {type === 'textarea'
          ? <textarea rows={3} {...common} style={{ ...common.style, resize:'vertical' }} />
          : <input type={type || 'text'} {...common} />}
      </div>
    );
  };

  const section = sections.find(s => s.title === active) || sections[0];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>Aparência e Páginas</h1>
          <p style={{ fontSize:13, color:'var(--text-soft)' }}>Edite textos, links e imagens mantendo o layout do site.</p>
        </div>
        <button onClick={save} disabled={loading} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:14, flexShrink:0 }}>
          <Save size={16}/>{loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {msg && <p style={{ marginBottom:18, fontSize:14, color:msg.includes('sucesso')?'#16a34a':'#dc2626', fontWeight:600 }}>{msg}</p>}

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24, alignItems:'start' }}>
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          {sections.map(s => (
            <button key={s.title} onClick={() => setActive(s.title)}
              style={{ display:'block', width:'100%', textAlign:'left', padding:'13px 16px', fontSize:13, fontWeight:active===s.title?700:500, color:active===s.title?'var(--gold)':'var(--navy)', background:active===s.title?'var(--cream)':'#fff', borderBottom:'1px solid var(--cream-dark)' }}>
              {s.title}
            </button>
          ))}
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:28 }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700, color:'var(--navy)', marginBottom:22 }}>{section.title}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:'0 18px' }}>
            {section.fields.map(field => (
              <div key={field[0]} style={{ gridColumn:field[2] === 'textarea' || field[2] === 'image' ? '1 / -1' : 'auto' }}>
                <Input field={field} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 220px 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(2,minmax(0,1fr))"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
