import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { Calendar, Users, Heart, Clock, MapPin, Copy, Gift, ChevronLeft, ChevronRight, Handshake, BookOpen, Phone } from 'lucide-react';
import { parseDateOnly } from '../lib/date';
import { useAppAlert } from '../components/AppAlert';
import { normalizeMediaUrl } from '../lib/media';

const MONTHS_PT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(timer); }
        else setVal(Math.floor(start));
      }, 16);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString('pt-BR')}{suffix}</span>;
}

export default function Home() {
  const { data } = useFetch('/home');
  const { notify } = useAppAlert();
  const settings = data?.settings || {};
  const heroSlides = data?.heroSlides || [];
  const events = data?.events || [];
  const news = data?.news || [];
  const regionais = data?.regionais || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const fallbackSlide = {
    eyebrow: settings.hero_eyebrow || 'Bem-vindo à',
    title: settings.hero_title || 'Transformando vidas com solidariedade',
    subtitle: settings.hero_subtitle || 'Reintegração social, programas de capacitação e apoio às famílias em situação de vulnerabilidade.',
    image_url: settings.hero_image_url || '',
    primary_label: settings.hero_primary_label || 'Conheça a ORES',
    primary_url: settings.hero_primary_url || '/quem-somos',
    secondary_label: settings.hero_secondary_label || 'Fale Conosco',
    secondary_url: settings.hero_secondary_url || '/contato',
    duration_ms: 6000,
  };
  const slides = (heroSlides.length ? heroSlides : [fallbackSlide]).map((slide) => ({
    ...slide,
    image_url: normalizeMediaUrl(slide.image_url),
  }));
  const hero = slides[currentSlide] || slides[0] || fallbackSlide;

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const duration = Math.max(Number(hero.duration_ms) || 6000, 1500);
    const timer = setTimeout(() => setCurrentSlide(i => (i + 1) % slides.length), duration);
    return () => clearTimeout(timer);
  }, [currentSlide, hero.duration_ms, slides.length]);

  const quickLinks = [
    { icon: <MapPin size={22} />, label: settings.menu_public_regionais || 'Unidades Regionais', to: '/regionais' },
    { icon: <BookOpen size={22} />, label: settings.menu_public_projetos || 'Projetos', to: '/projetos' },
    { icon: <Users size={22} />, label: settings.menu_public_espaco || 'Espaço ORES', to: '/espaco-ores' },
    { icon: <Heart size={22} />, label: settings.menu_public_programas_sobre || 'Programas Sociais', to: '/programas' },
    { icon: <Handshake size={22} />, label: settings.menu_public_voluntario || 'Voluntariado', to: '/voluntario' },
    { icon: <Calendar size={22} />, label: settings.menu_public_eventos || 'Eventos', to: '/calendario' },
  ];

  const donationSlides = [1, 2, 3]
    .map(i => ({ url: normalizeMediaUrl(settings[`donation_gallery_${i}_url`]), caption: settings[`donation_gallery_${i}_caption`] }))
    .filter(item => item.url);
  const [donationSlide, setDonationSlide] = useState(0);
  const donationBackgroundUrl = normalizeMediaUrl(settings.donation_background_url);
  const donationQrUrl = normalizeMediaUrl(settings.donation_qr_url);
  const hasDonationBackground = Boolean(donationBackgroundUrl);

  useEffect(() => {
    if (donationSlides.length < 2) return undefined;
    const timer = setTimeout(() => {
      setDonationSlide((idx) => (idx + 1) % donationSlides.length);
    }, 5200);
    return () => clearTimeout(timer);
  }, [donationSlide, donationSlides.length]);

  const copyPix = async () => {
    if (!settings.donation_pix_key) {
      notify({ type:'warning', title:'Chave Pix não cadastrada', message:'Cadastre a chave Pix no painel administrativo para habilitar a cópia.' });
      return;
    }
    try {
      await navigator.clipboard.writeText(settings.donation_pix_key);
      notify({ type:'success', title:'Chave Pix copiada', message:'Agora é só colar no aplicativo do banco para fazer a contribuição.' });
    } catch {
      notify({ type:'info', title:'Chave Pix', message:settings.donation_pix_key });
    }
  };

  const stats = [
    {
      value: Number(settings.home_stat_1_value || 3),
      suffix: settings.home_stat_1_suffix ?? '',
      label: settings.home_stat_1_label || 'Unidades Regionais',
      noCount: settings.home_stat_1_no_count === '1',
    },
    {
      value: Number(settings.home_stat_2_value || 15),
      suffix: settings.home_stat_2_suffix ?? '+',
      label: settings.home_stat_2_label || 'Projetos Ativos',
      noCount: settings.home_stat_2_no_count === '1',
    },
    {
      value: Number(settings.home_stat_3_value || 500),
      suffix: settings.home_stat_3_suffix ?? '+',
      label: settings.home_stat_3_label || 'Famílias Atendidas',
      noCount: settings.home_stat_3_no_count === '1',
    },
    {
      value: Number(settings.home_stat_4_value || 1992),
      suffix: settings.home_stat_4_suffix ?? '',
      label: settings.home_stat_4_label || 'Ano de Fundação',
      noCount: settings.home_stat_4_no_count !== '0',
    },
  ];

  return (
    <div className="animate-page">
      {/* ── Hero ── */}
      <section className="home-hero" style={{ background:'#000',minHeight:'100vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden' }}>
        {slides.map((slide, i) => slide.image_url && (
          <div key={slide.id || i} style={{ position:'absolute', inset:0, opacity:i === currentSlide ? 1 : 0, transition:'opacity .9s ease' }}>
            <img
              src={slide.image_url}
              alt=""
              aria-hidden="true"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'blur(18px)', transform:'scale(1.08)', opacity:.55 }}
            />
            <img
              src={slide.image_url}
              alt=""
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'center center', transform:i === currentSlide ? 'scale(1.01)' : 'scale(1)', transition:'transform 7s ease' }}
            />
          </div>
        ))}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.3) 60%,rgba(0,0,0,.1) 100%)' }} />
        {/* Rings */}
        <div style={{ position:'absolute',top:'50%',left:'50%',width:700,height:700,borderRadius:'50%',border:'1px solid rgba(25,118,210,.12)',transform:'translate(-50%,-50%)',animation:'ringPulse 6s ease-in-out infinite' }} />
        <div style={{ position:'absolute',top:'50%',left:'50%',width:500,height:500,borderRadius:'50%',border:'1px solid rgba(25,118,210,.12)',transform:'translate(-50%,-50%)',animation:'ringPulse 6s ease-in-out infinite',animationDelay:'1s' }} />
        <div style={{ position:'absolute',top:'50%',left:'50%',width:320,height:320,borderRadius:'50%',border:'1px solid rgba(25,118,210,.18)',transform:'translate(-50%,-50%)',animation:'ringPulse 6s ease-in-out infinite',animationDelay:'2s' }} />
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 60% 40%,rgba(25,118,210,.08) 0%,transparent 60%)' }} />

        <div className="home-hero-inner" style={{ maxWidth:1200,margin:'0 auto',padding:'120px 24px 80px',width:'100%',position:'relative',zIndex:1 }}>
          <div style={{ maxWidth:680 }}>
            <div className="animate-fade-up" style={{ fontSize:11,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold-light)',marginBottom:22 }}>
              {hero.eyebrow || 'Bem-vindo à'}
            </div>
            <h1 className="animate-fade-up home-hero-title" style={{ fontFamily:'Montserrat,sans-serif',fontSize:'clamp(44px,7vw,84px)',fontWeight:700,color:'#fff',lineHeight:1.08,marginBottom:20,animationDelay:'.1s' }}>
              {hero.title || 'Transformando vidas com solidariedade'}
            </h1>
            <RichTextContent
              className="animate-fade-up"
              html={hero.subtitle}
              fallback="Reintegração social, programas de capacitação e apoio às famílias em situação de vulnerabilidade."
              dark
              style={{ fontSize:17,color:'rgba(255,255,255,.65)',lineHeight:1.7,fontWeight:300,marginBottom:40,animationDelay:'.2s' }}
            />
            <div className="animate-fade-up home-hero-actions" style={{ display:'flex',gap:16,flexWrap:'wrap',animationDelay:'.3s' }}>
              <Link to={hero.primary_url || '/quem-somos'} className="btn-gold" style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'13px 28px',borderRadius:100,background:'var(--gold)',color:'#fff',fontWeight:600,fontSize:14,boxShadow:'0 4px 18px rgba(25,118,210,.35)',transition:'transform .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 26px rgba(25,118,210,.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 18px rgba(25,118,210,.35)'; }}>
                {hero.primary_label || 'Conheça a ORES'}
              </Link>
              <Link to={hero.secondary_url || '/contato'} style={{ display:'inline-flex',alignItems:'center',padding:'13px 28px',borderRadius:100,border:'1.5px solid rgba(255,255,255,.3)',color:'#fff',fontWeight:500,fontSize:14,transition:'background .2s,border-color .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='rgba(255,255,255,.3)'; }}>
                {hero.secondary_label || 'Fale Conosco'}
              </Link>
            </div>
            {slides.length > 1 && (
              <div style={{ display:'flex',gap:8,marginTop:34 }}>
                {slides.map((slide, i) => (
                  <button
                    key={slide.id || i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Ir para slide ${i + 1}`}
                    style={{ width:i === currentSlide ? 28 : 10,height:10,borderRadius:999,background:i === currentSlide ? 'var(--gold-light)' : 'rgba(255,255,255,.28)',transition:'width .2s, background .2s' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Daily message ── */}
      {settings.daily_message && (
        <Reveal>
          <div style={{ background:'var(--gold)',padding:'20px 24px',textAlign:'center' }}>
            <RichTextContent
              html={settings.daily_message}
              dark
              style={{ maxWidth:900,margin:'0 auto',fontFamily:'Montserrat,sans-serif',fontStyle:'italic',fontSize:'clamp(14px,2vw,18px)',color:'#fff',lineHeight:1.6 }}
            />
          </div>
        </Reveal>
      )}

      {/* ── Quick links ── */}
      <section style={{ padding:'72px 24px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center',marginBottom:48 }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12 }}>Acesso Rápido</div>
              <h2 style={{ fontFamily:'Montserrat,sans-serif',fontSize:'clamp(26px,4vw,40px)',fontWeight:700,color:'var(--navy)' }}>{settings.home_quick_title || 'O que você está procurando?'}</h2>
            </div>
          </Reveal>
          <div className="quick-links-grid" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16 }}>
            {quickLinks.map((ql, i) => (
              <Reveal key={ql.label} delay={i * 60}>
                <Link to={ql.to} style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',padding:'28px 20px',textAlign:'center',display:'block',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                  <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(25,118,210,.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',color:'var(--gold)' }}>
                    {ql.icon}
                  </div>
                  <div style={{ fontSize:13,fontWeight:600,color:'var(--navy)' }}>{ql.label}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Donation ── */}
      {settings.donation_enabled !== '0' && (
        <Reveal>
          <section style={{ padding:'0 24px 72px' }}>
            <div style={{ maxWidth:1200, margin:'0 auto', background:'#fff', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden', boxShadow:'0 18px 60px rgba(13,45,94,.08)', position:'relative' }}>
              {donationBackgroundUrl && (
                <>
                  <img src={donationBackgroundUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.2 }} />
                  <div className="donation-overlay" style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(13,45,94,.92) 0%,rgba(13,45,94,.82) 49%,rgba(240,246,255,.88) 50%,rgba(240,246,255,.94) 100%)' }} />
                </>
              )}
              <div className="donation-grid" style={{ display:'grid', gridTemplateColumns:'1.05fr .95fr', alignItems:'stretch', position:'relative' }}>
                <div className="donation-copy" style={{ padding:'44px 48px', background:hasDonationBackground ? 'transparent' : 'var(--navy)', color:'#fff', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', right:-90, top:-90, width:260, height:260, borderRadius:'50%', border:'1px solid rgba(66,165,245,.16)' }} />
                  <div style={{ position:'absolute', right:40, bottom:-120, width:300, height:300, borderRadius:'50%', border:'1px solid rgba(66,165,245,.1)' }} />
                  <div style={{ position:'relative' }}>
                    <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:'0 10px 28px rgba(25,118,210,.35)' }}><Gift size={24} /></div>
                    <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold-light)', marginBottom:14 }}>{settings.donation_eyebrow || 'Apoie nossa causa'}</div>
                    <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:'clamp(28px,4vw,44px)', lineHeight:1.15, fontWeight:700, marginBottom:18 }}>{settings.donation_title || 'Sua doação transforma realidades'}</h2>
                    <RichTextContent
                      html={settings.donation_text}
                      fallback="Com a sua contribuição, conseguimos manter nossos programas sociais, apoiar famílias em vulnerabilidade e ampliar nosso alcance nas comunidades. Qualquer valor faz diferença."
                      dark
                      style={{ fontSize:15, lineHeight:1.8, color:'rgba(255,255,255,.72)', marginBottom:28 }}
                    />
                    <button onClick={copyPix} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', borderRadius:999, background:'var(--gold)', color:'#fff', fontWeight:800, fontSize:14, boxShadow:'0 8px 26px rgba(25,118,210,.32)' }}>
                      <Copy size={16} />{settings.donation_button_label || 'Copiar chave Pix'}
                    </button>
                    {settings.donation_pix_key && <div style={{ marginTop:14, fontSize:12, color:'rgba(255,255,255,.55)', wordBreak:'break-word' }}>Pix: {settings.donation_pix_key}</div>}
                  </div>
                </div>
                <div className="donation-media" style={{ padding:'32px', display:'grid', gap:16, alignContent:'space-between', background:hasDonationBackground ? 'rgba(240,246,255,.72)' : 'var(--cream)' }}>
                  <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 }}>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>Impacto das doações</div>
                        <div style={{ fontSize:15, lineHeight:1.45, fontWeight:700, color:'var(--navy)' }}>
                          {donationSlides[donationSlide]?.caption || 'Sua contribuição transforma a comunidade todos os dias.'}
                        </div>
                      </div>
                      {donationSlides.length > 1 && (
                        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                          <button type="button" onClick={() => setDonationSlide(i => (i - 1 + donationSlides.length) % donationSlides.length)} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'#fff', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <ChevronLeft size={16} />
                          </button>
                          <button type="button" onClick={() => setDonationSlide(i => (i + 1) % donationSlides.length)} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'#fff', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    {donationSlides.length ? (
                      <div style={{ position:'relative', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', background:'#ddeaf8', aspectRatio:'16 / 9' }}>
                        {donationSlides.map((item, i) => (
                          <img
                            className="uploaded-media-fit"
                            key={`${item.url}-${i}`}
                            src={item.url}
                            alt={item.caption || 'Foto de impacto'}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:i === donationSlide ? 1 : 0, transform:i === donationSlide ? 'scale(1.02)' : 'scale(1)', transition:'opacity .45s ease, transform 3.6s ease' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ background:'var(--cream)', border:'1px dashed var(--border)', borderRadius:12, padding:24, textAlign:'center' }}>
                        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:18, color:'var(--navy)', marginBottom:6 }}>Adicione fotos no painel</div>
                        <div style={{ fontSize:13, color:'var(--text-soft)' }}>Preencha Foto 1, Foto 2 e Foto 3 na aba Doações.</div>
                      </div>
                    )}
                    {donationSlides.length > 1 && (
                      <div style={{ display:'flex', justifyContent:'center', gap:7, marginTop:12 }}>
                        {donationSlides.map((item, i) => (
                          <button
                            type="button"
                            key={`${item.url}-dot-${i}`}
                            onClick={() => setDonationSlide(i)}
                            aria-label={`Ir para foto ${i + 1}`}
                            style={{ width:i === donationSlide ? 20 : 8, height:8, borderRadius:999, background:i === donationSlide ? 'var(--gold)' : 'rgba(13,45,94,.2)', transition:'width .2s, background .2s' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {donationQrUrl && (
                      <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:16, boxShadow:'0 6px 22px rgba(0,0,0,.05)', display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <img src={donationQrUrl} alt="QR Code Pix" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width:160, height:160, objectFit:'contain' }} />
                        <div style={{ marginTop:10, textAlign:'center', fontSize:11, fontWeight:800, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Pix QR Code</div>
                      </div>
                    )}
                    <a
                      href="https://www.paypal.com/donate?hosted_button_id=WPZWP2RXDTYDC"
                      target="_top"
                      rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'#0070ba', color:'#fff', fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:14, padding:'13px 16px', borderRadius:12, textDecoration:'none', boxShadow:'0 4px 16px rgba(0,112,186,.35)', transition:'background .2s, transform .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='#005ea6'; e.currentTarget.style.transform='translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='#0070ba'; e.currentTarget.style.transform='translateY(0)'; }}>
                      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" style={{ height:18, borderRadius:3 }} />
                      Donate with PayPal
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ── Events ── */}
      <section style={{ padding:'0 24px 72px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <Reveal>
            <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:28 }}>
              <h2 style={{ fontFamily:'Montserrat,sans-serif',fontSize:22,fontWeight:700,color:'var(--navy)',whiteSpace:'nowrap' }}>Próximos Eventos</h2>
              <div style={{ flex:1,height:1,background:'var(--border)' }} />
              <Link to="/calendario" style={{ fontSize:12,color:'var(--text-soft)',fontWeight:500,whiteSpace:'nowrap' }}>Ver todos</Link>
            </div>
          </Reveal>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12 }}>
            {events.map((ev, i) => {
              const d = parseDateOnly(ev.event_date);
              const day = d ? String(d.getDate()).padStart(2,'0') : '--';
              const month = d ? MONTHS_PT[d.getMonth()] : '';
              return (
                <Reveal key={ev.id} delay={i * 80}>
                  <div className="event-card" style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',padding:'20px 24px',display:'flex',gap:20,alignItems:'flex-start',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                    <div style={{ textAlign:'center',minWidth:52,background:'var(--navy)',borderRadius:10,padding:'10px 8px',flexShrink:0 }}>
                      <div style={{ fontSize:24,fontWeight:700,color:'#fff',fontFamily:'Montserrat,sans-serif',lineHeight:1 }}>{day}</div>
                      <div style={{ fontSize:9,fontWeight:700,letterSpacing:'0.1em',color:'var(--gold-light)',textTransform:'uppercase',marginTop:2 }}>{month}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <span style={{ display:'inline-block',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',padding:'2px 8px',borderRadius:100,background:'rgba(25,118,210,.1)',color:'var(--gold)',marginBottom:6 }}>{ev.category}</span>
                      <div style={{ fontWeight:700,fontSize:15,color:'var(--navy)',marginBottom:6,lineHeight:1.3 }}>{ev.title}</div>
                      <div className="event-meta" style={{ display:'flex',gap:16,fontSize:12,color:'var(--text-soft)' }}>
                        {ev.start_time && <span style={{ display:'flex',alignItems:'center',gap:4 }}><Clock size={12} />{ev.start_time.slice(0,5)}h{ev.end_time && `–${ev.end_time.slice(0,5)}h`}</span>}
                        {ev.location && <span style={{ display:'flex',alignItems:'center',gap:4 }}><MapPin size={12} />{ev.location}</span>}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            {events.length === 0 && (
              <div style={{ textAlign:'center',padding:'40px 0',color:'var(--text-soft)',fontSize:14,gridColumn:'1/-1' }}>Nenhum evento próximo.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <Reveal>
        <section style={{ background:'var(--navy)',padding:'72px 24px' }}>
          <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:48,textAlign:'center' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'clamp(36px,5vw,56px)',fontWeight:700,color:'var(--gold-light)',lineHeight:1,marginBottom:12 }}>
                  {s.noCount ? s.value : <Counter target={s.value} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize:14,color:'rgba(255,255,255,.55)',fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Regionais ── */}
      {regionais.length > 0 && (
        <section style={{ padding:'72px 24px' }}>
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <Reveal>
              <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:36 }}>
                <h2 style={{ fontFamily:'Montserrat,sans-serif',fontSize:28,fontWeight:700,color:'var(--navy)',whiteSpace:'nowrap' }}>Nossas Unidades Regionais</h2>
                <div style={{ flex:1,height:1,background:'var(--border)' }} />
                <Link to="/regionais" style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Ver todas →</Link>
              </div>
            </Reveal>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:24 }}>
              {regionais.map((r, i) => (
                <Reveal key={r.id} delay={i * 100}>
                  <div style={{ background:'#fff',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                    {r.image_url && (
                      <img src={r.image_url} alt={r.name} onError={e => { e.currentTarget.style.display='none'; }}
                        style={{ width:'100%', height:140, objectFit:'cover', display:'block' }} />
                    )}
                    <div style={{ padding:'22px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                        <span style={{ fontSize:12,fontWeight:700,padding:'2px 10px',borderRadius:100,background:'rgba(25,118,210,.1)',color:'var(--gold)' }}>{r.city}{r.state ? ` — ${r.state}` : ''}</span>
                      </div>
                      <h3 style={{ fontFamily:'Montserrat,sans-serif',fontSize:16,fontWeight:700,color:'var(--navy)',marginBottom:8 }}>{r.name}</h3>
                      {r.address && (
                        <div style={{ display:'flex',gap:6,alignItems:'flex-start',fontSize:13,color:'var(--text-soft)',marginBottom:6 }}>
                          <MapPin size={13} style={{ flexShrink:0,marginTop:2,color:'var(--gold)' }} />
                          <span>{r.address}</span>
                        </div>
                      )}
                      {r.phone && (
                        <div style={{ display:'flex',gap:6,alignItems:'center',fontSize:13,color:'var(--text-soft)',marginBottom:6 }}>
                          <Phone size={13} style={{ flexShrink:0,color:'var(--gold)' }} />
                          <span>{r.phone}</span>
                        </div>
                      )}
                      {r.maps_url && (
                        <a href={r.maps_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize:13,color:'var(--gold)',fontWeight:600,marginTop:8,display:'inline-block' }}>
                          Como chegar →
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── News ── */}
      {news.length > 0 && (
        <section style={{ padding:'72px 24px' }}>
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <Reveal>
              <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:36 }}>
                <h2 style={{ fontFamily:'Montserrat,sans-serif',fontSize:28,fontWeight:700,color:'var(--navy)',whiteSpace:'nowrap' }}>Últimas Notícias</h2>
                <div style={{ flex:1,height:1,background:'var(--border)' }} />
                <Link to="/noticias" style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Ver todas →</Link>
              </div>
            </Reveal>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:24 }}>
              {news.map((n, i) => (
                <Reveal key={n.id} delay={i * 100}>
                  <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                    <div style={{ height:8,background:'var(--gold)' }} />
                    <div style={{ padding:'24px' }}>
                      <span style={{ fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',padding:'2px 8px',borderRadius:100,background:'rgba(13,45,94,.08)',color:'var(--navy)',display:'inline-block',marginBottom:10 }}>{n.category}</span>
                      <h3 style={{ fontFamily:'Montserrat,sans-serif',fontSize:17,fontWeight:700,color:'var(--navy)',marginBottom:10,lineHeight:1.35 }}>{n.title}</h3>
                      <p style={{ fontSize:13,color:'var(--text-mid)',lineHeight:1.65,marginBottom:16 }}>{n.summary}</p>
                      {n.external_url ? (
                        <a href={n.external_url} target="_blank" rel="noreferrer" style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Saiba mais →</a>
                      ) : (
                        <Link to={`/noticias/${n.slug}`} style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Ler mais →</Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Mission card ── */}
      <Reveal>
        <section style={{ padding:'0 24px 96px' }}>
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <div className="mission-card" style={{ background:'var(--navy)',borderRadius:20,padding:'56px 64px',display:'grid',gridTemplateColumns:'1fr auto',gap:48,alignItems:'center' }}>
              <div>
                <div style={{ fontSize:11,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold-light)',marginBottom:16 }}>{settings.home_mission_eyebrow || 'Nossa Missão'}</div>
                <h2 style={{ fontFamily:'Montserrat,sans-serif',fontSize:'clamp(24px,3.5vw,38px)',fontWeight:700,color:'#fff',lineHeight:1.25,marginBottom:20 }}>
                  {settings.home_mission_title || 'Reintegrar, capacitar e transformar com amor'}
                </h2>
                <RichTextContent
                  html={settings.home_mission_text}
                  fallback="A ORES é uma organização comprometida com a reintegração social e o desenvolvimento humano, atuando em parceria com comunidades, famílias e voluntários em todo o estado."
                  dark
                  style={{ fontSize:15,color:'rgba(255,255,255,.6)',lineHeight:1.75 }}
                />
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:16,flexShrink:0 }}>
                <Link to={settings.home_mission_primary_url || '/quem-somos'} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'13px 28px',borderRadius:100,background:'var(--gold)',color:'#fff',fontWeight:600,fontSize:14,boxShadow:'0 4px 18px rgba(25,118,210,.35)',transition:'transform .2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform=''}>
                  {settings.home_mission_primary_label || 'Saiba mais'}
                </Link>
                <Link to={settings.home_mission_secondary_url || '/voluntario'} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'13px 28px',borderRadius:100,border:'1.5px solid rgba(255,255,255,.3)',color:'#fff',fontWeight:500,fontSize:14,transition:'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.08)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  {settings.home_mission_secondary_label || 'Seja voluntário'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <style>{`
        @media (max-width: 900px) {
          .home-hero {
            min-height: 86svh !important;
            align-items: flex-end !important;
          }
          .home-hero-inner {
            padding: 106px 20px 44px !important;
          }
          .home-hero-title {
            font-size: 38px !important;
            line-height: 1.08 !important;
          }
          .home-hero-actions {
            gap: 10px !important;
          }
          .home-hero-actions a {
            flex: 1 1 140px;
            justify-content: center;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .quick-links-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .quick-links-grid a {
            padding: 20px 12px !important;
            min-height: 128px;
          }
          .event-card {
            padding: 16px !important;
            gap: 14px !important;
          }
          .event-meta {
            flex-direction: column !important;
            gap: 6px !important;
          }
          .mission-card {
            grid-template-columns: 1fr !important;
            padding: 32px 24px !important;
            gap: 24px !important;
            border-radius: 14px !important;
          }
          .donation-grid,
          .donation-media {
            grid-template-columns: 1fr !important;
          }
          .donation-grid > div {
            padding: 28px 24px !important;
          }
          .donation-overlay {
            background: linear-gradient(180deg, rgba(13,45,94,.95) 0%, rgba(13,45,94,.86) 58%, rgba(240,246,255,.94) 58%, rgba(240,246,255,.98) 100%) !important;
          }
          .donation-copy {
            min-height: 0 !important;
          }
          .donation-media {
            padding-top: 20px !important;
          }
        }
        @media (max-width: 420px) {
          .home-hero-title {
            font-size: 34px !important;
          }
          .quick-links-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
