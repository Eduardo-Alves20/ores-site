import { useFetch } from '../hooks/useFetch';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Clock, User, Music, Video, Play } from 'lucide-react';

const TYPE_COLORS = {
  Homilia: { bg: 'var(--navy)', text: '#fff', badge: 'rgba(26,39,68,.12)', badgeText: 'var(--navy)' },
  Reflexao: { bg: 'var(--gold)', text: '#fff', badge: 'rgba(184,148,90,.15)', badgeText: '#a07830' },
  Podcast:  { bg: '#6366f1', text: '#fff', badge: 'rgba(99,102,241,.12)', badgeText: '#6366f1' },
};

function HomiliaCard({ h, onPlay }) {
  const normalizedType = String(h.type || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const color = TYPE_COLORS[h.type] || TYPE_COLORS[normalizedType] || TYPE_COLORS.Homilia;
  const hasAudio = !!h.audio_url;
  const hasVideo = !!h.video_url;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        transition: 'transform .25s cubic-bezier(.22,.61,.36,1), box-shadow .25s cubic-bezier(.22,.61,.36,1)',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,.14)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)';
      }}
    >
      {/* Topo colorido */}
      <div style={{
        background: color.bg,
        padding: '28px 24px 20px',
        position: 'relative',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Play size={22} style={{ color: '#fff', marginLeft: 2 }} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100,
          background: 'rgba(255,255,255,.22)', color: '#fff',
          alignSelf: 'flex-start',
        }}>{h.type}</span>
      </div>

      {/* Corpo */}
      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{
          fontFamily: 'Playfair Display,serif',
          fontSize: 15, fontWeight: 700,
          color: 'var(--navy)', lineHeight: 1.4,
          flex: 1,
        }}>{h.title}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {h.priest_name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-soft)' }}>
              <User size={12} style={{ flexShrink: 0 }} />{h.priest_name}
            </span>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            {h.duration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-soft)' }}>
                <Clock size={12} />{h.duration}
              </span>
            )}
            {h.published_at && (
              <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                {new Date(h.published_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RodapÃ© com botÃµes */}
      {(hasAudio || hasVideo) && (
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8,
        }}>
          {hasAudio && (
            <button
              onClick={() => onPlay({ title: h.title, priest: h.priest_name, audioUrl: h.audio_url })}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, padding: '9px 14px', borderRadius: 100,
                background: 'var(--gold)', color: '#fff',
                fontSize: 13, fontWeight: 700,
                transition: 'filter .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              <Music size={14} /> Ouvir
            </button>
          )}
          {hasVideo && (
            <a
              href={h.video_url} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, padding: '9px 14px', borderRadius: 100,
                background: 'var(--navy)', color: '#fff',
                fontSize: 13, fontWeight: 700,
                transition: 'filter .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              <Video size={14} /> Assistir
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function Homilias() {
  const { data: homilies, loading } = useFetch('/homilies');
  const { play } = useAudioPlayer();

  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="ComunicaÃ§Ã£o"
        title="Homilias e ReflexÃµes"
        subtitle="OuÃ§a as homilias e reflexÃµes dos nossos sacerdotes."
      />

      <section style={{ padding: '72px 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</p>
        ) : (homilies || []).length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Nenhuma homilia cadastrada ainda.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 24,
          }}>
            {(homilies || []).map((h, i) => (
              <Reveal key={h.id} delay={i * 60}>
                <HomiliaCard h={h} onPlay={play} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

