import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Phone, Clock, MapPin } from 'lucide-react';

export default function Grupos() {
  const { data: groups, loading } = useFetch('/prayer-groups');
  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Grupos de Oração" subtitle="Venha crescer na fé com nossos grupos de oração e adoração." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
            {(groups || []).map((g, i) => (
              <Reveal key={g.id} delay={i * 70}>
                <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,.03)', transition:'transform .2s,box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:10 }}>{g.name}</h3>
                  <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65, marginBottom:14 }}>{g.description}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:7, fontSize:12, color:'var(--text-soft)' }}>
                    {g.day_of_week && <span style={{ display:'flex', alignItems:'center', gap:6 }}><Clock size={12} style={{ color:'var(--gold)' }} />{g.day_of_week} {g.time_value && `· ${g.time_value}`}</span>}
                    {g.location && <span style={{ display:'flex', alignItems:'center', gap:6 }}><MapPin size={12} style={{ color:'var(--gold)' }} />{g.location}</span>}
                    {g.coordinator_phone && <span style={{ display:'flex', alignItems:'center', gap:6 }}><Phone size={12} style={{ color:'var(--gold)' }} />{g.coordinator_phone}</span>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
