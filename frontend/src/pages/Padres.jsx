import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

export default function Padres() {
  const { data: priests, loading } = useFetch('/priests');

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Paróquia" title="Padres e Diáconos" subtitle="Conheça os sacerdotes e diáconos que servem a nossa comunidade." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
            {(priests || []).map((p, i) => {
              const masses = typeof p.masses === 'string' ? JSON.parse(p.masses) : (p.masses || []);
              return (
                <Reveal key={p.id} delay={i * 80}>
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}>
                    <div style={{ background:'var(--navy)', height:120, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.name} style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid var(--gold)' }} />
                        : <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:700 }}>{p.sigla}</div>
                      }
                    </div>
                    <div style={{ padding:'20px 24px' }}>
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'2px 8px', borderRadius:100, background:'rgba(184,148,90,.1)', color:'var(--gold)', marginBottom:8 }}>{p.role}</span>
                      <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:10 }}>{p.name}</h3>
                      <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65, marginBottom:14 }}>{p.bio}</p>
                      {masses.filter(Boolean).length > 0 && (
                        <div>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-soft)', marginBottom:8 }}>Celebra missas</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {masses.filter(Boolean).map((m, j) => (
                              <span key={j} style={{ fontSize:11, background:'var(--cream-dark)', color:'var(--navy)', padding:'3px 8px', borderRadius:6, fontWeight:500 }}>{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
