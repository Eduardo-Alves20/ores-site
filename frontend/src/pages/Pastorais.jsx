import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Phone, Clock, MapPin, Search, X } from 'lucide-react';

function mediaFallback(name) {
  return (
    <div style={{ height:132, background:'linear-gradient(135deg,var(--navy),var(--navy-light))', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.35)', fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:700 }}>
      {name?.slice(0, 1) || 'P'}
    </div>
  );
}

function PastoralModal({ pastoral, onClose }) {
  if (!pastoral) return null;
  const time = [pastoral.meeting_day, pastoral.meeting_time].filter(Boolean).join(', ');
  const hasMap = Boolean(pastoral.map_url);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:3500, background:'rgba(26,39,68,.62)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ width:'100%', maxWidth:680, background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'26px 28px', background:'var(--cream)', borderBottom:'1px solid var(--border)', position:'relative' }}>
          <button type="button" onClick={onClose} style={{ position:'absolute', top:18, right:18, width:34, height:34, borderRadius:10, background:'#fff', color:'var(--text-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={18} />
          </button>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{pastoral.category || 'Pastoral'}</div>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(26px,4vw,36px)', color:'var(--navy)', fontWeight:700, marginBottom:6, paddingRight:42 }}>{pastoral.name}</h2>
          {pastoral.coordinator && <p style={{ fontSize:14, color:'var(--text-mid)' }}>Coord.: {pastoral.coordinator}</p>}
        </div>

        <div style={{ padding:28 }}>
          <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', marginBottom:18, background:'var(--cream)' }}>
            {hasMap ? (
              <iframe title={`Mapa ${pastoral.name}`} src={pastoral.map_url} style={{ width:'100%', height:220, border:0, display:'block' }} loading="lazy" />
            ) : pastoral.image_url ? (
              <img src={pastoral.image_url} alt="" style={{ width:'100%', height:220, objectFit:'cover' }} />
            ) : mediaFallback(pastoral.name)}
          </div>

          {pastoral.description && <p style={{ fontSize:14, color:'var(--text-mid)', lineHeight:1.75, marginBottom:18 }}>{pastoral.description}</p>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'16px', background:'var(--cream)' }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Endereço</div>
              <div style={{ fontSize:14, color:'var(--navy)', lineHeight:1.6 }}>{pastoral.address || pastoral.location || 'Não informado'}</div>
            </div>
            <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'16px', background:'var(--cream)' }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Horários</div>
              <div style={{ fontSize:14, color:'var(--navy)', lineHeight:1.6 }}>{time || 'Não informado'}</div>
            </div>
          </div>

          <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'16px', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Telefone</div>
              <div style={{ fontSize:14, color:'var(--navy)' }}>{pastoral.phone || 'Não informado'}</div>
            </div>
            {pastoral.phone && (
              <a href={`https://wa.me/${pastoral.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ padding:'10px 22px', borderRadius:100, background:'var(--gold)', color:'#fff', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>
                Contato
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pastorais() {
  const { data: pastorals, loading } = useFetch('/pastorals');
  const [activeTab, setActiveTab] = useState('Todos');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const all = pastorals || [];
  const categories = ['Todos', ...new Set(all.map(p => p.category).filter(Boolean))];
  const filtered = (activeTab === 'Todos' ? all : all.filter(p => p.category === activeTab))
    .filter(p => [p.name, p.category, p.location, p.address, p.coordinator].join(' ').toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Pastorais e Movimentos" subtitle="Conheça os grupos pastorais e movimentos que atuam em nossa paróquia." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        <Reveal>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:20, marginBottom:28, flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding:'7px 18px', borderRadius:100, fontSize:13, fontWeight:600, border:'1.5px solid', borderColor:activeTab===cat?'var(--gold)':'var(--border)', background:activeTab===cat?'var(--gold)':'#fff', color:activeTab===cat?'#fff':'var(--text-mid)', transition:'all .2s' }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ position:'relative', minWidth:260 }}>
              <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gold)' }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nome ou local..." style={{ width:'100%', padding:'11px 16px 11px 38px', borderRadius:100, border:'1px solid var(--border)', background:'#fff', fontSize:13, outline:'none', boxShadow:'0 8px 24px rgba(0,0,0,.04)' }} />
            </div>
          </div>
        </Reveal>

        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:22 }}>
            {filtered.map((p, i) => {
              const time = [p.meeting_day, p.meeting_time].filter(Boolean).join(', ');
              return (
                <Reveal key={p.id} delay={i * 50}>
                  <button type="button" onClick={() => setSelected(p)} style={{ display:'block', width:'100%', textAlign:'left', background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 4px 14px rgba(0,0,0,.04)', transition:'transform .2s, box-shadow .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 14px 34px rgba(26,39,68,.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,.04)'; }}>
                    {p.image_url ? <img src={p.image_url} alt="" style={{ width:'100%', height:132, objectFit:'cover', display:'block' }} /> : mediaFallback(p.name)}
                    <div style={{ padding:'20px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start', marginBottom:10 }}>
                        <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:19, fontWeight:700, color:'var(--navy)', lineHeight:1.25 }}>{p.name}</h3>
                        {p.category && <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)', background:'rgba(184,148,90,.1)', padding:'3px 8px', borderRadius:100, flexShrink:0 }}>{p.category}</span>}
                      </div>
                      {p.address || p.location ? <p style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, color:'var(--text-mid)', marginBottom:8 }}><MapPin size={13} style={{ color:'var(--gold)' }} />{p.address || p.location}</p> : null}
                      {time && <p style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, color:'var(--text-mid)', marginBottom:8 }}><Clock size={13} style={{ color:'var(--gold)' }} />{time}</p>}
                      {p.coordinator && <p style={{ fontSize:12.5, color:'var(--text-soft)', marginTop:14 }}>Coord.: {p.coordinator}</p>}
                      <div style={{ marginTop:16, fontSize:12, fontWeight:700, color:'var(--gold)' }}>Ver detalhes →</div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <PastoralModal pastoral={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
