import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Clock, User, Play } from 'lucide-react';

const TYPE_COLORS = { Homilia:'var(--navy)', Reflexão:'var(--gold)', Podcast:'#6366f1' };

export default function Homilias() {
  const { data: homilies, loading } = useFetch('/homilias');
  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunicação" title="Homilias e Reflexões" subtitle="Ouça as homilias e reflexões dos nossos sacerdotes." />
      <section style={{ padding:'72px 24px', maxWidth:1100, margin:'0 auto' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {(homilies || []).map((h, i) => (
              <Reveal key={h.id} delay={i * 60}>
                <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'22px 24px', display:'flex', gap:16, alignItems:'center', transition:'box-shadow .2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.06)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow=''}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:TYPE_COLORS[h.type]||'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Play size={20} style={{ color:'#fff' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
                      <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', padding:'2px 8px', borderRadius:100, background:TYPE_COLORS[h.type]+'22'||'rgba(26,39,68,.08)', color:TYPE_COLORS[h.type]||'var(--navy)' }}>{h.type}</span>
                    </div>
                    <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:6 }}>{h.title}</h3>
                    <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text-soft)' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:5 }}><User size={12} />{h.priest_name}</span>
                      {h.duration && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Clock size={12} />{h.duration}</span>}
                      {h.published_at && <span>{new Date(h.published_at).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                  {h.audio_url && (
                    <a href={h.audio_url} target="_blank" rel="noopener noreferrer" style={{ padding:'10px 20px', borderRadius:100, background:'var(--gold)', color:'#fff', fontSize:13, fontWeight:600, flexShrink:0, transition:'transform .2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform=''}>
                      Ouvir
                    </a>
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
