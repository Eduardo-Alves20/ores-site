import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { Phone, MapPin, X } from 'lucide-react';
import { normalizeMediaUrl } from '../lib/media';

function CommunityModal({ community, onClose }) {
  if (!community) return null;
  const communityImage = normalizeMediaUrl(community.image_url);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(26,39,68,.62)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="community-modal" style={{ width: '100%', maxWidth: 620, maxHeight: 'calc(100dvh - 72px)', background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '22px 26px', background: 'var(--cream)', borderBottom: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 10, background: '#fff', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(24px,4vw,32px)', color: 'var(--navy)', fontWeight: 700, marginBottom: 6, paddingRight: 42 }}>{community.name}</h2>
          {community.neighborhood && <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{community.neighborhood}</p>}
        </div>
        <div style={{ padding: 26, overflowY: 'auto' }}>
          {communityImage && <img src={communityImage} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }} />}
          {community.description && <RichTextContent html={community.description} style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: 18 }} />}
          <div style={{ display: 'grid', gap: 10 }}>
            {community.neighborhood && <p style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)' }}><MapPin size={14} style={{ color: 'var(--gold)' }} />{community.neighborhood}</p>}
            {community.coordinator_name && <p style={{ fontSize: 13, color: 'var(--text-mid)' }}>Coord.: {community.coordinator_name}</p>}
            {community.coordinator_phone && <p style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)' }}><Phone size={14} style={{ color: 'var(--gold)' }} />{community.coordinator_phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Comunidades() {
  const { data: communities, loading } = useFetch('/communities');
  const [selected, setSelected] = useState(null);

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Comunidades (Setores)" subtitle="Nossa paroquia e formada por diversas comunidades espalhadas pelos bairros da cidade." />
      <section style={{ padding: '72px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {(communities || []).map((c, i) => {
              const communityImage = normalizeMediaUrl(c.image_url);
              return (
                <Reveal key={c.id} delay={i * 60}>
                  <button type="button" onClick={() => setSelected(c)} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform .2s,box-shadow .2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.07)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    {communityImage && <img src={communityImage} alt="" style={{ width: '100%', height: 152, objectFit: 'cover', display: 'block' }} />}
                    <div style={{ padding: '22px 24px' }}>
                      <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>{c.name}</h3>
                      {c.neighborhood && <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-soft)', marginBottom: 8 }}><MapPin size={12} style={{ color: 'var(--gold)' }} />{c.neighborhood}</p>}
                      {c.coordinator_name && <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 6 }}>Coord.: {c.coordinator_name}</p>}
                      {c.coordinator_phone && <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-soft)' }}><Phone size={12} style={{ color: 'var(--gold)' }} />{c.coordinator_phone}</p>}
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <CommunityModal community={selected} onClose={() => setSelected(null)} />
    </div>
  );
}


