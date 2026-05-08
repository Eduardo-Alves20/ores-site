import { useEffect, useRef, useState } from 'react';
import { X, Music, Play, Pause } from 'lucide-react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

export default function PersistentAudioPlayer() {
  const { track, audioRef, stop } = useAudioPlayer();
  const localRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!track || !localRef.current) return;
    audioRef.current = localRef.current;
    localRef.current.src = track.audioUrl;
    localRef.current.play().then(() => setPlaying(true)).catch(() => {});
  }, [track, audioRef]);

  if (!track) return null;

  const toggle = () => {
    if (!localRef.current) return;
    if (playing) {
      localRef.current.pause();
      setPlaying(false);
    } else {
      localRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'var(--navy)', color: '#fff',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 -4px 24px rgba(0,0,0,.3)',
      borderTop: '1px solid rgba(255,255,255,.08)',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Music size={18} style={{ color: '#fff' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1 }}>{track.title}</p>
        {track.priest && <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.priest}</p>}
      </div>

      <audio
        ref={localRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ display: 'none' }}
      />

      <button onClick={toggle}
        style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <input type="range" min={0} max={1}
        style={{ width: 100, accentColor: 'var(--gold)', flexShrink: 0 }}
        defaultValue={1}
        onChange={e => { if (localRef.current) localRef.current.volume = Number(e.target.value); }}
      />

      <button onClick={stop}
        style={{ width: 34, height: 34, borderRadius: 8, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}>
        <X size={18} />
      </button>
    </div>
  );
}
