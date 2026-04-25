import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Reveal from '../components/Reveal';
import MassScheduleSidebar from '../components/MassScheduleSidebar';
import EventsSidebar from '../components/EventsSidebar';
import { Calendar, Users, Radio, Heart, BookOpen, Clock, MapPin } from 'lucide-react';

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
  const settings = data?.settings || {};
  const events = data?.events || [];
  const massSchedule = data?.massSchedule || [];
  const confessions = data?.confessions || [];
  const news = data?.news || [];

  const quickLinks = [
    { icon: <Calendar size={22} />, label: 'Agenda de Eventos', to: '/calendario' },
    { icon: <Clock size={22} />, label: 'Horários de Missa', to: '/conheca' },
    { icon: <Users size={22} />, label: 'Grupos de Oração', to: '/grupos' },
    { icon: <Heart size={22} />, label: 'Obra Social', to: '/obra-social' },
    { icon: <Radio size={22} />, label: 'Web Rádio', to: '/radio' },
    { icon: <BookOpen size={22} />, label: 'Homilias', to: '/homilias' },
  ];

  return (
    <div className="animate-page">
      {/* ── Hero ── */}
      <section style={{ background:'var(--navy)',minHeight:'100vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden' }}>
        {settings.hero_image_url && <img src={settings.hero_image_url} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.28 }} />}
        {/* Rings */}
        <div style={{ position:'absolute',top:'50%',left:'50%',width:700,height:700,borderRadius:'50%',border:'1px solid rgba(184,148,90,.12)',transform:'translate(-50%,-50%)',animation:'ringPulse 6s ease-in-out infinite' }} />
        <div style={{ position:'absolute',top:'50%',left:'50%',width:500,height:500,borderRadius:'50%',border:'1px solid rgba(184,148,90,.12)',transform:'translate(-50%,-50%)',animation:'ringPulse 6s ease-in-out infinite',animationDelay:'1s' }} />
        <div style={{ position:'absolute',top:'50%',left:'50%',width:320,height:320,borderRadius:'50%',border:'1px solid rgba(184,148,90,.18)',transform:'translate(-50%,-50%)',animation:'ringPulse 6s ease-in-out infinite',animationDelay:'2s' }} />
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 60% 40%,rgba(184,148,90,.08) 0%,transparent 60%)' }} />

        <div style={{ maxWidth:1200,margin:'0 auto',padding:'120px 24px 80px',width:'100%',position:'relative',zIndex:1 }}>
          <div style={{ maxWidth:680 }}>
            <div className="animate-fade-up" style={{ fontSize:11,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold-light)',marginBottom:22 }}>
              {settings.hero_eyebrow || 'Bem-vindo à'}
            </div>
            <h1 className="animate-fade-up" style={{ fontFamily:'Playfair Display,serif',fontSize:'clamp(44px,7vw,84px)',fontWeight:700,color:'#fff',lineHeight:1.08,marginBottom:20,animationDelay:'.1s' }}>
              {settings.hero_title ? settings.hero_title.split('Espírito Santo').map((part, i, arr) =>
                i < arr.length - 1 ? [part, <em key={i} style={{ color:'var(--gold-light)',fontStyle:'italic' }}>Espírito Santo</em>] : part
              ) : <><em style={{ color:'var(--gold-light)',fontStyle:'italic' }}>Espírito</em> Santo</>}
            </h1>
            <p className="animate-fade-up" style={{ fontSize:17,color:'rgba(255,255,255,.65)',lineHeight:1.7,fontWeight:300,marginBottom:40,animationDelay:'.2s' }}>
              {settings.hero_subtitle || 'Venha fazer parte desta família de fé. Missas, grupos, pastorais e muito mais para toda a família.'}
            </p>
            <div className="animate-fade-up" style={{ display:'flex',gap:16,flexWrap:'wrap',animationDelay:'.3s' }}>
              <Link to={settings.hero_primary_url || '/conheca'} className="btn-gold" style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'13px 28px',borderRadius:100,background:'var(--gold)',color:'#fff',fontWeight:600,fontSize:14,boxShadow:'0 4px 18px rgba(184,148,90,.35)',transition:'transform .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 26px rgba(184,148,90,.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 18px rgba(184,148,90,.35)'; }}>
                {settings.hero_primary_label || 'Conheça a Paróquia'}
              </Link>
              <Link to={settings.hero_secondary_url || '/contato'} style={{ display:'inline-flex',alignItems:'center',padding:'13px 28px',borderRadius:100,border:'1.5px solid rgba(255,255,255,.3)',color:'#fff',fontWeight:500,fontSize:14,transition:'background .2s,border-color .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='rgba(255,255,255,.3)'; }}>
                {settings.hero_secondary_label || 'Fale Conosco'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Daily message ── */}
      {settings.daily_message && (
        <Reveal>
          <div style={{ background:'var(--gold)',padding:'20px 24px',textAlign:'center' }}>
            <p style={{ maxWidth:900,margin:'0 auto',fontFamily:'Playfair Display,serif',fontStyle:'italic',fontSize:'clamp(14px,2vw,18px)',color:'#fff',lineHeight:1.6 }}>
              "{settings.daily_message}"
            </p>
          </div>
        </Reveal>
      )}

      {/* ── Quick links ── */}
      <section style={{ padding:'72px 24px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center',marginBottom:48 }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12 }}>Acesso Rápido</div>
              <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:'clamp(26px,4vw,40px)',fontWeight:700,color:'var(--navy)' }}>{settings.home_quick_title || 'O que você está procurando?'}</h2>
            </div>
          </Reveal>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16 }}>
            {quickLinks.map((ql, i) => (
              <Reveal key={ql.label} delay={i * 60}>
                <Link to={ql.to} style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',padding:'28px 20px',textAlign:'center',display:'block',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                  <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(184,148,90,.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',color:'var(--gold)' }}>
                    {ql.icon}
                  </div>
                  <div style={{ fontSize:13,fontWeight:600,color:'var(--navy)' }}>{ql.label}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content + sidebar ── */}
      <section style={{ padding:'0 24px 72px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 340px',gap:32,alignItems:'start' }}>
          {/* Events */}
          <div>
            <Reveal>
              <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:28 }}>
                <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'var(--navy)',whiteSpace:'nowrap' }}>Próximos Eventos</h2>
                <div style={{ flex:1,height:1,background:'var(--border)' }} />
                <Link to="/calendario" style={{ fontSize:12,color:'var(--text-soft)',fontWeight:500,whiteSpace:'nowrap' }}>Ver todos</Link>
              </div>
            </Reveal>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {events.map((ev, i) => {
                const d = new Date(ev.event_date + 'T12:00:00');
                const day = String(d.getDate()).padStart(2,'0');
                const month = MONTHS_PT[d.getMonth()];
                return (
                  <Reveal key={ev.id} delay={i * 80}>
                    <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',padding:'20px 24px',display:'flex',gap:20,alignItems:'flex-start',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                      <div style={{ textAlign:'center',minWidth:52,background:'var(--navy)',borderRadius:10,padding:'10px 8px',flexShrink:0 }}>
                        <div style={{ fontSize:24,fontWeight:700,color:'#fff',fontFamily:'Playfair Display,serif',lineHeight:1 }}>{day}</div>
                        <div style={{ fontSize:9,fontWeight:700,letterSpacing:'0.1em',color:'var(--gold-light)',textTransform:'uppercase',marginTop:2 }}>{month}</div>
                      </div>
                      <div style={{ flex:1 }}>
                        <span style={{ display:'inline-block',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',padding:'2px 8px',borderRadius:100,background:'rgba(184,148,90,.1)',color:'var(--gold)',marginBottom:6 }}>{ev.category}</span>
                        <div style={{ fontWeight:700,fontSize:15,color:'var(--navy)',marginBottom:6,lineHeight:1.3 }}>{ev.title}</div>
                        <div style={{ display:'flex',gap:16,fontSize:12,color:'var(--text-soft)' }}>
                          {ev.start_time && <span style={{ display:'flex',alignItems:'center',gap:4 }}><Clock size={12} />{ev.start_time.slice(0,5)}h{ev.end_time && `–${ev.end_time.slice(0,5)}h`}</span>}
                          {ev.location && <span style={{ display:'flex',alignItems:'center',gap:4 }}><MapPin size={12} />{ev.location}</span>}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
              {events.length === 0 && (
                <div style={{ textAlign:'center',padding:'40px 0',color:'var(--text-soft)',fontSize:14 }}>Nenhum evento próximo.</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
            <Reveal delay={100}><MassScheduleSidebar schedule={massSchedule} confessions={confessions} /></Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <Reveal>
        <section style={{ background:'var(--navy)',padding:'72px 24px' }}>
          <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:48,textAlign:'center' }}>
            {[
              { value:35, suffix:'+', label:'Grupos e Pastorais' },
              { value:11, suffix:'', label:'Comunidades' },
              { value:5, suffix:'', label:'Missas por semana' },
              { value:1992, suffix:'', label:'Ano de fundação', noCount:true },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:'Playfair Display,serif',fontSize:'clamp(36px,5vw,56px)',fontWeight:700,color:'var(--gold-light)',lineHeight:1,marginBottom:12 }}>
                  {s.noCount ? s.value : <Counter target={s.value} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize:14,color:'rgba(255,255,255,.55)',fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── News ── */}
      {news.length > 0 && (
        <section style={{ padding:'72px 24px' }}>
          <div style={{ maxWidth:1200,margin:'0 auto' }}>
            <Reveal>
              <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:36 }}>
                <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:'var(--navy)',whiteSpace:'nowrap' }}>Últimas Notícias</h2>
                <div style={{ flex:1,height:1,background:'var(--border)' }} />
                <Link to="/noticias" style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Ver todas →</Link>
              </div>
            </Reveal>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>
              {news.map((n, i) => (
                <Reveal key={n.id} delay={i * 100}>
                  <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden',transition:'transform .2s,box-shadow .2s',boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                    <div style={{ height:8,background:'var(--gold)' }} />
                    <div style={{ padding:'24px' }}>
                      <span style={{ fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',padding:'2px 8px',borderRadius:100,background:'rgba(26,39,68,.08)',color:'var(--navy)',display:'inline-block',marginBottom:10 }}>{n.category}</span>
                      <h3 style={{ fontFamily:'Playfair Display,serif',fontSize:17,fontWeight:700,color:'var(--navy)',marginBottom:10,lineHeight:1.35 }}>{n.title}</h3>
                      <p style={{ fontSize:13,color:'var(--text-mid)',lineHeight:1.65,marginBottom:16 }}>{n.summary}</p>
                      <Link to={`/noticias/${n.slug}`} style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Ler mais →</Link>
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
            <div style={{ background:'var(--navy)',borderRadius:20,padding:'56px 64px',display:'grid',gridTemplateColumns:'1fr auto',gap:48,alignItems:'center' }}>
              <div>
                <div style={{ fontSize:11,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold-light)',marginBottom:16 }}>{settings.home_mission_eyebrow || 'Nossa Missão'}</div>
                <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:'clamp(24px,3.5vw,38px)',fontWeight:700,color:'#fff',lineHeight:1.25,marginBottom:20 }}>
                  {settings.home_mission_title || 'Evangelizar, celebrar e servir com amor'}
                </h2>
                <p style={{ fontSize:15,color:'rgba(255,255,255,.6)',lineHeight:1.75 }}>
                  {settings.home_mission_text || 'A Paróquia Espírito Santo é uma comunidade viva que celebra os sacramentos, promove a formação cristã e serve à sociedade com amor fraterno.'}
                </p>
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:16,flexShrink:0 }}>
                <Link to={settings.home_mission_primary_url || '/conheca'} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'13px 28px',borderRadius:100,background:'var(--gold)',color:'#fff',fontWeight:600,fontSize:14,boxShadow:'0 4px 18px rgba(184,148,90,.35)',transition:'transform .2s' }}
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
          section > div > [style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
          section > div > div > [style*="grid-template-columns: 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
