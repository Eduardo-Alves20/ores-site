import { useFetch } from '../../hooks/useFetch';
import { Calendar, Newspaper, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getSiteName } from '../../lib/branding';

function StatCard({ icon, label, value, color, to }) {
  return (
    <Link
      to={to}
      style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'box-shadow .2s,transform .2s' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.07)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif' }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{label}</div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch('/admin/dashboard');
  const { data: siteInfo } = useFetch('/site-info');
  const siteName = getSiteName(siteInfo || {});
  const stats = data?.stats || {};
  const logs = data?.recentLogs || [];
  const msgs = data?.recentMessages || [];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Ola, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>Bem-vindo ao painel administrativo da {siteName}.</p>
      </div>

      {loading ? <p style={{ color: 'var(--text-soft)' }}>Carregando...</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon={<Calendar size={22} />} label="Eventos ativos" value={stats.events ?? '-'} color="#b8945a" to="/admin/events" />
            <StatCard icon={<Newspaper size={22} />} label="Noticias publicadas" value={stats.news ?? '-'} color="#6366f1" to="/admin/news" />
            <StatCard icon={<MessageSquare size={22} />} label="Mensagens nao lidas" value={stats.unreadMessages ?? '-'} color="#ef4444" to="/admin/messages" />
            <StatCard icon={<Clock size={22} />} label="Agendamentos pendentes" value={stats.pendingBookings ?? '-'} color="#f59e0b" to="/admin/bookings" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Mensagens Recentes</h3>
                <Link to="/admin/messages" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>Ver todas →</Link>
              </div>
              {msgs.length === 0 ? <p style={{ padding: '20px', color: 'var(--text-soft)', fontSize: 13 }}>Nenhuma mensagem.</p> : msgs.map((m, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: i < msgs.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)' }}>{m.name}</span>
                    {!m.read_at && <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 100, fontWeight: 700 }}>Novo</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{m.subject || '(Sem assunto)'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>{m.email}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Atividade Recente</h3>
                <Link to="/admin/audit" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>Ver log →</Link>
              </div>
              {logs.length === 0 ? <p style={{ padding: '20px', color: 'var(--text-soft)', fontSize: 13 }}>Nenhuma atividade.</p> : logs.map((l, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: i < logs.length - 1 ? '1px solid var(--cream-dark)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 500 }}>{l.admin_name} · <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>{l.action.replace(/_/g, ' ')}</span></div>
                    <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{new Date(l.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
