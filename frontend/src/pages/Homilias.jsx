import { useFetch } from '../hooks/useFetch';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Clock, User, Play, Video, Music } from 'lucide-react';

const TYPE_COLORS = { Homilia: 'var(--navy)', Reflexão: 'var(--gold)', Podcast: '#6366f1' };

export default function Homilias() {
  const { data: homilies, loading } = useFetch('/homilies');
  const { play } = useAudioPlayer();

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunicação" title="Homilias e Reflexões" subtitle="Ouça as homilias e reflexões dos nossos sacerdotes." />
      <section style={{ padding: '72px 24px', maxWidth: 1100, margin: '0 auto' }}>
        {loading ? <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(homilies || []).map((h, i) => (
              <Reveal key={h.id} delay={i * 60}>
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'center', transition: 'box-shadow .2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.06)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: TYPE_COLORS[h.type] || 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={20} style={{ color: '#fff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: (TYPE_COLORS[h.type] || 'var(--navy)') + '22', color: TYPE_COLORS[h.type] || 'var(--navy)' }}>{h.type}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{h.title}</h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-soft)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={12} />{h.priest_name}</span>
                      {h.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} />{h.duration}</span>}
                      {h.published_at && <span>{new Date(h.published_at).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {h.audio_url && (
                      <button
                        onClick={() => play({ title: h.title, priest: h.priest_name, audioUrl: h.audio_url })}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 100, background: 'var(--gold)', color: '#fff', fontSize: 13, fontWeight: 600, transition: 'transform .2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = ''}>
                        <Music size={14} /> Ouvir
                      </button>
                    )}
                    {h.video_url && (
                      <a href={h.video_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 100, background: 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 600, transition: 'transform .2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = ''}>
                        <Video size={14} /> Assistir
                      </a>
                    )}
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
