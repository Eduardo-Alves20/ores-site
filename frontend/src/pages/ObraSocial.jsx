import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import ServiceCardGallery from '../components/ServiceCardGallery';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';

export default function ObraSocial() {
  useSeo({
    title: 'Programas Sociais',
    description: 'Programas sociais gratuitos da ORES: banho da cidadania, cursos profissionalizantes, atendimento, cuidado e acolhimento para famílias em situação de vulnerabilidade.',
    keywords: 'ORES programas sociais, programas sociais gratuitos, banho da cidadania, cursos gratuitos, assistência social',
  });
  const { data } = useFetch('/social');
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  // Respect explicit empty strings — if the admin cleared a field on purpose,
  // do not silently restore old/default text. Only fall back to the legacy
  // key or the default when the new key has never been set at all.
  const setting = (primaryKey, fallbackKey, defaultValue = '') => {
    const primary = s?.[primaryKey];
    if (primary !== undefined && primary !== null) return primary;
    const fallback = s?.[fallbackKey];
    if (fallback !== undefined && fallback !== null) return fallback;
    return defaultValue;
  };
  const services = data?.services || [];
  const courses = data?.courses || [];
  return (
    <div className="animate-page">
      <PageHeader
        headerKey="programas"
        eyebrow={setting('programas_eyebrow', 'obra_social_eyebrow', 'Programas Sociais')}
        title={setting('programas_title', 'obra_social_title', 'Programas Sociais')}
        subtitle={setting('programas_subtitle', 'obra_social_subtitle', 'Reintegracao, capacitacao e apoio para familias em situacao de vulnerabilidade.')}
        imageUrl={setting('programas_image_url', 'obra_social_image_url')}
      />

      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        <Reveal>
          <div style={{ background:'var(--navy)', borderRadius:16, padding:'40px 48px', marginBottom:56, display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'center' }}>
            <div>
              <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:28, color:'#fff', fontWeight:700, marginBottom:12 }}>{setting('programas_mission_title', 'obra_social_mission_title', 'Nossa Missao Social')}</h2>
              <RichTextContent
                html={setting('programas_mission_text', 'obra_social_mission_text')}
                fallback="A ORES oferece programas sociais gratuitos e cursos profissionalizantes para familias em situacao de vulnerabilidade, promovendo reintegracao e autonomia."
                dark
                style={{ fontSize:15, color:'rgba(255,255,255,.7)', lineHeight:1.75 }}
              />
            </div>
            <Link to={setting('programas_cta_url', 'obra_social_cta_url', '/voluntario')} style={{ padding:'13px 28px', borderRadius:100, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:14, whiteSpace:'nowrap', flexShrink:0, transition:'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              {setting('programas_cta_label', 'obra_social_cta_label', 'Seja Voluntario')}
            </Link>
          </div>
        </Reveal>

        {/* Services */}
        {services.length > 0 && (
          <>
            <Reveal>
              <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:24, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Serviços Oferecidos</h2>
            </Reveal>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, marginBottom:56 }}>
              {services.map((sv, i) => (
                <Reveal key={sv.id} delay={i * 60}>
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', transition:'transform .2s,box-shadow .2s', height:'100%', display:'flex', flexDirection:'column' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                    <ServiceCardGallery images={sv.images} alt={sv.title} />
                    <div style={{ padding:'24px', flex:1 }}>
                      {sv.icon && <div style={{ fontSize:36, marginBottom:12 }}>{sv.icon}</div>}
                      <h3 style={{ fontFamily:'Montserrat,sans-serif', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>{sv.title}</h3>
                      <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{sv.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <>
            <Reveal>
              <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:24, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Cursos Disponíveis</h2>
            </Reveal>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20 }}>
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={i * 60}>
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'24px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <h3 style={{ fontFamily:'Montserrat,sans-serif', fontSize:17, fontWeight:700, color:'var(--navy)' }}>{c.name}</h3>
                      {c.vacancies && <span style={{ fontSize:11, background:'rgba(25,118,210,.1)', color:'var(--gold)', padding:'3px 8px', borderRadius:100, fontWeight:700, flexShrink:0, marginLeft:8 }}>{c.vacancies} vagas</span>}
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
          </>
        )}

        {services.length === 0 && courses.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-soft)' }}>
            <p>Os programas serão exibidos aqui em breve.</p>
          </div>
        )}
      </section>
    </div>
  );
}

