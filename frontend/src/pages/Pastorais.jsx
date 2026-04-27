import { useEffect, useMemo, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { ChevronLeft, ChevronRight, Clock, MapPin, Search, X } from 'lucide-react';
import { normalizeMediaUrl } from '../lib/media';

function mediaFallback(name) {
  return (
    <div
      style={{
        height: 132,
        background: 'linear-gradient(135deg,var(--navy),var(--navy-light))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,.35)',
        fontFamily: 'Playfair Display,serif',
        fontSize: 28,
        fontWeight: 700,
      }}
    >
      {name?.slice(0, 1) || 'P'}
    </div>
  );
}

function PastoralModal({ pastoral, onClose }) {
  if (!pastoral) return null;
  const time = [pastoral.meeting_day, pastoral.meeting_time].filter(Boolean).join(', ');
  const hasMap = Boolean(pastoral.map_url);
  const pastoralImage = normalizeMediaUrl(pastoral.image_url);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(26,39,68,.62)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        className="pastoral-modal"
        style={{ width: '100%', maxWidth: 620, maxHeight: 'calc(100dvh - 72px)', background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '22px 26px', background: 'var(--cream)', borderBottom: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 10, background: '#fff', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{pastoral.category || 'Pastoral'}</div>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(24px,4vw,32px)', color: 'var(--navy)', fontWeight: 700, marginBottom: 6, paddingRight: 42 }}>{pastoral.name}</h2>
          {pastoral.coordinator && <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>Coord.: {pastoral.coordinator}</p>}
        </div>

        <div style={{ padding: 26, overflowY: 'auto' }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 18, background: 'var(--cream)' }}>
            {hasMap ? (
              <iframe title={`Mapa ${pastoral.name}`} src={pastoral.map_url} style={{ width: '100%', height: 180, border: 0, display: 'block' }} loading="lazy" />
            ) : pastoralImage ? (
              <img className="pastoral-fit-media" src={pastoralImage} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
            ) : mediaFallback(pastoral.name)}
          </div>

          {pastoral.description && <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: 18 }}>{pastoral.description}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', background: 'var(--cream)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Endereco</div>
              <div style={{ fontSize: 14, color: 'var(--navy)', lineHeight: 1.6 }}>{pastoral.address || pastoral.location || 'Nao informado'}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', background: 'var(--cream)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Horarios</div>
              <div style={{ fontSize: 14, color: 'var(--navy)', lineHeight: 1.6 }}>{time || 'Nao informado'}</div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Telefone</div>
              <div style={{ fontSize: 14, color: 'var(--navy)' }}>{pastoral.phone || 'Nao informado'}</div>
            </div>
            {pastoral.phone && (
              <a href={`https://wa.me/${pastoral.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ padding: '10px 22px', borderRadius: 100, background: 'var(--gold)', color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                Contato
              </a>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) {
          .pastoral-modal { max-height: calc(100dvh - 28px) !important; }
          .pastoral-modal [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function PastoralCarousel({ slides }) {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(24px,3vw,32px)', color: 'var(--navy)', fontWeight: 700 }}>
            Galeria das Pastorais
          </h3>
          {total > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setIndex((prev) => (prev - 1 + total) % total)} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setIndex((prev) => (prev + 1) % total)} style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: '#0f1d3f', position: 'relative' }}>
          {currentImage ? (
            <img className="pastoral-fit-media pastoral-carousel-media" src={currentImage} alt={current.title || 'Slide da pastoral'} onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: 'clamp(260px,38vw,420px)', objectFit: 'cover', display: 'block' }} />
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

export default function Pastorais() {
  const { data: pastorals, loading } = useFetch('/pastorals');
  const { data: slides } = useFetch('/pastoral-slides');
  const [activeTab, setActiveTab] = useState('Todos');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const all = pastorals || [];
  const categories = useMemo(() => ['Todos', ...new Set(all.map((p) => p.category).filter(Boolean))], [all]);
  const filtered = (activeTab === 'Todos' ? all : all.filter((p) => p.category === activeTab)).filter((p) =>
    [p.name, p.category, p.location, p.address, p.coordinator].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="animate-page">
      <PageHeader eyebrow="Comunidade" title="Pastorais e Movimentos" subtitle="Conheca os grupos pastorais e movimentos que atuam em nossa paroquia." />
      <section style={{ padding: '72px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveTab(cat)} style={{ padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, border: '1.5px solid', borderColor: activeTab === cat ? 'var(--gold)' : 'var(--border)', background: activeTab === cat ? 'var(--gold)' : '#fff', color: activeTab === cat ? '#fff' : 'var(--text-mid)', transition: 'all .2s' }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou local..." style={{ width: '100%', padding: '11px 16px 11px 38px', borderRadius: 100, border: '1px solid var(--border)', background: '#fff', fontSize: 13, outline: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.04)' }} />
            </div>
          </div>
        </Reveal>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 22 }}>
            {filtered.map((p, i) => {
              const time = [p.meeting_day, p.meeting_time].filter(Boolean).join(', ');
              const pastoralThumb = normalizeMediaUrl(p.image_url);
              return (
                <Reveal key={p.id} delay={i * 50}>
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,.04)', transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 14px 34px rgba(26,39,68,.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.04)';
                    }}
                  >
                    {pastoralThumb ? <img className="pastoral-fit-media pastoral-card-media" src={pastoralThumb} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: 132, objectFit: 'cover', display: 'block' }} /> : mediaFallback(p.name)}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                        <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 19, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.25 }}>{p.name}</h3>
                        {p.category && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(184,148,90,.1)', padding: '3px 8px', borderRadius: 100, flexShrink: 0 }}>{p.category}</span>}
                      </div>
                      {p.address || p.location ? (
                        <p style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 8 }}>
                          <MapPin size={13} style={{ color: 'var(--gold)' }} />
                          {p.address || p.location}
                        </p>
                      ) : null}
                      {time && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 8 }}>
                          <Clock size={13} style={{ color: 'var(--gold)' }} />
                          {time}
                        </p>
                      )}
                      {p.coordinator && <p style={{ fontSize: 12.5, color: 'var(--text-soft)', marginTop: 14 }}>Coord.: {p.coordinator}</p>}
                      <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>Ver detalhes →</div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}

        <PastoralCarousel slides={slides || []} />
      </section>
      <PastoralModal pastoral={selected} onClose={() => setSelected(null)} />
      <style>{`
        @media (min-width: 901px) {
          .pastoral-fit-media {
            object-fit: contain !important;
            background: #f2eee7 !important;
          }
          .pastoral-card-media {
            height: 168px !important;
          }
          .pastoral-carousel-media {
            background: #0f1d3f !important;
          }
        }
      `}</style>
    </div>
  );
}
