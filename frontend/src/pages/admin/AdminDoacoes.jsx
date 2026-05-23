import { useState, useEffect, useCallback } from 'react';
import { Heart, TrendingUp, DollarSign, Clock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';

const STATUS_LABEL = {
  completed: { label: 'Concluída',  color: '#16a34a', bg: '#dcfce7' },
  pending:   { label: 'Pendente',   color: '#d97706', bg: '#fef3c7' },
  refunded:  { label: 'Reembolsada',color: '#6366f1', bg: '#ede9fe' },
  failed:    { label: 'Falhou',     color: '#dc2626', bg: '#fee2e2' },
};

function fmt(val) {
  return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function StatCard({ icon, label, value, sub, color = 'var(--navy)' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', border: '1.5px solid #e8edf5', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--navy)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDoacoes() {
  const [stats, setStats]   = useState(null);
  const [data, setData]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const { data: res } = await api.get('/admin/doacoes/stats');
      setStats(res);
    } catch {
      /* ignore stats error, list will still show */
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.append('status', status);
      const { data: res } = await api.get(`/admin/doacoes?${params}`);
      setData(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erro ao carregar doações.');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchList(); }, [fetchList]);

  const handleStatusChange = (v) => { setStatus(v); setPage(1); };
  const refresh = () => { fetchStats(); fetchList(); };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--navy)', margin: 0 }}>Doações</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Registros recebidos via PayPal IPN</p>
        </div>
        <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={<DollarSign size={20}/>} label="Total recebido (USD)"
            value={`$${fmt(stats.total_amount)}`}
            sub={`${stats.completed_count} doações concluídas`}
            color="#16a34a" />
          <StatCard icon={<TrendingUp size={20}/>} label="Ticket médio (USD)"
            value={`$${fmt(stats.avg_amount)}`}
            sub="Apenas concluídas"
            color="#0284c7" />
          <StatCard icon={<Heart size={20}/>} label="Este mês (USD)"
            value={`$${fmt(stats.this_month)}`}
            sub={`Mês anterior: $${fmt(stats.last_month)}`}
            color="#db2777" />
          <StatCard icon={<Clock size={20}/>} label="Pendentes"
            value={stats.pending_count}
            sub="Aguardando confirmação"
            color="#d97706" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Filtrar por status:</span>
        {['', 'completed', 'pending', 'refunded', 'failed'].map((s) => (
          <button key={s} onClick={() => handleStatusChange(s)}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${status === s ? 'var(--navy)' : '#e2e8f0'}`, background: status === s ? 'var(--navy)' : '#fff', color: status === s ? '#fff' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            {s === '' ? 'Todos' : STATUS_LABEL[s]?.label || s}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>{total} registro{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', overflow: 'hidden' }}>
        {error && (
          <div style={{ padding: '20px 24px', color: '#dc2626', fontSize: 14 }}>{error}</div>
        )}
        {!error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e8edf5' }}>
                  {['Data', 'Doador', 'E-mail', 'Valor (USD)', 'Status', 'Txn ID'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Carregando…</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma doação encontrada.</td></tr>
                ) : data.map((row) => {
                  const st = STATUS_LABEL[row.status] || { label: row.status, color: '#64748b', bg: '#f1f5f9' };
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>{fmtDate(row.payment_date || row.created_at)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--navy)' }}>{row.payer_name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.payer_email || '—'}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: '#16a34a' }}>${fmt(row.amount)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{row.txn_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#cbd5e1' : 'var(--navy)', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={16}/>
            </button>
            <span style={{ fontSize: 13, color: '#64748b' }}>Página {page} de {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: page === pages ? 'not-allowed' : 'pointer', color: page === pages ? '#cbd5e1' : 'var(--navy)', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>

      {/* IPN tip */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af' }}>
        <strong>Como funciona:</strong> O PayPal envia notificações IPN para{' '}
        <code style={{ background: '#dbeafe', borderRadius: 4, padding: '1px 6px' }}>https://oresong.com/api/webhook/paypal-ipn</code>.
        Configure esse URL em <strong>Conta PayPal → Ferramentas do vendedor → Notificações de pagamento instantâneo</strong>.
      </div>
    </div>
  );
}
