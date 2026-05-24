import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import ResponsiveImage from '../components/ResponsiveImage';
import { MapPin, Phone, Calendar, Clock } from 'lucide-react';

export default function Projetos() {
  const { data: projetos, loading } = useFetch('/projetos');
  const { data: slides } = useFetch('/projeto-slides');
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  const list = projetos || [];
  const slideList = slides || [];

  const byCategory = list.reduce((acc, p) => {
    const cat = p.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="animate-page">
      {slideList.length > 0 && (
        <PageHeader
          headerKey="projetos"
          eyebrow={s.projetos_eyebrow || 'Iniciativas'}
          title={s.projetos_title || 'Nossos Projetos'}
          subtitle={s.projetos_subtitle || 'Conheça as iniciativas que transformam realidades.'}
          imageUrl={slideList[0]?.image_url || s.projetos_image_url}
        />
      )}
      {slideList.length === 0 && (
        <PageHeader
          headerKey="projetos"
          eyebrow={s.projetos_eyebrow || 'Iniciativas'}
          title={s.projetos_title || 'Nossos Projetos'}
          subtitle={s.projetos_subtitle || 'Conheça as iniciativas que transformam realidades.'}
          imageUrl={s.projetos_image_url}
        />
      )}

      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {loading && <p style={{ color: 'var(--text-soft)', textAlign: 'center' }}>Carregando...</p>}
          {!loading && list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-soft)' }}>
              <p>Os projetos serão exibidos aqui em breve.</p>
            </div>
          )}
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 56 }}>
              {Object.keys(byCategory).length > 1 && (
                <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 24, paddingBottom: 10, borderBottom: '2px solid var(--cream-dark)' }}>
                  {cat}
                </h2>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
                {items.map((proj, i) => (
                  <Reveal key={proj.id} delay={i * 70}>
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', transition: 'box-shadow .2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(13,45,94,.09)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                      {proj.image_url && (
                        <ResponsiveImage src={proj.image_url} kind="card" alt={proj.name}
                          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                      )}
                      <div style={{ padding: '28px' }}>
                        <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
                          {proj.name}
                        </h3>
                        {proj.description && (
                          <RichTextContent html={proj.description}
                            style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 16 }} />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {proj.location && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-soft)' }}>
                              <MapPin size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--gold)' }} />
                              <span>{proj.location}{proj.address ? ` — ${proj.address}` : ''}</span>
                            </div>
                          )}
                          {proj.meeting_day && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-soft)' }}>
                              <Calendar size={14} style={{ flexShrink: 0, color: 'var(--gold)' }} />
                              <span>{proj.meeting_day}</span>
                            </div>
                          )}
                          {proj.meeting_time && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-soft)' }}>
                              <Clock size={14} style={{ flexShrink: 0, color: 'var(--gold)' }} />
                              <span>{proj.meeting_time}</span>
                            </div>
                          )}
                          {proj.coordinator && (
                            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 4 }}>
                              Responsável: <strong style={{ color: 'var(--text-mid)' }}>{proj.coordinator}</strong>
                              {proj.phone && <span> · {proj.phone}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
