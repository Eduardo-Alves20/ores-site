import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { Radio, Play, Pause, Volume2 } from 'lucide-react';
import { getRadioLabel, getSiteShortName } from '../lib/branding';

export default function WebRadio() {
  const { data: siteInfo } = useFetch('/site-info');
  const [playing, setPlaying] = useState(false);
  const streamUrl = siteInfo?.radio_stream_url;
  const shortName = getSiteShortName(siteInfo || {});

  return (
    <div className="animate-page">
      <PageHeader headerKey="radio" eyebrow="Comunicacao" title={getRadioLabel(siteInfo || {})} subtitle="Ouca nossa programacao com louvor, homilias e reflexoes 24h." />
      <section style={{ padding: '72px 24px', maxWidth: 800, margin: '0 auto' }}>
        <Reveal>
          <div style={{ background: 'var(--navy)', borderRadius: 20, padding: '56px', textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(184,148,90,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '2px solid var(--gold)' }}>
              <Radio size={44} style={{ color: 'var(--gold-light)' }} />
            </div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, color: '#fff', fontWeight: 700, marginBottom: 8 }}>Radio {shortName}</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', marginBottom: 40 }}>Ao vivo</p>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: 40, marginBottom: 40 }}>
              {[12, 24, 36, 48, 36, 24, 36, 48, 24, 12, 24, 36].map((h, i) => (
                <div key={i} style={{ width: 4, height: playing ? h : 4, background: 'var(--gold-light)', borderRadius: 2, transition: 'height .3s', animation: playing ? `pulse ${0.5 + i * 0.1}s ease-in-out infinite alternate` : 'none' }} />
              ))}
            </div>

            {streamUrl ? (
              <button
                onClick={() => setPlaying(!playing)}
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(184,148,90,.5)', transition: 'transform .2s', border: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
              >
                {playing ? <Pause size={28} style={{ color: '#fff' }} /> : <Play size={28} style={{ color: '#fff', marginLeft: 4 }} />}
              </button>
            ) : (
              <div style={{ padding: '16px 32px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14 }}>Stream ainda nao configurado. Configure a URL no painel administrativo.</p>
              </div>
            )}
            {playing && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.5)' }}><Volume2 size={14} />No ar agora</div>}
          </div>
        </Reveal>
      </section>
      <style>{`@keyframes pulse { from { opacity:.3 } to { opacity:1 } }`}</style>
    </div>
  );
}
