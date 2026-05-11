import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { Heart, Users, BookOpen, Handshake, Send } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useAppAlert } from '../components/AppAlert';
import api from '../lib/api';

const areas = [
  { icon:<Heart size={28}/>, title:'Pastoral da Saúde', desc:'Visitas a hospitais e doentes em casa, oferecendo conforto espiritual e material.' },
  { icon:<Users size={28}/>, title:'Pastoral Social', desc:'Ações de solidariedade, distribuição de alimentos e apoio às famílias carentes.' },
  { icon:<BookOpen size={28}/>, title:'Catequese', desc:'Formação de crianças e jovens nos sacramentos da iniciação cristã.' },
  { icon:<Handshake size={28}/>, title:'Obra Social', desc:'Apoio na farmácia comunitária, cursos, bazar e atendimento social.' },
];

export default function Voluntario() {
  const { data: siteInfo } = useFetch('/site-info');
  const { notify } = useAppAlert();
  const s = siteInfo || {};
  const [form, setForm] = useState({ name: '', email: '', phone: '', area: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const message = [
        form.area && `Area de interesse: ${form.area}`,
        form.message,
      ].filter(Boolean).join('\n\n');

      await api.post('/contact', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: 'Voluntariado',
        message,
      });

      setStatus({ ok: true, msg: 'Mensagem enviada. A equipe vai receber no painel administrativo.' });
      notify({ type: 'success', title: 'Mensagem enviada', message: 'Seu interesse em ser voluntario chegou ao painel da secretaria.' });
      setForm({ name: '', email: '', phone: '', area: '', message: '' });
    } catch (err) {
      const message = err.response?.data?.error || 'Nao consegui enviar agora. Tente novamente.';
      setStatus({ ok: false, msg: message });
      notify({ type: 'error', title: 'Erro ao enviar', message });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none', background:'#fff' };
  const labelStyle = { display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6 };

  return (
    <div className="animate-page">
      <PageHeader headerKey="voluntario" eyebrow={s.voluntario_eyebrow || 'Comunidade'} title={s.voluntario_title || 'Quero ser Voluntário'} subtitle={s.voluntario_subtitle || 'Junte-se a nós! Há muitas formas de servir ao próximo.'} />
      <section style={{ padding:'72px 24px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:24, marginBottom:64 }}>
          {areas.map((a, i) => (
            <Reveal key={a.title} delay={i * 80}>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'32px 24px', textAlign:'center', transition:'transform .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(184,148,90,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--gold)' }}>{a.icon}</div>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:10 }}>{a.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="volunteer-contact" style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden', display:'grid', gridTemplateColumns:'0.9fr 1.1fr', boxShadow:'0 12px 36px rgba(26,39,68,.08)' }}>
            <div style={{ background:'var(--navy)', padding:'42px', color:'#fff' }}>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:28, color:'#fff', fontWeight:700, marginBottom:16 }}>{s.voluntario_cta_title || 'Pronto para servir?'}</h2>
              <RichTextContent
                html={s.voluntario_cta_text}
                fallback="Entre em contato com a secretaria paroquial ou nos envie uma mensagem. Teremos prazer em apresentar as oportunidades de voluntariado."
                dark
                style={{ fontSize:15, color:'rgba(255,255,255,.68)', lineHeight:1.75 }}
              />
            </div>

            <form onSubmit={submit} style={{ padding:'34px', display:'grid', gap:14 }}>
              <div className="volunteer-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div className="volunteer-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Area de interesse</label>
                  <select value={form.area} onChange={(e) => set('area', e.target.value)} style={inputStyle}>
                    <option value="">Selecionar...</option>
                    {areas.map((area) => <option key={area.title} value={area.title}>{area.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Mensagem *</label>
                <textarea required minLength={10} rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} style={{ ...inputStyle, resize:'vertical' }} />
              </div>
              {status && <p style={{ fontSize:13, color:status.ok?'#16a34a':'#dc2626', fontWeight:600 }}>{status.msg}</p>}
              <button type="submit" disabled={loading} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px 22px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:700, fontSize:14, opacity:loading?0.7:1 }}>
                <Send size={16} />{loading ? 'Enviando...' : (s.voluntario_cta_label || 'Enviar mensagem')}
              </button>
            </form>
          </div>
        </Reveal>
      </section>
      <style>{`
        @media (max-width: 860px) {
          .volunteer-contact {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 620px) {
          .volunteer-contact > div,
          .volunteer-contact form {
            padding: 26px 22px !important;
          }
          .volunteer-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
