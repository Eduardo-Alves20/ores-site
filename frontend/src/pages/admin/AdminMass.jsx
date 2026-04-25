import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function AdminMass() {
  const { data, loading, refetch } = useFetch('/admin/mass-schedule');
  const [schedule, setSchedule] = useState([]);
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (data) {
      setSchedule(data.map(d => ({
        ...d,
        times: typeof d.times === 'string' ? JSON.parse(d.times) : (d.times || []),
      })));
    }
  }, [data]);

  const addTime = (dayId) => {
    setSchedule(s => s.map(d => d.id === dayId ? { ...d, times:[...(d.times||[]),{time:'07:00',sigla:''}] } : d));
  };

  const removeTime = (dayId, idx) => {
    setSchedule(s => s.map(d => d.id === dayId ? { ...d, times: d.times.filter((_,i)=>i!==idx) } : d));
  };

  const updateTime = (dayId, idx, field, val) => {
    setSchedule(s => s.map(d => d.id === dayId ? { ...d, times: d.times.map((t,i)=>i===idx?{...t,[field]:val}:t) } : d));
  };

  const saveDay = async (day) => {
    setSaving(day.id);
    try {
      await api.put(`/admin/mass-schedule/${day.id}`, { times: day.times.filter(t => t.time) });
      setMsg(`Horários de ${day.day_name} salvos!`);
      refetch();
    } catch { setMsg('Erro ao salvar.'); }
    finally { setSaving(null); }
  };

  return (
    <div>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>Horários de Missa</h1>
      {msg && <p style={{ marginBottom:16, fontSize:14, color:'#16a34a', fontWeight:500 }}>{msg}</p>}
      {loading ? <p style={{ color:'var(--text-soft)' }}>Carregando...</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {schedule.map(day => (
            <div key={day.id} style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'20px 24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontWeight:700, color:'var(--navy)' }}>{day.day_name}</h3>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => addTime(day.id)} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--gold)', fontWeight:600 }}><Plus size={14}/>Horário</button>
                  <button onClick={() => saveDay(day)} disabled={saving===day.id} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, background:'var(--gold)', color:'#fff', fontSize:12, fontWeight:600 }}>
                    <Save size={13}/>{saving===day.id?'Salvando...':'Salvar'}
                  </button>
                </div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {(day.times||[]).filter(t=>t&&t.time).map((t, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--cream)', borderRadius:8, padding:'8px 12px', border:'1px solid var(--border)' }}>
                    <input type="time" value={t.time||''} onChange={e=>updateTime(day.id,i,'time',e.target.value)} style={{ border:'none', background:'transparent', fontSize:14, fontWeight:600, color:'var(--navy)', outline:'none', width:70 }} />
                    <input placeholder="Sigla" value={t.sigla||''} onChange={e=>updateTime(day.id,i,'sigla',e.target.value)} style={{ border:'none', background:'transparent', fontSize:13, color:'var(--text-soft)', outline:'none', width:50 }} />
                    <button onClick={()=>removeTime(day.id,i)} style={{ color:'#ef4444', padding:2, flexShrink:0 }}><Trash2 size={13}/></button>
                  </div>
                ))}
                {(day.times||[]).filter(t=>t&&t.time).length === 0 && <span style={{ fontSize:13, color:'var(--text-soft)' }}>Nenhum horário cadastrado.</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
