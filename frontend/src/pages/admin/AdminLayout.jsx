import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useFetch } from '../../hooks/useFetch';
import { getSiteName } from '../../lib/branding';
import {
  LayoutDashboard, Calendar, Newspaper, Users, MapPin, Heart, GraduationCap,
  MessageSquare, Settings, LogOut, Menu, X, Shield, ChevronRight, Handshake,
  Images, Building2, FolderOpen, BookOpen, ShieldCheck, Music
} from 'lucide-react';

function getLabel(settings, key, fallback) {
  return settings?.[key] || fallback;
}

function isEnabled(settings, key) {
  return settings?.[key] !== '0';
}

function buildMenu(s, unreadMessages = 0) {
  const raw = [
    isEnabled(s,'menu_admin_dashboard_enabled') && { label: getLabel(s,'menu_admin_dashboard','Dashboard'), to:'/admin/dashboard', icon:<LayoutDashboard size={18}/> },
    isEnabled(s,'menu_admin_settings_enabled') && { label: getLabel(s,'menu_admin_settings','Configurações'), to:'/admin/settings', icon:<Settings size={18}/> },
    isEnabled(s,'menu_admin_hero_slides_enabled') && { label: getLabel(s,'menu_admin_hero_slides','Carrossel'), to:'/admin/hero-slides', icon:<Images size={18}/> },
    isEnabled(s,'menu_admin_divider_conteudo_enabled') && { divider: true, label: getLabel(s,'menu_admin_divider_conteudo','Conteúdo') },
    isEnabled(s,'menu_admin_news_enabled') && { label: getLabel(s,'menu_admin_news','Notícias'), to:'/admin/news', icon:<Newspaper size={18}/> },
    isEnabled(s,'menu_admin_events_enabled') && { label: getLabel(s,'menu_admin_events','Eventos'), to:'/admin/events', icon:<Calendar size={18}/> },
    isEnabled(s,'menu_admin_divider_ong_enabled') && { divider: true, label: getLabel(s,'menu_admin_divider_ong','A ORES') },
    isEnabled(s,'menu_admin_regionais_enabled') && { label: getLabel(s,'menu_admin_regionais','Unidades Regionais'), to:'/admin/regionais', icon:<Building2 size={18}/> },
    isEnabled(s,'menu_admin_projetos_enabled') && { label: getLabel(s,'menu_admin_projetos','Projetos'), to:'/admin/projetos', icon:<FolderOpen size={18}/> },
    isEnabled(s,'menu_admin_espaco_enabled') && { label: getLabel(s,'menu_admin_espaco','Espaço ORES'), to:'/admin/espaco', icon:<MapPin size={18}/> },
    isEnabled(s,'menu_admin_divider_programas_enabled') && { divider: true, label: getLabel(s,'menu_admin_divider_programas','Programas') },
    isEnabled(s,'menu_admin_services_enabled') && { label: getLabel(s,'menu_admin_services','Programas Sociais'), to:'/admin/services', icon:<Handshake size={18}/> },
    isEnabled(s,'menu_admin_courses_enabled') && { label: getLabel(s,'menu_admin_courses','Cursos'), to:'/admin/courses', icon:<GraduationCap size={18}/> },
    isEnabled(s,'menu_admin_divider_system_enabled') && { divider: true, label: getLabel(s,'menu_admin_divider_system','Sistema') },
    { label: 'Doações', to:'/admin/doacoes', icon:<Heart size={18}/> },
    { label: 'Música de Fundo', to:'/admin/music', icon:<Music size={18}/> },
    { label: 'Segurança (2FA)', to:'/admin/2fa', icon:<ShieldCheck size={18}/> },
    isEnabled(s,'menu_admin_messages_enabled') && { label: getLabel(s,'menu_admin_messages','Mensagens'), to:'/admin/messages', icon:<MessageSquare size={18}/>, badge: unreadMessages },
    isEnabled(s,'menu_admin_users_enabled') && { label: getLabel(s,'menu_admin_users','Usuários Admin'), to:'/admin/users', icon:<Shield size={18}/> },
    isEnabled(s,'menu_admin_audit_enabled') && { label: getLabel(s,'menu_admin_audit','Log de Auditoria'), to:'/admin/audit', icon:<BookOpen size={18}/> },
  ].filter(Boolean);

  return raw.filter((item, i) => {
    if (!item.divider) return true;
    const hasBefore = raw.slice(0, i).some((x) => !x.divider);
    const hasAfter = raw.slice(i + 1).some((x) => !x.divider);
    return hasBefore && hasAfter;
  });
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { data: siteInfo } = useFetch('/site-info');
  const { data: dashboard, refetch: refetchDashboard } = useFetch('/admin/dashboard');
  const siteName = getSiteName(siteInfo || {});
  const unreadMessages = Number(dashboard?.stats?.unreadMessages || 0);
  const MENU = buildMenu(siteInfo || {}, unreadMessages);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateDashboard = () => refetchDashboard();
    window.addEventListener('admin-messages-updated', updateDashboard);
    return () => window.removeEventListener('admin-messages-updated', updateDashboard);
  }, [refetchDashboard]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div style={{ width: mobile ? '100%' : (sidebarOpen ? 240 : 64), background:'var(--navy)', height:'100dvh', display:'flex', flexDirection:'column', transition:'width .25s', overflow:'hidden', flexShrink:0, position: mobile ? 'relative' : 'sticky', top:0 }}>
      {/* Logo */}
      <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#fff', fontWeight:700, flexShrink:0 }}>O</div>
        {(sidebarOpen || mobile) && <div>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:14, color:'#fff', lineHeight:1.1 }}>{siteName}</div>
          <div style={{ fontSize:11, color:'var(--gold-light)', opacity:.7 }}>Painel Admin</div>
        </div>}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
        {MENU.map((item, i) => {
          if (item.divider) return (
            <div key={i} style={{ padding:(sidebarOpen||mobile)?'16px 16px 6px':'12px 0 6px', textAlign:(sidebarOpen||mobile)?'left':'center' }}>
              {(sidebarOpen||mobile) && <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,.3)' }}>{item.label}</div>}
              {!(sidebarOpen||mobile) && <div style={{ height:1, background:'rgba(255,255,255,.08)', margin:'0 12px' }} />}
            </div>
          );
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={() => mobile && setMobileOpen(false)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:(sidebarOpen||mobile)?'9px 16px':'9px 0', justifyContent:(sidebarOpen||mobile)?'flex-start':'center', borderRadius:0, background:active?'rgba(25,118,210,.18)':'transparent', borderLeft:active?'3px solid var(--gold-light)':'3px solid transparent', color:active?'var(--gold-light)':'rgba(255,255,255,.6)', fontSize:13, fontWeight:active?600:400, transition:'all .15s', textDecoration:'none', marginBottom:1 }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='rgba(255,255,255,.9)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.6)'; } }}>
              <span style={{ flexShrink:0 }}>{item.icon}</span>
              {(sidebarOpen||mobile) && <span style={{ flex:1 }}>{item.label}</span>}
              {item.badge > 0 && (
                <span style={{ minWidth:18, height:18, padding:'0 6px', borderRadius:999, background:'#ef4444', color:'#fff', fontSize:10, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center', marginLeft:(sidebarOpen||mobile)?'auto':0 }}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:'16px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
        {(sidebarOpen||mobile) && <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:8 }}>
          <div style={{ fontWeight:600, color:'rgba(255,255,255,.8)', marginBottom:2 }}>{user?.name}</div>
          <div style={{ fontSize:11 }}>{user?.role}</div>
        </div>}
        <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.45)', fontSize:13, transition:'color .15s', width:'100%' }}
          onMouseEnter={e => e.currentTarget.style.color='#fca5a5'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.45)'}>
          <LogOut size={16} />{(sidebarOpen||mobile) && 'Sair'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100dvh', background:'var(--cream)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
      {/* Desktop sidebar */}
      <div style={{ display:'flex' }} className="desk-sidebar">
        <Sidebar />
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Topbar */}
        <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'0 24px', minHeight:60, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color:'var(--text-soft)', padding:4 }} className="desk-only">
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color:'var(--text-soft)', padding:4, display:'none' }} className="mobile-only">
              <Menu size={20}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-soft)' }}>
              <Link to="/admin/dashboard" style={{ color:'var(--gold)', fontWeight:600 }}>Admin</Link>
              <ChevronRight size={12}/>
              <span>{MENU.find(m => m.to === location.pathname)?.label || 'Página'}</span>
            </div>
          </div>
          <Link to="/" target="_blank" style={{ fontSize:12, color:'var(--gold)', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
            Ver site →
          </Link>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:2000, display:'flex' }} onClick={() => setMobileOpen(false)}>
            <div style={{ width:'min(300px, 82vw)', background:'var(--navy)', height:'100%', boxShadow:'4px 0 24px rgba(0,0,0,.4)' }} onClick={e => e.stopPropagation()}>
              <Sidebar mobile />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="admin-content-shell" style={{ flex:1, padding:'32px 28px', overflow:'auto' }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desk-sidebar { display: none !important; }
          .mobile-only { display: flex !important; }
          .desk-only { display: none !important; }
          .admin-content-shell { padding: 20px 14px !important; }
        }
        @media (max-width: 600px) {
          .admin-content-shell { padding: 16px 10px !important; }
        }
        @media (min-width: 901px) { .mobile-only { display: none !important; } }
      `}</style>
    </div>
  );
}
