import { useFetch } from '../hooks/useFetch';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
}

export function NoticiasList() {
  const { data: news, loading } = useFetch('/news');
  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunicação" title="Notícias" subtitle="Fique por dentro das novidades da Paróquia Espírito Santo." />
      <section style={{ padding:'72px 24px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 }}>
            {(news || []).map((n, i) => (
              <Reveal key={n.id} delay={i * 80}>
                <Link to={`/noticias/${n.slug}`} style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', display:'block', transition:'transform .2s,box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                  <div style={{ height:8, background:'var(--gold)' }} />
                  <div style={{ padding:'24px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', padding:'2px 8px', borderRadius:100, background:'rgba(26,39,68,.08)', color:'var(--navy)' }}>{n.category}</span>
                      <span style={{ fontSize:11, color:'var(--text-soft)' }}>{formatDate(n.published_at)}</span>
                    </div>
                    <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:10, lineHeight:1.35 }}>{n.title}</h3>
                    <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{n.summary}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function NoticiaDetalhe() {
  const { slug } = useParams();
  const { data: news, loading } = useFetch(`/news/${slug}`);
  if (loading) return <div style={{ paddingTop:100, textAlign:'center', color:'var(--text-soft)' }}>Carregando...</div>;
  if (!news) return <div style={{ paddingTop:100, textAlign:'center' }}><p>Notícia não encontrada.</p><Link to="/noticias" style={{ color:'var(--gold)', fontWeight:600 }}>← Voltar</Link></div>;
  return (
    <div className="animate-page">
      <PageHeader eyebrow={news.category} title={news.title} subtitle={formatDate(news.published_at)} />
      <section style={{ padding:'72px 24px', maxWidth:800, margin:'0 auto' }}>
        <Reveal>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'40px' }}>
            {news.content
              ? <div style={{ fontSize:15, lineHeight:1.8, color:'var(--text-mid)' }} dangerouslySetInnerHTML={{ __html: news.content }} />
              : <p style={{ fontSize:15, lineHeight:1.8, color:'var(--text-mid)' }}>{news.summary}</p>
            }
            <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)' }}>
              <Link to="/noticias" style={{ color:'var(--gold)', fontWeight:600, fontSize:14 }}>← Voltar para notícias</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
