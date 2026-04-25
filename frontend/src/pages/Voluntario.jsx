import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Heart, Users, BookOpen, Handshake } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const areas = [
  { icon:<Heart size={28}/>, title:'Pastoral da Saúde', desc:'Visitas a hospitais e doentes em casa, oferecendo conforto espiritual e material.' },
  { icon:<Users size={28}/>, title:'Pastoral Social', desc:'Ações de solidariedade, distribuição de alimentos e apoio às famílias carentes.' },
  { icon:<BookOpen size={28}/>, title:'Catequese', desc:'Formação de crianças e jovens nos sacramentos da iniciação cristã.' },
  { icon:<Handshake size={28}/>, title:'Obra Social', desc:'Apoio na farmácia comunitária, cursos, bazar e atendimento social.' },
];

export default function Voluntario() {
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  return (
    <div className="animate-page">
      <PageHeader eyebrow={s.voluntario_eyebrow || 'Comunidade'} title={s.voluntario_title || 'Quero ser Voluntário'} subtitle={s.voluntario_subtitle || 'Junte-se a nós! Há muitas formas de servir ao próximo.'} />
      <section style={{ padding:'72px 24px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:24, marginBottom:64 }}>
          {areas.map((a, i) => (
            <Reveal key={a.title} delay={i * 80}>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'32px 24px', textAlign:'center', transition:'transform .2s,box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(184,148,90,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--gold)' }}>{a.icon}</div>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:10 }}>{a.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.65 }}>{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ background:'var(--navy)', borderRadius:16, padding:'48px', textAlign:'center' }}>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:28, color:'#fff', fontWeight:700, marginBottom:16 }}>{s.voluntario_cta_title || 'Pronto para servir?'}</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.65)', lineHeight:1.75, maxWidth:560, margin:'0 auto 32px' }}>{s.voluntario_cta_text || 'Entre em contato com a secretaria paroquial ou nos envie uma mensagem. Teremos prazer em apresentar as oportunidades de voluntariado.'}</p>
            <Link to={s.voluntario_cta_url || '/contato'} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'14px 32px', borderRadius:100, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:15, boxShadow:'0 4px 18px rgba(184,148,90,.35)', transition:'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              {s.voluntario_cta_label || 'Entrar em Contato'}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
