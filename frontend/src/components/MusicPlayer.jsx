import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, X } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

const STORAGE_KEY = 'ores_music_state_v1';
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore quota errors */ }
}

export default function MusicPlayer() {
  const { data } = useFetch('/music');
  const tracks = data?.tracks || [];
  const enabled = data?.enabled;
  const autoplay = data?.autoplay;
  const defaultVolume = data?.defaultVolume ?? 35;

  const audioRef = useRef(null);
  const stored = loadState();

  const [trackIdx, setTrackIdx] = useState(stored.trackIdx ?? 0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(stored.volume ?? defaultVolume);
  const [muted, setMuted] = useState(stored.muted ?? false);
  const [collapsed, setCollapsed] = useState(stored.collapsed ?? false);
  const [hidden, setHidden] = useState(stored.hidden ?? false);
  const [blockedByBrowser, setBlockedByBrowser] = useState(false);

  // Persist state across refreshes
  useEffect(() => {
    saveState({ trackIdx, volume, muted, collapsed, hidden });
  }, [trackIdx, volume, muted, collapsed, hidden]);

  // Apply the volume / mute settings to the audio element
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = (muted ? 0 : volume) / 100;
  }, [volume, muted]);

  // When tracks load for the first time, try to start playing if autoplay is on
  useEffect(() => {
    if (!enabled || !tracks.length || !autoplay || !audioRef.current) return;
    const el = audioRef.current;
    el.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Browser blocked the autoplay — wait for first user interaction anywhere
        setBlockedByBrowser(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tracks.length, autoplay]);

  // When the browser blocked autoplay, retry on the first user click anywhere
  useEffect(() => {
    if (!blockedByBrowser || !audioRef.current) return undefined;
    const tryPlay = () => {
      audioRef.current?.play().then(() => {
        setPlaying(true);
        setBlockedByBrowser(false);
      }).catch(() => { /* user can press play manually */ });
    };
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('keydown', tryPlay, { once: true });
    return () => {
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('keydown', tryPlay);
    };
  }, [blockedByBrowser]);

  if (!enabled || tracks.length === 0 || hidden) return null;

  const current = tracks[trackIdx] || tracks[0];
  const trackLabel = current?.title || current?.file_url?.split('/').pop() || 'Música';

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch { /* ignore */ }
    }
  };

  const next = () => setTrackIdx((i) => (i + 1) % tracks.length);
  const prev = () => setTrackIdx((i) => (i - 1 + tracks.length) % tracks.length);

  // Auto-advance on end. Single-track case: loop the same one.
  const onEnded = () => {
    if (tracks.length === 1) {
      audioRef.current?.play().catch(() => {});
    } else {
      next();
    }
  };

  // ── Collapsed pill (just a tiny floating music icon) ────────────────────────
  if (collapsed) {
    return (
      <>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Abrir player de música"
          style={{
            position: 'fixed', bottom: 18, left: 18, zIndex: 998,
            width: 46, height: 46, borderRadius: '50%',
            background: 'var(--navy)', color: '#fff', border: '2px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 22px rgba(0,0,0,.3)', cursor: 'pointer',
          }}
        >
          {playing ? <Music size={18} className="pulse" /> : <Music size={18} />}
        </button>
        <audio ref={audioRef} src={current.file_url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={onEnded} preload="auto" />
        <style>{`@keyframes pulse-anim { 0%, 100% { opacity: 1; } 50% { opacity: .4; } } .pulse { animation: pulse-anim 1.5s ease-in-out infinite; }`}</style>
      </>
    );
  }

  // ── Expanded compact player ─────────────────────────────────────────────────
  return (
    <div
      className="notranslate"
      translate="no"
      style={{
        position: 'fixed', bottom: 18, left: 18, zIndex: 998,
        width: 'min(320px, calc(100vw - 36px))',
        background: 'rgba(13,45,94,.96)',
        backdropFilter: 'blur(10px)',
        borderRadius: 14,
        boxShadow: '0 12px 36px rgba(0,0,0,.4)',
        border: '1px solid rgba(255,255,255,.1)',
        color: '#fff',
        padding: '12px 14px',
        fontFamily: 'Plus Jakarta Sans,sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Music size={14} className={playing ? 'pulse' : ''} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>
            {tracks.length > 1 ? `Faixa ${trackIdx + 1} de ${tracks.length}` : 'Tocando'}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trackLabel}</div>
        </div>
        <button type="button" onClick={() => setCollapsed(true)} aria-label="Minimizar"
          style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer' }}>—</button>
        <button type="button" onClick={() => setHidden(true)} aria-label="Fechar"
          style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} />
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {tracks.length > 1 && (
          <button type="button" onClick={prev} aria-label="Anterior"
            style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SkipBack size={14} />
          </button>
        )}
        <button type="button" onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Tocar'}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
        </button>
        {tracks.length > 1 && (
          <button type="button" onClick={next} aria-label="Próxima"
            style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SkipForward size={14} />
          </button>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
          <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Tirar mudo' : 'Mudo'}
            style={{ width: 24, height: 24, background: 'transparent', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); if (muted) setMuted(false); }}
            aria-label="Volume"
            style={{ flex: 1, accentColor: 'var(--gold)', height: 4 }}
          />
        </div>
      </div>

      {blockedByBrowser && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', textAlign: 'center', paddingTop: 4 }}>
          Clique em qualquer lugar para iniciar a música 🎵
        </div>
      )}

      <audio ref={audioRef} src={current.file_url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={onEnded} preload="auto" />
      <style>{`@keyframes pulse-anim { 0%, 100% { opacity: 1; } 50% { opacity: .4; } } .pulse { animation: pulse-anim 1.5s ease-in-out infinite; }`}</style>
    </div>
  );
}
