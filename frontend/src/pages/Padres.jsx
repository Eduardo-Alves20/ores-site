import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { CalendarDays, Church, X } from 'lucide-react';

function initials(priest) {
  return priest.sigla || priest.name?.replace(/^Pe\.?\s*/i, '').slice(0, 2).toUpperCase() || 'P';
}

function PriestPhoto({ priest, size = 118 }) {
  const fallback = (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.max(24, size * .28), color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:700, border:'4px solid var(--gold)' }}>
      {initials(priest)}
    </div>
  );

  if (!priest.photo_url) return fallback;

  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <img
        src={priest.photo_url}
        alt={priest.name}
        onError={e => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling.style.display = 'flex';
        }}
        style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:'4px solid var(--gold)', display:'block', background:'var(--cream)' }}
      />
      <div style={{ display:'none', position:'absolute', inset:0, borderRadius:'50%', background:'var(--gold)', alignItems:'center', justifyContent:'center', fontSize:Math.max(24, size * .28), color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:700, border:'4px solid var(--gold)' }}>
        {initials(priest)}
      </div>
    </div>
  );
}

function PriestModal({ priest, masses, onClose }) {
  if (!priest) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:3500, background:'rgba(26,39,68,.62)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ width:'100%', maxWidth:680, background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'34px 28px 28px', background:'var(--navy)', position:'relative', textAlign:'center' }}>
          <button type="button" onClick={onClose} style={{ position:'absolute', top:18, right:18, width:34, height:34, borderRadius:10, background:'#fff', color:'var(--text-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={18} />
          </button>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
            <PriestPhoto priest={priest} size={150} />
          </div>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-light)', marginBottom:8 }}>{priest.role}</div>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(26px,4vw,38px)', color:'#fff', fontWeight:700 }}>{priest.name}</h2>
        </div>

        <div style={{ padding:28 }}>
          <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'18px', background:'var(--cream)', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)', marginBottom:10 }}>
              <Church size={14} /> Biografia
            </div>
            <p style={{ fontSize:14, color:'var(--text-mid)', lineHeight:1.8 }}>{priest.bio || 'Sem biografia cadastrada.'}</p>
          </div>

          <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'18px', background:'var(--cream)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12 }}>
              <CalendarDays size={14} /> Celebra missas
            </div>
            {masses.filter(Boolean).length > 0 ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {masses.filter(Boolean).map((m, j) => (
                  <span key={j} style={{ fontSize:12, background:'#fff', color:'var(--navy)', padding:'5px 10px', borderRadius:8, fontWeight:600, border:'1px solid var(--border)' }}>{m}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize:14, color:'var(--text-soft)' }}>Nenhum horário cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Padres() {
  const { data: priests, loading } = useFetch('/priests');
  const [selected, setSelected] = useState(null);
  const selectedMasses = selected ? (typeof selected.masses === 'string' ? JSON.parse(selected.masses) : (selected.masses || [])) : [];

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Paróquia" title="Padres e Diáconos" subtitle="Conheça os sacerdotes e diáconos que servem a nossa comunidade." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
            {(priests || []).map((p, i) => {
              const masses = typeof p.masses === 'string' ? JSON.parse(p.masses) : (p.masses || []);
              return (
                <Reveal key={p.id} delay={i * 80}>
                  <button type="button" onClick={() => setSelected(p)} style={{ display:'block', width:'100%', textAlign:'left', background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 4px 14px rgba(0,0,0,.04)', transition:'transform .2s, box-shadow .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 14px 34px rgba(26,39,68,.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,.04)'; }}>
                    <div style={{ background:'var(--navy)', height:170, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <PriestPhoto priest={p} size={118} />
                    </div>
                    <div style={{ padding:'22px 24px' }}>
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', padding:'3px 9px', borderRadius:100, background:'rgba(184,148,90,.1)', color:'var(--gold)', marginBottom:10 }}>{p.role}</span>
                      <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700, color:'var(--navy)', marginBottom:10, lineHeight:1.25 }}>{p.name}</h3>
                      <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65, marginBottom:16 }}>{p.bio}</p>
                      {masses.filter(Boolean).length > 0 && (
                        <div>
                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-soft)', marginBottom:8 }}>Celebra missas</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {masses.filter(Boolean).slice(0, 5).map((m, j) => (
                              <span key={j} style={{ fontSize:11, background:'var(--cream-dark)', color:'var(--navy)', padding:'3px 8px', borderRadius:6, fontWeight:600 }}>{m}</span>
                            ))}
                            {masses.filter(Boolean).length > 5 && <span style={{ fontSize:11, color:'var(--gold)', fontWeight:800, padding:'3px 2px' }}>+{masses.filter(Boolean).length - 5}</span>}
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop:16, fontSize:12, fontWeight:800, color:'var(--gold)' }}>Ver detalhes →</div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <PriestModal priest={selected} masses={selectedMasses} onClose={() => setSelected(null)} />
    </div>
  );
}
