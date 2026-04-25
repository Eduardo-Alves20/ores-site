import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { Check, X } from 'lucide-react';

const STATUS_COLORS = { pending:'#f59e0b', confirmed:'#16a34a', cancelled:'#ef4444' };
const STATUS_LABELS = { pending:'Pendente', confirmed:'Confirmado', cancelled:'Cancelado' };

export default function AdminBookings() {
  const { data: bookings, loading, refetch } = useFetch('/admin/bookings');
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try { await api.put(`/admin/bookings/${id}`, { status }); refetch(); }
    catch { alert('Erro ao atualizar.'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Agendamentos de Salas</h1>
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-soft)' }}>Carregando...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--cream)', borderBottom:'1px solid var(--border)' }}>
                  {['Sala','Título','Data','Horário','Solicitante','Status','Ações'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-soft)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(bookings||[]).length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:'32px 16px', textAlign:'center', color:'var(--text-soft)', fontSize:13 }}>Nenhum agendamento.</td></tr>
                ) : (bookings||[]).map(b => (
                  <tr key={b.id} style={{ borderBottom:'1px solid var(--cream-dark)' }}>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--navy)', fontWeight:600 }}>{b.facility_name}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-mid)' }}>{b.title}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-mid)' }}>{b.booking_date?.slice(0,10)}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-mid)', whiteSpace:'nowrap' }}>{b.start_time?.slice(0,5)}–{b.end_time?.slice(0,5)}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-mid)' }}>{b.requester_name}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background:STATUS_COLORS[b.status]+'22', color:STATUS_COLORS[b.status] }}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updating===b.id} style={{ color:'#16a34a', padding:'4px 8px', borderRadius:6, marginRight:4, transition:'background .15s' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(22,163,74,.1)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'} title="Confirmar">
                            <Check size={15}/>
                          </button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updating===b.id} style={{ color:'#ef4444', padding:'4px 8px', borderRadius:6, transition:'background .15s' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.1)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'} title="Cancelar">
                            <X size={15}/>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
