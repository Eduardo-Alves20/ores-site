import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { useFetch } from '../hooks/useFetch';
import api from '../lib/api';
import { Mail, Phone, MapPin, Clock, AtSign, Users, Play, MessageCircle } from 'lucide-react';
import { useAppAlert } from '../components/AppAlert';

export default function Contato() {
  const { data: siteInfo } = useFetch('/site-info');
  const { notify } = useAppAlert();
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/contact', form);
      setStatus({ ok:true, msg:'Mensagem enviada com sucesso! Retornaremos em breve.' });
      notify({ type:'success', title:'Mensagem enviada', message:'Recebemos seu contato. Retornaremos em breve.' });
      setForm({ name:'', email:'', phone:'', subject:'', message:'' });
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao enviar. Tente novamente.';
      setStatus({ ok:false, msg: message });
      notify({ type:'error', title:'Erro ao enviar', message });
    } finally {
      setLoading(false);
    }
  };

  const info = siteInfo || {};
  const normalizeUrl = (value) => {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };
  const socialLinks = [
    info.site_instagram && { key: 'instagram', href: normalizeUrl(info.site_instagram), icon: <AtSign size={14} />, label: 'Instagram' },
    info.site_facebook && { key: 'facebook', href: normalizeUrl(info.site_facebook), icon: <Users size={14} />, label: 'Facebook' },
    info.site_youtube && { key: 'youtube', href: normalizeUrl(info.site_youtube), icon: <Play size={14} />, label: 'YouTube' },
    info.site_whatsapp && { key: 'whatsapp', href: `https://wa.me/${String(info.site_whatsapp).replace(/\D/g, '')}`, icon: <MessageCircle size={14} />, label: 'WhatsApp' },
  ].filter(Boolean);

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Fale Conosco" title="Contato" subtitle="Entre em contato com a Secretaria Paroquial." />
      <section style={{ padding:'72px 24px', maxWidth:1100, margin:'0 auto' }}>
        <div className="contato-layout" style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:32, alignItems:'start' }}>
          {/* Form */}
          <Reveal>
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'40px' }}>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:22, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Envie uma mensagem</h2>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="contato-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-soft)', marginBottom:6 }}>Nome *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none', transition:'border-color .2s' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-soft)', marginBottom:6 }}>E-mail *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none', transition:'border-color .2s' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                </div>
                <div className="contato-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-soft)', marginBottom:6 }}>Telefone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone:e.target.value })} style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none', transition:'border-color .2s' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-soft)', marginBottom:6 }}>Assunto</label>
                    <input value={form.subject} onChange={e => setForm({ ...form, subject:e.target.value })} style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none', transition:'border-color .2s' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-soft)', marginBottom:6 }}>Mensagem *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message:e.target.value })} style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, resize:'vertical', outline:'none', transition:'border-color .2s' }} onFocus={e => e.target.style.borderColor='var(--gold)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                {status && <p style={{ fontSize:14, color:status.ok?'#16a34a':'#dc2626', fontWeight:500 }}>{status.msg}</p>}
                <button type="submit" disabled={loading} style={{ padding:'13px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:700, fontSize:15, boxShadow:'0 4px 18px rgba(184,148,90,.35)', transition:'transform .2s,box-shadow .2s', opacity:loading?0.7:1 }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform='translateY(-2px)')}
                  onMouseLeave={e => e.currentTarget.style.transform=''}>
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>
          </Reveal>

          {/* Info sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Reveal delay={100}>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ background:'var(--navy)', padding:'18px 24px' }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, color:'#fff', fontWeight:600 }}>Informações</h3>
                </div>
                <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
                  {info.site_address && (
                    <div style={{ display:'flex', gap:12 }}>
                      <MapPin size={16} style={{ color:'var(--gold)', flexShrink:0, marginTop:2 }} />
                      <div><div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-soft)', marginBottom:3 }}>Endereço</div><div style={{ fontSize:14, color:'var(--navy)', lineHeight:1.6 }}>{info.site_address}</div></div>
                    </div>
                  )}
                  {(info.site_email || info.site_whatsapp) && (
                    <div style={{ display:'flex', gap:12 }}>
                      <Mail size={16} style={{ color:'var(--gold)', flexShrink:0, marginTop:2 }} />
                      <div><div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-soft)', marginBottom:3 }}>E-mail</div><div style={{ fontSize:14, color:'var(--navy)' }}>{info.site_email}</div></div>
                    </div>
                  )}
                  {info.site_phone && (
                    <div style={{ display:'flex', gap:12 }}>
                      <Phone size={16} style={{ color:'var(--gold)', flexShrink:0, marginTop:2 }} />
                      <div><div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-soft)', marginBottom:3 }}>Telefone</div><div style={{ fontSize:14, color:'var(--navy)' }}>{info.site_phone}</div></div>
                    </div>
                  )}
                  <div style={{ display:'flex', gap:12 }}>
                    <Clock size={16} style={{ color:'var(--gold)', flexShrink:0, marginTop:2 }} />
                    <div><div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-soft)', marginBottom:3 }}>Funcionamento</div><div style={{ fontSize:14, color:'var(--navy)', lineHeight:1.7 }}>{info.secretary_hours || 'Seg–Sex 8h–17h30\nSáb 8h–12h'}</div></div>
                  </div>
                  {socialLinks.length > 0 && (
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', paddingTop:4 }}>
                      {socialLinks.map((s) => (
                        <a
                          key={s.key}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={s.label}
                          aria-label={s.label}
                          style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'#fff', color:'var(--navy)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}
                        >
                          {s.icon}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 980px) {
          .contato-layout {
            grid-template-columns: 1fr !important;
            gap: 22px !important;
          }
        }
        @media (max-width: 680px) {
          .contato-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
