import { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Clock, User, Music, Video, Play, X } from 'lucide-react';
import { normalizeMediaUrl } from '../lib/media';

const TYPE_COLORS = {
  Homilia: { bg: 'var(--navy)', text: '#fff', badge: 'rgba(26,39,68,.12)', badgeText: 'var(--navy)' },
  Reflexao: { bg: 'var(--gold)', text: '#fff', badge: 'rgba(184,148,90,.15)', badgeText: '#a07830' },
  Podcast:  { bg: '#6366f1', text: '#fff', badge: 'rgba(99,102,241,.12)', badgeText: '#6366f1' },
};

function VideoModal({ videoUrl, title, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!videoUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(940px, 100%)', background: '#0b1220', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.45)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.12)', color: '#fff' }}>
          <p style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title || 'Video'}</p>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        <video src={videoUrl} controls autoPlay style={{ width: '100%', display: 'block', maxHeight: '76vh', background: '#000' }} />
      </div>
    </div>
  );
}

function HomiliaCard({ h, onPlay, onWatchVideo }) {
  const normalizedType = String(h.type || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const color = TYPE_COLORS[h.type] || TYPE_COLORS[normalizedType] || TYPE_COLORS.Homilia;
  const audioUrl = normalizeMediaUrl(h.audio_url);
  const videoUrl = normalizeMediaUrl(h.video_url);
  const hasAudio = !!audioUrl;
  const hasVideo = !!videoUrl;

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

      {/* Rodapé com botões */}
      {(hasAudio || hasVideo) && (
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8,
        }}>
          {hasAudio && (
            <button
              onClick={() => onPlay({ title: h.title, priest: h.priest_name, audioUrl })}
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
            <button
              type="button"
              onClick={() => onWatchVideo({ title: h.title, videoUrl })}
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
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Homilias() {
  const { data: homilies, loading } = useFetch('/homilies');
  const { play } = useAudioPlayer();
  const [videoModal, setVideoModal] = useState(null);

  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="Comunicação"
        title="Homilias e Reflexões"
        subtitle="Ouça as homilias e reflexões dos nossos sacerdotes."
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
                <HomiliaCard h={h} onPlay={play} onWatchVideo={setVideoModal} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
      {videoModal?.videoUrl && (
        <VideoModal
          title={videoModal.title}
          videoUrl={videoModal.videoUrl}
          onClose={() => setVideoModal(null)}
        />
      )}
    </div>
  );
}

