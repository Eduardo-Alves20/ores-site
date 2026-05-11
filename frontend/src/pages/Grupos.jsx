import { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { ChevronLeft, ChevronRight, Phone, Clock, MapPin, X } from 'lucide-react';
import { normalizeMediaUrl } from '../lib/media';

function GroupModal({ group, onClose }) {
  if (!group) return null;
  const groupImage = normalizeMediaUrl(group.image_url);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(26,39,68,.62)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="group-modal" style={{ width: '100%', maxWidth: 620, maxHeight: 'calc(100dvh - 72px)', background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '22px 26px', background: 'var(--cream)', borderBottom: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 10, background: '#fff', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(24px,4vw,32px)', color: 'var(--navy)', fontWeight: 700, marginBottom: 6, paddingRight: 42 }}>{group.name}</h2>
          {(group.day_of_week || group.time_value) && <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{group.day_of_week} {group.time_value ? `· ${group.time_value}` : ''}</p>}
        </div>
        <div style={{ padding: 26, overflowY: 'auto' }}>
          {groupImage && <img src={groupImage} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }} />}
          {group.description && <RichTextContent html={group.description} style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: 18 }} />}
          <div style={{ display: 'grid', gap: 10 }}>
            {group.location && <p style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)' }}><MapPin size={14} style={{ color: 'var(--gold)' }} />{group.location}</p>}
            {group.coordinator_phone && <p style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)' }}><Phone size={14} style={{ color: 'var(--gold)' }} />{group.coordinator_phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 4200);
    return () => clearInterval(timer);
  }, [total]);

  useEffect(() => {
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  if (!total) return null;

  const current = slides[index];
  const currentImage = normalizeMediaUrl(current.image_url);

  return (
    <Reveal>
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(24px,3vw,32px)', color: 'var(--navy)', fontWeight: 700 }}>
            Galeria dos Grupos de Oracao
          </h3>
          {total > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => setIndex((prev) => (prev - 1 + total) % total)} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => setIndex((prev) => (prev + 1) % total)} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: '#0f1d3f', position: 'relative' }}>
          {currentImage ? (
            <img className="group-fit-media group-carousel-media" src={currentImage} alt={current.title || 'Slide do grupo de oracao'} onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: 'clamp(260px,38vw,420px)', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 'clamp(260px,38vw,420px)', background: 'linear-gradient(135deg,var(--navy),var(--navy-light))' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,20,42,.14) 0%, rgba(10,20,42,.72) 100%)' }} />
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20 }}>
            {current.title && <h4 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(22px,3vw,34px)', color: '#fff', marginBottom: 6 }}>{current.title}</h4>}
            {current.subtitle && <p style={{ color: 'rgba(255,255,255,.86)', fontSize: 14, maxWidth: 680 }}>{current.subtitle}</p>}
          </div>
        </div>

        {total > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                style={{
                  width: dotIndex === index ? 26 : 9,
                  height: 9,
                  borderRadius: 99,
                  border: 'none',
                  background: dotIndex === index ? 'var(--gold)' : 'rgba(26,39,68,.24)',
                  transition: 'all .2s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

export default function Grupos() {
  const { data: groups, loading } = useFetch('/prayer-groups');
  const { data: slides } = useFetch('/prayer-group-slides');
  const [selected, setSelected] = useState(null);

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Grupos de Oracao" subtitle="Venha crescer na fe com nossos grupos de oracao e adoracao." />
      <section style={{ padding: '72px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
            {(groups || []).map((g, i) => {
              const groupImage = normalizeMediaUrl(g.image_url);
              return (
                <Reveal key={g.id} delay={i * 70}>
                  <button type="button" onClick={() => setSelected(g)} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.03)', transition: 'transform .2s,box-shadow .2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.07)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.03)'; }}>
                    {groupImage && <img src={groupImage} alt="" style={{ width: '100%', height: 152, objectFit: 'cover', display: 'block' }} />}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>{g.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12, color: 'var(--text-soft)' }}>
                        {g.day_of_week && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12} style={{ color: 'var(--gold)' }} />{g.day_of_week} {g.time_value ? `· ${g.time_value}` : ''}</span>}
                        {g.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} style={{ color: 'var(--gold)' }} />{g.location}</span>}
                        {g.coordinator_phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} style={{ color: 'var(--gold)' }} />{g.coordinator_phone}</span>}
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
        <GroupCarousel slides={slides || []} />
      </section>
      <GroupModal group={selected} onClose={() => setSelected(null)} />
      <style>{`
        @media (min-width: 901px) {
          .group-fit-media {
            object-fit: contain !important;
            background: #f2eee7 !important;
          }
          .group-carousel-media {
            background: #0f1d3f !important;
          }
        }
      `}</style>
    </div>
  );
}


