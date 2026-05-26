import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import ResponsiveImage from '../components/ResponsiveImage';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ObraSocial() {
  const { data } = useFetch('/social');
  const { data: siteInfo } = useFetch('/site-info');
  const { data: programSlides } = useFetch('/program-slides');
  const s = siteInfo || {};
  const slides = Array.isArray(programSlides) ? programSlides : [];
  const [slideIdx, setSlideIdx] = useState(0);

  // Auto-advance the carousel every 5.5s when there's more than one slide
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setTimeout(() => setSlideIdx((i) => (i + 1) % slides.length), 5500);
    return () => clearTimeout(t);
  }, [slideIdx, slides.length]);
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

      {/* Programa gallery — single image when there's one slide, auto-rotating carousel otherwise */}
      {slides.length > 0 && (
        <section style={{ padding:'56px 24px 0', maxWidth:1200, margin:'0 auto' }}>
          <Reveal>
            <div style={{ position:'relative', borderRadius:20, overflow:'hidden', aspectRatio:'16/9', background:'#0d1c3a', boxShadow:'0 10px 40px rgba(13,28,58,.18)' }}>
              {slides.map((slide, i) => (
                <div key={slide.id} style={{ position:'absolute', inset:0, opacity: i === slideIdx ? 1 : 0, transition:'opacity .8s ease' }}>
                  <ResponsiveImage
                    src={slide.image_url}
                    kind="hero"
                    alt={slide.title || ''}
                    eager={i === 0}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                  />
                  {(slide.title || slide.subtitle) && (
                    <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'42px 36px 28px', background:'linear-gradient(to top, rgba(13,28,58,.85), transparent)' }}>
                      {slide.title && <h3 style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'clamp(20px,3vw,28px)', color:'#fff', marginBottom: slide.subtitle ? 6 : 0 }}>{slide.title}</h3>}
                      {slide.subtitle && <p style={{ fontSize:14, color:'rgba(255,255,255,.85)', maxWidth:640 }}>{slide.subtitle}</p>}
                    </div>
                  )}
                </div>
              ))}

              {slides.length > 1 && (
                <>
                  <button onClick={() => setSlideIdx((slideIdx - 1 + slides.length) % slides.length)} aria-label="Slide anterior"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,.18)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setSlideIdx((slideIdx + 1) % slides.length)} aria-label="Próximo slide"
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,.18)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <ChevronRight size={20} />
                  </button>
                  <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8 }}>
                    {slides.map((_, i) => (
                      <button key={i} onClick={() => setSlideIdx(i)} aria-label={`Ir para slide ${i + 1}`}
                        style={{ width: i === slideIdx ? 24 : 8, height:8, borderRadius:8, background: i === slideIdx ? '#fff' : 'rgba(255,255,255,.4)', border:'none', transition:'all .3s', cursor:'pointer' }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </section>
      )}

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
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20, marginBottom:56 }}>
              {services.map((sv, i) => (
                <Reveal key={sv.id} delay={i * 60}>
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'24px', transition:'transform .2s,box-shadow .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>{sv.icon}</div>
                    <h3 style={{ fontFamily:'Montserrat,sans-serif', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>{sv.title}</h3>
                    <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{sv.description}</p>
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

