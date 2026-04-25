import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'Paróquia', children: [
      { label: 'Conheça a PES', to: '/conheca' },
      { label: 'Padres e Diáconos', to: '/padres' },
      { label: 'Instalações', to: '/instalacoes' },
      { label: 'Calendário de Eventos', to: '/calendario' },
      { label: 'Agendamento de Salas', to: '/salas' },
    ],
  },
  {
    label: 'Comunidade', children: [
      { label: 'Grupos de Oração', to: '/grupos' },
      { label: 'Pastorais e Movimentos', to: '/pastorais' },
      { label: 'Comunidades (Setores)', to: '/comunidades' },
      { label: 'Pastoral Familiar', to: '/familiar' },
      { label: 'Quero ser Voluntário', to: '/voluntario' },
    ],
  },
  {
    label: 'Comunicação', children: [
      { label: 'Notícias', to: '/noticias' },
      { label: 'Web Rádio', to: '/radio' },
      { label: 'Homilias e Reflexões', to: '/homilias' },
    ],
  },
  {
    label: 'Obra Social', children: [
      { label: 'Conheça a Obra Social', to: '/obra-social' },
      { label: 'Serviços Oferecidos', to: '/servicos' },
      { label: 'Cursos Gratuitos', to: '/cursos' },
    ],
  },
  { label: 'Contato', to: '/contato' },
];

export default function Navbar({ siteInfo = {} }) {
  const location = useLocation();
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExp, setMobileExp] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpen(null); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openDrop = (l) => { clearTimeout(closeTimer.current); setOpen(l); };
  const closeDrop = () => { closeTimer.current = setTimeout(() => setOpen(null), 420); };

  const solid = scrolled || !isHome || mobileOpen;
  const bg = solid ? 'rgba(255,255,255,0.98)' : 'transparent';
  const tc = solid ? 'var(--navy)' : '#fff';
  const border = solid ? '1px solid var(--border)' : '1px solid transparent';

  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:1000, background:bg, borderBottom:border, backdropFilter:solid?'blur(12px)':'none', transition:'background .35s,border-color .35s' }}>
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:68 }}>

        {/* Logo */}
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:10 }}>
          {siteInfo.site_logo_url ? (
            <img src={siteInfo.site_logo_url} alt="" style={{ width:34,height:34,borderRadius:'50%',objectFit:'cover',flexShrink:0 }} />
          ) : (
            <div style={{ width:34,height:34,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#fff',fontFamily:'Playfair Display,serif',fontWeight:700,flexShrink:0 }}>✦</div>
          )}
          <div>
            <div style={{ fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:15,color:tc,lineHeight:1.1,transition:'color .35s' }}>{siteInfo.site_name?.split(' ')[0] || 'Paróquia'}</div>
            <div style={{ fontFamily:'Playfair Display,serif',fontWeight:400,fontSize:12,color:solid?'var(--gold)':'rgba(255,255,255,.75)',letterSpacing:'0.06em',transition:'color .35s' }}>{siteInfo.site_name?.split(' ').slice(1).join(' ') || 'Espírito Santo'}</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="desk-nav" style={{ display:'flex',alignItems:'center',gap:2 }}>
          {NAV.map(item => (
            <div key={item.label} style={{ position:'relative',padding:'14px 0' }}
              onMouseEnter={() => item.children && openDrop(item.label)}
              onMouseLeave={closeDrop}>
              {item.to ? (
                <Link to={item.to} style={{ display:'flex',alignItems:'center',gap:5,padding:'8px 11px',borderRadius:7,fontSize:13,fontWeight:500,color:tc,transition:'color .35s',opacity:location.pathname===item.to?1:0.88 }}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={() => setOpen(open===item.label?null:item.label)}
                  style={{ display:'flex',alignItems:'center',gap:5,padding:'8px 11px',borderRadius:7,fontSize:13,fontWeight:500,color:tc,transition:'color .35s',background:open===item.label?(solid?'var(--cream)':'rgba(255,255,255,.1)'):'transparent' }}>
                  {item.label} <ChevronDown size={12} style={{ transform:open===item.label?'rotate(0)':'rotate(-90deg)',transition:'transform .2s' }} />
                </button>
              )}
              {item.children && open === item.label && (
                <div onMouseEnter={() => openDrop(item.label)}
                  style={{ position:'absolute',top:'100%',left:-12,minWidth:244,padding:'8px 12px 12px',animation:'fadeDown .15s ease' }}>
                  <div style={{ background:'#fff',borderRadius:12,boxShadow:'0 12px 48px rgba(0,0,0,.12)',border:'1px solid var(--border)',overflow:'hidden' }}>
                    {item.children.map(c => (
                      <Link key={c.label} to={c.to}
                        style={{ display:'block',padding:'11px 18px',fontSize:13.5,fontWeight:500,color:location.pathname===c.to?'var(--gold)':'var(--navy)',borderBottom:'1px solid var(--cream-dark)',transition:'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile toggle */}
        <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color:tc }}
          className="mobile-toggle">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu-shell">
          <div className="mobile-menu-panel">
            {NAV.map(item => (
              <div key={item.label} className="mobile-menu-group">
                {item.children ? (
                  <>
                    <button type="button" onClick={() => setMobileExp(mobileExp===item.label?null:item.label)}
                      className="mobile-menu-row">
                      <span>{item.label}</span>
                      <ChevronDown size={16} style={{ transform:mobileExp===item.label?'rotate(180deg)':'rotate(0)',transition:'transform .2s' }} />
                    </button>
                    {mobileExp === item.label && (
                      <div className="mobile-submenu">
                        {item.children.map(c => (
                          <Link key={c.label} to={c.to} onClick={() => setMobileOpen(false)}
                            className={location.pathname===c.to ? 'mobile-submenu-link active' : 'mobile-submenu-link'}>
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.to} onClick={() => setMobileOpen(false)}
                    className={location.pathname===item.to ? 'mobile-menu-link active' : 'mobile-menu-link'}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          transition: background .2s, color .35s;
        }
        .mobile-toggle:hover,
        .mobile-toggle:focus-visible {
          background: var(--cream);
          outline: none;
        }
        .mobile-menu-shell {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          height: calc(100vh - 68px);
          background: rgba(26,39,68,.28);
          border-top: 1px solid var(--border);
        }
        .mobile-menu-panel {
          background: #fff;
          max-height: min(78vh, 620px);
          overflow-y: auto;
          box-shadow: 0 18px 48px rgba(0,0,0,.18);
        }
        .mobile-menu-group {
          border-bottom: 1px solid var(--cream-dark);
        }
        .mobile-menu-row,
        .mobile-menu-link {
          display: flex;
          width: 100%;
          min-height: 54px;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          color: var(--navy);
          font-size: 15px;
          font-weight: 700;
          text-align: left;
        }
        .mobile-menu-link.active,
        .mobile-submenu-link.active {
          color: var(--gold);
        }
        .mobile-submenu {
          background: var(--cream);
          padding: 6px 0;
        }
        .mobile-submenu-link {
          display: block;
          min-height: 44px;
          padding: 12px 40px;
          color: var(--text-mid);
          font-size: 14px;
          font-weight: 500;
        }
        @media (max-width: 860px) {
          .desk-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 861px) {
          .mobile-menu-shell { display: none; }
        }
      `}</style>
    </nav>
  );
}
