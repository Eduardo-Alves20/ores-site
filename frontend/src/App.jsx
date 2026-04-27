import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useFetch } from './hooks/useFetch';

import Home from './pages/Home';
import Conheca from './pages/Conheca';
import Padres from './pages/Padres';
import Instalacoes from './pages/Instalacoes';
import Calendario from './pages/Calendario';
import Salas from './pages/Salas';
import Grupos from './pages/Grupos';
import Pastorais from './pages/Pastorais';
import Comunidades from './pages/Comunidades';
import Voluntario from './pages/Voluntario';
import { NoticiasList, NoticiaDetalhe } from './pages/Noticias';
import WebRadio from './pages/Radio';
import Homilias from './pages/Homilias';
import ObraSocial from './pages/ObraSocial';
import Contato from './pages/Contato';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNews from './pages/admin/AdminNews';
import AdminPriests from './pages/admin/AdminPriests';
import AdminMass from './pages/admin/AdminMass';
import AdminGroups from './pages/admin/AdminGroups';
import AdminPastorals from './pages/admin/AdminPastorals';
import AdminCommunities from './pages/admin/AdminCommunities';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminBookings from './pages/admin/AdminBookings';
import AdminHomilies from './pages/admin/AdminHomilies';
import AdminCourses from './pages/admin/AdminCourses';
import AdminServices from './pages/admin/AdminServices';
import AdminMessages from './pages/admin/AdminMessages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAudit from './pages/admin/AdminAudit';

function PublicLayout() {
  const { data: siteInfo } = useFetch('/site-info');
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <>
      <Navbar siteInfo={siteInfo || {}} />
      <main style={{ paddingTop: isHome ? 0 : 68, minHeight:'80vh' }}><Outlet /></main>
      <Footer siteInfo={siteInfo || {}} />
    </>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--navy)', color:'rgba(255,255,255,.4)', fontSize:14 }}>
      Carregando...
    </div>
  );
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="hero-slides" element={<AdminHeroSlides />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="priests" element={<AdminPriests />} />
            <Route path="mass" element={<AdminMass />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="pastorals" element={<AdminPastorals />} />
            <Route path="communities" element={<AdminCommunities />} />
            <Route path="facilities" element={<AdminFacilities />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="homilies" element={<AdminHomilies />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="conheca" element={<Conheca />} />
            <Route path="padres" element={<Padres />} />
            <Route path="instalacoes" element={<Instalacoes />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="salas" element={<Salas />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="pastorais" element={<Pastorais />} />
            <Route path="comunidades" element={<Comunidades />} />
            <Route path="familiar" element={<Pastorais />} />
            <Route path="voluntario" element={<Voluntario />} />
            <Route path="noticias" element={<NoticiasList />} />
            <Route path="noticias/:slug" element={<NoticiaDetalhe />} />
            <Route path="radio" element={<WebRadio />} />
            <Route path="homilias" element={<Homilias />} />
            <Route path="obra-social" element={<ObraSocial />} />
            <Route path="servicos" element={<ObraSocial />} />
            <Route path="cursos" element={<ObraSocial />} />
            <Route path="contato" element={<Contato />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
