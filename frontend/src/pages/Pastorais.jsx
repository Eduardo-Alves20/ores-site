import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Phone, Clock, MapPin, ChevronDown } from 'lucide-react';

export default function Pastorais() {
  const { data: pastorals, loading } = useFetch('/pastorals');
  const [activeTab, setActiveTab] = useState('Todos');
  const [expanded, setExpanded] = useState(null);

  const all = pastorals || [];
  const categories = ['Todos', ...new Set(all.map(p => p.category).filter(Boolean))];
  const filtered = activeTab === 'Todos' ? all : all.filter(p => p.category === activeTab);

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Pastorais e Movimentos" subtitle="Conheça os grupos pastorais e movimentos que atuam em nossa paróquia." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {/* Tabs */}
        <Reveal>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:36 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding:'7px 18px', borderRadius:100, fontSize:13, fontWeight:500, border:'1.5px solid', borderColor:activeTab===cat?'var(--gold)':'var(--border)', background:activeTab===cat?'var(--gold)':'transparent', color:activeTab===cat?'#fff':'var(--text-mid)', transition:'all .2s' }}>
                {cat}
              </button>
            ))}
          </div>
        </Reveal>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
                  <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ display:'flex', width:'100%', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', textAlign:'left' }}>
                    <div>
                      <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gold)', marginRight:10 }}>{p.category}</span>
                      <span style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, color:'var(--navy)' }}>{p.name}</span>
                    </div>
                    <ChevronDown size={16} style={{ color:'var(--text-soft)', transform:expanded===p.id?'rotate(180deg)':'', transition:'transform .2s', flexShrink:0 }} />
                  </button>
                  {expanded === p.id && (
                    <div style={{ padding:'0 24px 20px', borderTop:'1px solid var(--cream-dark)' }}>
                      <p style={{ fontSize:14, color:'var(--text-mid)', lineHeight:1.7, marginBottom:14, paddingTop:14 }}>{p.description}</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:16, fontSize:13, color:'var(--text-soft)' }}>
                        {p.meeting_day && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Clock size={12} style={{ color:'var(--gold)' }} />{p.meeting_day} {p.meeting_time && `· ${p.meeting_time}`}</span>}
                        {p.location && <span style={{ display:'flex', alignItems:'center', gap:5 }}><MapPin size={12} style={{ color:'var(--gold)' }} />{p.location}</span>}
                        {p.coordinator && <span style={{ fontWeight:500, color:'var(--navy)' }}>Coord.: {p.coordinator}</span>}
                        {p.phone && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Phone size={12} style={{ color:'var(--gold)' }} />{p.phone}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
