import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import api from '../lib/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppAlert } from '../components/AppAlert';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const COLORS = ['#6366f1','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#ef4444','#b8945a'];

export default function Salas() {
  const { data: facilities } = useFetch('/facilities');
  const { notify } = useAppAlert();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { data: bookings, refetch } = useFetch(`/room-bookings?month=${month + 1}&year=${year}`);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ facility_id:'', title:'', description:'', start_time:'', end_time:'', requester_name:'', requester_phone:'' });
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState(null);

  const facilityColor = (id) => COLORS[(id - 1) % COLORS.length];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const bookingsOnDay = (day) => {
    const date = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return (bookings || []).filter(b => b.booking_date?.slice(0, 10) === date && (!filter || b.facility_id === filter));
  };

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const openModal = (day) => {
    const date = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setModal({ day, date });
    setForm({ facility_id: '', title:'', description:'', start_time:'08:00', end_time:'09:00', requester_name:'', requester_phone:'' });
    setMsg('');
  };

  const submit = async () => {
    try {
      await api.post('/room-bookings', { ...form, booking_date: modal.date });
      setMsg('Agendamento solicitado! Aguarde confirmação.');
      notify({ type:'success', title:'Agendamento solicitado', message:'Sua solicitação foi enviada. Aguarde a confirmação da secretaria.' });
      refetch();
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao agendar.';
      setMsg(message);
      notify({ type:'error', title:'Erro ao agendar', message });
    }
  };

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Paróquia" title="Agendamento de Salas" subtitle="Reserve espaços para atividades pastorais e comunitárias." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        <div className="salas-layout" style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24, alignItems:'start' }}>
          {/* Calendar */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}>
            <div style={{ background:'var(--navy)', padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <button onClick={prev} style={{ color:'#fff', opacity:.7, padding:8 }}><ChevronLeft size={20} /></button>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:20, color:'#fff', fontWeight:700 }}>{MONTHS[month]} {year}</h2>
              <button onClick={next} style={{ color:'#fff', opacity:.7, padding:8 }}><ChevronRight size={20} /></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'var(--cream-dark)', borderBottom:'1px solid var(--border)' }}>
              {DAYS.map(d => <div key={d} style={{ padding:'8px 0', textAlign:'center', fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--text-soft)' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {cells.map((day, idx) => {
                const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                const dayBks = day ? bookingsOnDay(day) : [];
                return (
                  <div key={idx} onClick={() => day && openModal(day)}
                    style={{ minHeight:80, padding:'6px', borderRight:idx%7<6?'1px solid var(--cream-dark)':'none', borderBottom:'1px solid var(--cream-dark)', background:day?'#fff':'var(--cream)', cursor:day?'pointer':'default', transition:'background .15s' }}
                    onMouseEnter={e => day && (e.currentTarget.style.background='var(--cream)')}
                    onMouseLeave={e => day && (e.currentTarget.style.background='#fff')}>
                    {day && (
                      <>
                        <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, marginBottom:3, background:isToday?'var(--gold)':'transparent', color:isToday?'#fff':'var(--text-mid)' }}>{day}</div>
                        {dayBks.map((b, i) => (
                          <div key={i} style={{ fontSize:9, background:facilityColor(b.facility_id), color:'#fff', borderRadius:3, padding:'1px 4px', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={b.title}>
                            {b.start_time?.slice(0,5)} {b.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar filters */}
          <div>
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'20px' }}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:14 }}>Filtrar por Sala</h3>
              <button onClick={() => setFilter(null)} style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 12px', borderRadius:8, marginBottom:6, background:!filter?'var(--navy)':'transparent', color:!filter?'#fff':'var(--navy)', fontSize:13, fontWeight:500, transition:'background .15s' }}>
                Todas as salas
              </button>
              {(facilities || []).map((f, i) => (
                <button key={f.id} onClick={() => setFilter(filter === f.id ? null : f.id)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'8px 12px', borderRadius:8, marginBottom:4, background:filter===f.id?COLORS[i%COLORS.length]:'transparent', color:filter===f.id?'#fff':'var(--navy)', fontSize:13, fontWeight:500, transition:'background .15s' }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:COLORS[i%COLORS.length], flexShrink:0 }} />
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {modal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={() => setModal(null)}>
            <div style={{ background:'#fff', borderRadius:16, maxWidth:520, width:'100%', padding:'32px', position:'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setModal(null)} style={{ position:'absolute', top:16, right:16, color:'var(--text-soft)' }}><X size={20} /></button>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>Agendar Sala</h3>
              <p style={{ fontSize:13, color:'var(--text-soft)', marginBottom:24 }}>{modal.date}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <select value={form.facility_id} onChange={e => setForm({ ...form, facility_id: e.target.value })} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, color:'var(--navy)', background:'#fff' }}>
                  <option value="">Selecione a sala...</option>
                  {(facilities || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <input placeholder="Título do evento" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14 }} />
                <textarea placeholder="Descrição / observações" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, resize:'vertical' }} />
                <div className="salas-time-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={{ fontSize:11, color:'var(--text-soft)', fontWeight:600 }}>Início</label><input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} style={{ display:'block', width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14 }} /></div>
                  <div><label style={{ fontSize:11, color:'var(--text-soft)', fontWeight:600 }}>Fim</label><input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} style={{ display:'block', width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14 }} /></div>
                </div>
                <input placeholder="Seu nome" value={form.requester_name} onChange={e => setForm({ ...form, requester_name: e.target.value })} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14 }} />
                <input placeholder="Telefone (opcional)" value={form.requester_phone} onChange={e => setForm({ ...form, requester_phone: e.target.value })} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14 }} />
                {msg && <p style={{ fontSize:13, color:msg.includes('sucesso')||msg.includes('solicitado')?'#16a34a':'#dc2626', fontWeight:500 }}>{msg}</p>}
                <button onClick={submit} style={{ padding:'12px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:700, fontSize:15, transition:'transform .15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform=''}>
                  Solicitar Agendamento
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      <style>{`
        @media (max-width: 980px) {
          .salas-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 720px) {
          .salas-time-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
