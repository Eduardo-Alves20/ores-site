import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

export default function Instalacoes() {
  const { data: facilities, loading } = useFetch('/facilities');
  return (
    <div className="animate-page">
      <PageHeader eyebrow="Paróquia" title="Instalações" subtitle="Conheça os espaços da Paróquia Espírito Santo disponíveis para a comunidade." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
            {(facilities || []).map((f, i) => (
              <Reveal key={f.id} delay={i * 70}>
                <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'28px', boxShadow:'0 1px 4px rgba(0,0,0,.03)', transition:'transform .2s,box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.03)'; }}>
                  <div style={{ fontSize:40, marginBottom:16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:10 }}>{f.name}</h3>
                  <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{f.description}</p>
                  {f.capacity && <div style={{ marginTop:12, fontSize:12, color:'var(--text-soft)' }}>Capacidade: {f.capacity} pessoas</div>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
