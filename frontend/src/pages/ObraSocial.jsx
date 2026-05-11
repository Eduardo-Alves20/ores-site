import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { Link } from 'react-router-dom';

export default function ObraSocial() {
  const { data, loading } = useFetch('/social');
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  const services = data?.services || [];
  const courses = data?.courses || [];
  return (
    <div className="animate-page">
      <PageHeader headerKey="obra_social" eyebrow={s.obra_social_eyebrow || 'Obra Social'} title={s.obra_social_title || 'Obra Social Notre Dame de Fátima'} subtitle={s.obra_social_subtitle || 'Servindo a comunidade com amor e solidariedade há décadas.'} />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        <Reveal>
          <div style={{ background:'var(--navy)', borderRadius:16, padding:'40px 48px', marginBottom:56, display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'center' }}>
            <div>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:28, color:'#fff', fontWeight:700, marginBottom:12 }}>{s.obra_social_mission_title || 'Nossa Missão Social'}</h2>
              <RichTextContent
                html={s.obra_social_mission_text}
                fallback="A Obra Social Nossa Senhora de Fátima é o braço assistencial da Paróquia Espírito Santo, oferecendo serviços gratuitos e cursos profissionalizantes para famílias em situação de vulnerabilidade."
                dark
                style={{ fontSize:15, color:'rgba(255,255,255,.7)', lineHeight:1.75 }}
              />
            </div>
            <Link to={s.obra_social_cta_url || '/voluntario'} style={{ padding:'13px 28px', borderRadius:100, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:14, whiteSpace:'nowrap', flexShrink:0, transition:'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              {s.obra_social_cta_label || 'Seja Voluntário'}
            </Link>
          </div>
        </Reveal>

        {/* Services */}
        <Reveal>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:24, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Serviços Oferecidos</h2>
        </Reveal>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20, marginBottom:56 }}>
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'24px', transition:'transform .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Courses */}
        <Reveal>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:24, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Cursos Gratuitos</h2>
        </Reveal>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20 }}>
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontWeight:700, color:'var(--navy)' }}>{c.name}</h3>
                  {c.vacancies && <span style={{ fontSize:11, background:'rgba(184,148,90,.1)', color:'var(--gold)', padding:'3px 8px', borderRadius:100, fontWeight:700, flexShrink:0, marginLeft:8 }}>{c.vacancies} vagas</span>}
                </div>
                <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65, marginBottom:12 }}>{c.description}</p>
                <div style={{ fontSize:12, color:'var(--text-soft)', display:'flex', flexDirection:'column', gap:4 }}>
                  {c.duration && <span>Duração: {c.duration}</span>}
                  {c.schedule && <span>Horário: {c.schedule}</span>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

