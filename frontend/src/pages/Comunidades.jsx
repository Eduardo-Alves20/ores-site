import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Phone, MapPin } from 'lucide-react';

export default function Comunidades() {
  const { data: communities, loading } = useFetch('/communities');
  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Comunidades (Setores)" subtitle="Nossa paróquia é formada por diversas comunidades espalhadas pelos bairros da cidade." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
            {(communities || []).map((c, i) => (
              <Reveal key={c.id} delay={i * 60}>
                <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'22px 24px', transition:'transform .2s,box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:10 }}>{c.name}</h3>
                  {c.neighborhood && <p style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-soft)', marginBottom:8 }}><MapPin size={12} style={{ color:'var(--gold)' }} />{c.neighborhood}</p>}
                  {c.coordinator_name && <p style={{ fontSize:13, color:'var(--text-mid)', marginBottom:6 }}>Coord.: {c.coordinator_name}</p>}
                  {c.coordinator_phone && <p style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-soft)' }}><Phone size={12} style={{ color:'var(--gold)' }} />{c.coordinator_phone}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
