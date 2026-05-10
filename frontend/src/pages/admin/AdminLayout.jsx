import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useFetch } from '../../hooks/useFetch';
import { getSiteName } from '../../lib/branding';
import { getAdminMenuLabels } from '../../lib/menuLabels';
import {
  LayoutDashboard, Calendar, Newspaper, Users, Clock, BookOpen,
  Church, MapPin, Heart, GraduationCap, Headphones, MessageSquare,
  Settings, LogOut, Menu, X, Shield, ChevronRight, Handshake, Images
} from 'lucide-react';

function buildMenu(labels) {
  const raw = [
    labels.menu_admin_dashboard_enabled && { label: labels.menu_admin_dashboard, to:'/admin/dashboard', icon:<LayoutDashboard size={18}/> },
    labels.menu_admin_settings_enabled && { label: labels.menu_admin_settings, to:'/admin/settings', icon:<Settings size={18}/> },
    labels.menu_admin_hero_slides_enabled && { label: labels.menu_admin_hero_slides, to:'/admin/hero-slides', icon:<Images size={18}/> },
    labels.menu_admin_divider_content_enabled && { divider: true, label: labels.menu_admin_divider_content },
    labels.menu_admin_news_enabled && { label: labels.menu_admin_news, to:'/admin/news', icon:<Newspaper size={18}/> },
    labels.menu_admin_events_enabled && { label: labels.menu_admin_events, to:'/admin/events', icon:<Calendar size={18}/> },
    labels.menu_admin_homilies_enabled && { label: labels.menu_admin_homilies, to:'/admin/homilies', icon:<Headphones size={18}/> },
    labels.menu_admin_divider_parish_enabled && { divider: true, label: labels.menu_admin_divider_parish },
    labels.menu_admin_priests_enabled && { label: labels.menu_admin_priests, to:'/admin/priests', icon:<Church size={18}/> },
    labels.menu_admin_mass_enabled && { label: labels.menu_admin_mass, to:'/admin/mass', icon:<Clock size={18}/> },
    labels.menu_admin_facilities_enabled && { label: labels.menu_admin_facilities, to:'/admin/facilities', icon:<MapPin size={18}/> },
    labels.menu_admin_bookings_enabled && { label: labels.menu_admin_bookings, to:'/admin/bookings', icon:<Calendar size={18}/> },
    labels.menu_admin_divider_community_enabled && { divider: true, label: labels.menu_admin_divider_community },
    labels.menu_admin_groups_enabled && { label: labels.menu_admin_groups, to:'/admin/groups', icon:<Heart size={18}/> },
    labels.menu_admin_pastorals_enabled && { label: labels.menu_admin_pastorals, to:'/admin/pastorals', icon:<BookOpen size={18}/> },
    labels.menu_admin_communities_enabled && { label: labels.menu_admin_communities, to:'/admin/communities', icon:<Users size={18}/> },
    labels.menu_admin_divider_social_enabled && { divider: true, label: labels.menu_admin_divider_social },
    labels.menu_admin_services_enabled && { label: labels.menu_admin_services, to:'/admin/services', icon:<Handshake size={18}/> },
    labels.menu_admin_courses_enabled && { label: labels.menu_admin_courses, to:'/admin/courses', icon:<GraduationCap size={18}/> },
    labels.menu_admin_divider_system_enabled && { divider: true, label: labels.menu_admin_divider_system },
    labels.menu_admin_messages_enabled && { label: labels.menu_admin_messages, to:'/admin/messages', icon:<MessageSquare size={18}/> },
    labels.menu_admin_users_enabled && { label: labels.menu_admin_users, to:'/admin/users', icon:<Shield size={18}/> },
    labels.menu_admin_audit_enabled && { label: labels.menu_admin_audit, to:'/admin/audit', icon:<Shield size={18}/> },
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
  const siteName = getSiteName(siteInfo || {});
  const menuLabels = getAdminMenuLabels(siteInfo || {});
  const MENU = buildMenu(menuLabels);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div style={{ width: mobile ? '100%' : (sidebarOpen ? 240 : 64), background:'var(--navy)', height:'100dvh', display:'flex', flexDirection:'column', transition:'width .25s', overflow:'hidden', flexShrink:0, position: mobile ? 'relative' : 'sticky', top:0 }}>
      {/* Logo */}
      <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:700, flexShrink:0 }}>✦</div>
        {(sidebarOpen || mobile) && <div>
          <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:14, color:'#fff', lineHeight:1.1 }}>{siteName}</div>
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
              style={{ display:'flex', alignItems:'center', gap:10, padding:(sidebarOpen||mobile)?'9px 16px':'9px 0', justifyContent:(sidebarOpen||mobile)?'flex-start':'center', borderRadius:0, background:active?'rgba(184,148,90,.15)':'transparent', borderLeft:active?'3px solid var(--gold)':'3px solid transparent', color:active?'var(--gold-light)':'rgba(255,255,255,.6)', fontSize:13, fontWeight:active?600:400, transition:'all .15s', textDecoration:'none', marginBottom:1 }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='rgba(255,255,255,.9)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.6)'; } }}>
              <span style={{ flexShrink:0 }}>{item.icon}</span>
              {(sidebarOpen||mobile) && item.label}
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
