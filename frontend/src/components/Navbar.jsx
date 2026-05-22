import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { getSiteName } from '../lib/branding';
import { normalizeMediaUrl } from '../lib/media';

function isEnabled(s, key) { return s?.[key] !== '0'; }
function label(s, key, fallback) { return s?.[key] || fallback; }

export default function Navbar({ siteInfo = {} }) {
  const location = useLocation();
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExp, setMobileExp] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const closeTimer = useRef(null);
  const isHome = location.pathname === '/';
  const s = siteInfo;

  const siteName = getSiteName(siteInfo);
  const nav = useMemo(() => {
    const childrenSobre = [
      isEnabled(s,'menu_public_quem_somos_enabled') && { label: label(s,'menu_public_quem_somos','Quem Somos'), to: '/quem-somos' },
      isEnabled(s,'menu_public_regionais_enabled') && { label: label(s,'menu_public_regionais','Unidades Regionais'), to: '/regionais' },
      isEnabled(s,'menu_public_voluntario_enabled') && { label: label(s,'menu_public_voluntario','Voluntariado'), to: '/voluntario' },
    ].filter(Boolean);

    const childrenProgramas = [
      isEnabled(s,'menu_public_programas_sobre_enabled') && { label: label(s,'menu_public_programas_sobre','Programas Sociais'), to: '/programas' },
      isEnabled(s,'menu_public_programas_cursos_enabled') && { label: label(s,'menu_public_programas_cursos','Cursos'), to: '/cursos' },
    ].filter(Boolean);

    return [
      isEnabled(s,'menu_public_home_enabled') && { label: label(s,'menu_public_home','Início'), to: '/' },
      isEnabled(s,'menu_public_sobre_enabled') && childrenSobre.length > 0 && { label: label(s,'menu_public_sobre','A ORES'), children: childrenSobre },
      isEnabled(s,'menu_public_projetos_enabled') && { label: label(s,'menu_public_projetos','Projetos'), to: '/projetos' },
      isEnabled(s,'menu_public_espaco_enabled') && { label: label(s,'menu_public_espaco','Espaço ORES'), to: '/espaco-ores' },
      isEnabled(s,'menu_public_programas_enabled') && childrenProgramas.length > 0 && { label: label(s,'menu_public_programas','Programas'), children: childrenProgramas },
      isEnabled(s,'menu_public_noticias_enabled') && { label: label(s,'menu_public_noticias','Notícias'), to: '/noticias' },
      isEnabled(s,'menu_public_eventos_enabled') && { label: label(s,'menu_public_eventos','Eventos'), to: '/calendario' },
      isEnabled(s,'menu_public_contato_enabled') && { label: label(s,'menu_public_contato','Contato'), to: '/contato' },
    ].filter(Boolean);
  }, [siteInfo]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpen(null); }, [location.pathname]);
  useEffect(() => { setLogoFailed(false); }, [siteInfo.site_logo_url]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openDrop = (lbl) => { clearTimeout(closeTimer.current); setOpen(lbl); };
  const closeDrop = () => { closeTimer.current = setTimeout(() => setOpen(null), 420); };

  const solid = scrolled || !isHome || mobileOpen;
  const bg = solid ? 'rgba(255,255,255,0.98)' : 'transparent';
  const tc = solid ? 'var(--navy)' : '#fff';
  const border = solid ? '1px solid var(--border)' : '1px solid transparent';
  const [line1, ...rest] = siteName.split(' ');
  const line2 = rest.join(' ');
  const logoUrl = normalizeMediaUrl(siteInfo.site_logo_url);

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: bg, borderBottom: border, backdropFilter: solid ? 'blur(12px)' : 'none', transition: 'background .35s,border-color .35s' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logoUrl && !logoFailed ? (
            <img src={logoUrl} alt="" onError={() => setLogoFailed(true)}
              style={{ height: 40, maxWidth: 160, objectFit: 'contain', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, flexShrink: 0 }}>O</div>
          )}
          {(!logoUrl || logoFailed) && (
            <div>
              <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 15, color: tc, lineHeight: 1.1, transition: 'color .35s' }}>{line1 || 'ORES'}</div>
              {line2 && <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 400, fontSize: 11, color: solid ? 'var(--gold)' : 'rgba(255,255,255,.8)', letterSpacing: '0.05em', transition: 'color .35s' }}>{line2}</div>}
            </div>
          )}
        </Link>

        <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {nav.map((item) => (
            <div key={item.label} style={{ position: 'relative', padding: '14px 0' }}
              onMouseEnter={() => item.children && openDrop(item.label)}
              onMouseLeave={closeDrop}>
              {item.to ? (
                <Link to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 11px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: tc, transition: 'color .35s', opacity: location.pathname === item.to ? 1 : 0.88 }}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={() => setOpen(open === item.label ? null : item.label)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 11px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: tc, transition: 'color .35s', background: open === item.label ? (solid ? 'var(--cream)' : 'rgba(255,255,255,.1)') : 'transparent' }}>
                  {item.label} <ChevronDown size={12} style={{ transform: open === item.label ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
                </button>
              )}
              {item.children && open === item.label && (
                <div onMouseEnter={() => openDrop(item.label)} style={{ position: 'absolute', top: '100%', left: -12, minWidth: 220, padding: '8px 12px 12px', animation: 'fadeDown .15s ease' }}>
                  <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 12px 48px rgba(0,0,0,.12)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {item.children.map((child) => (
                      <Link key={child.label} to={child.to}
                        style={{ display: 'block', padding: '11px 18px', fontSize: 13.5, fontWeight: 500, color: location.pathname === child.to ? 'var(--gold)' : 'var(--navy)', borderBottom: '1px solid var(--cream-dark)', transition: 'background .12s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cream)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Link to="/doe" className="navbar-doe-btn" style={{
          background: 'linear-gradient(135deg, #e53935, #ef5350)',
          color: '#fff',
          fontFamily: 'Montserrat,sans-serif',
          fontWeight: 700,
          fontSize: 13,
          padding: '8px 20px',
          borderRadius: 8,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 12px rgba(229,57,53,.35)',
          transition: 'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(229,57,53,.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(229,57,53,.35)'; }}>
          ❤ Doe agora
        </Link>

        <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)} style={{ color: tc }} className="mobile-toggle">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu-shell">
          <div className="mobile-menu-panel">
            {nav.map((item) => (
              <div key={item.label} className="mobile-menu-group">
                {item.children ? (
                  <>
                    <button type="button" onClick={() => setMobileExp(mobileExp === item.label ? null : item.label)} className="mobile-menu-row">
                      <span>{item.label}</span>
                      <ChevronDown size={16} style={{ transform: mobileExp === item.label ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
                    </button>
                    {mobileExp === item.label && (
                      <div className="mobile-submenu">
                        {item.children.map((child) => (
                          <Link key={child.label} to={child.to} onClick={() => setMobileOpen(false)}
                            className={location.pathname === child.to ? 'mobile-submenu-link active' : 'mobile-submenu-link'}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.to} onClick={() => setMobileOpen(false)}
                    className={location.pathname === item.to ? 'mobile-menu-link active' : 'mobile-menu-link'}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div style={{ padding: '16px 24px' }}>
              <Link to="/doe" onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#e53935,#ef5350)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px', borderRadius: 10, textDecoration: 'none' }}>
                ❤ Doe agora
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mobile-toggle { display:none; align-items:center; justify-content:center; width:44px; height:44px; border-radius:10px; transition:background .2s,color .35s; }
        .mobile-toggle:hover,.mobile-toggle:focus-visible { background:var(--cream); outline:none; }
        .mobile-menu-shell { position:fixed; top:68px; left:0; right:0; z-index:1002; height:calc(100dvh - 68px); background:rgba(13,45,94,.28); border-top:1px solid var(--border); }
        .mobile-menu-panel { background:#fff; width:min(100%,390px); margin-left:auto; min-height:100%; max-height:100%; overflow-y:auto; box-shadow:-18px 0 48px rgba(0,0,0,.18); animation:mobileMenuIn .2s ease both; }
        .mobile-menu-group { border-bottom:1px solid var(--cream-dark); }
        .mobile-menu-row,.mobile-menu-link { display:flex; width:100%; min-height:54px; align-items:center; justify-content:space-between; padding:0 24px; color:var(--navy); font-size:15px; font-weight:700; text-align:left; }
        .mobile-menu-link.active,.mobile-submenu-link.active { color:var(--gold); }
        .mobile-submenu { background:var(--cream); padding:6px 0; }
        .mobile-submenu-link { display:block; min-height:44px; padding:12px 40px; color:var(--text-mid); font-size:14px; font-weight:500; }
        @media (max-width:860px) { .desk-nav { display:none !important; } .mobile-toggle { display:flex !important; } .navbar-doe-btn { display:none !important; } }
        @media (min-width:861px) { .mobile-menu-shell { display:none; } }
        @keyframes mobileMenuIn { from { opacity:.4; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </nav>
  );
}
