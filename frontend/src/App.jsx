import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useFetch } from './hooks/useFetch';

import Home from './pages/Home';
import QuemSomos from './pages/QuemSomos';
import Regionais from './pages/Regionais';
import Projetos from './pages/Projetos';
import EspacoORES from './pages/EspacoORES';
import Voluntario from './pages/Voluntario';
import { NoticiasList, NoticiaDetalhe } from './pages/Noticias';
import ObraSocial from './pages/ObraSocial';
import Contato from './pages/Contato';
import Calendario from './pages/Calendario';
import Doe from './pages/Doe';
import DoacaoConfirmada from './pages/DoacaoConfirmada';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNews from './pages/admin/AdminNews';
import AdminRegionais from './pages/admin/AdminRegionais';
import AdminPastorals from './pages/admin/AdminPastorals';
import AdminEspaco from './pages/admin/AdminEspaco';
import AdminCourses from './pages/admin/AdminCourses';
import AdminServices from './pages/admin/AdminServices';
import AdminMessages from './pages/admin/AdminMessages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAudit from './pages/admin/AdminAudit';
import AdminDoacoes from './pages/admin/AdminDoacoes';

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
            <Route path="regionais" element={<AdminRegionais />} />
            <Route path="projetos" element={<AdminPastorals />} />
            <Route path="espaco" element={<AdminEspaco />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="doacoes" element={<AdminDoacoes />} />
          </Route>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="quem-somos" element={<QuemSomos />} />
            <Route path="regionais" element={<Regionais />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="espaco-ores" element={<EspacoORES />} />
            <Route path="voluntario" element={<Voluntario />} />
            <Route path="noticias" element={<NoticiasList />} />
            <Route path="noticias/:slug" element={<NoticiaDetalhe />} />
            <Route path="programas" element={<ObraSocial />} />
            <Route path="cursos" element={<ObraSocial />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="contato" element={<Contato />} />
            <Route path="doe" element={<Doe />} />
            <Route path="doacao-confirmada" element={<DoacaoConfirmada />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
