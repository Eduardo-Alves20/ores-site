import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import ResponsiveImage from '../components/ResponsiveImage';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Regionais() {
  const { data: regionais, loading } = useFetch('/regionais');
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  const list = regionais || [];

  return (
    <div className="animate-page">
      <PageHeader
        headerKey="regionais"
        eyebrow={s.regionais_eyebrow || 'Nossa Presença'}
        title={s.regionais_title || 'Unidades Regionais'}
        subtitle={s.regionais_subtitle || 'A ORES está presente em diferentes regiões do Rio de Janeiro.'}
        imageUrl={s.regionais_image_url || s.regionais_page_image_url}
      />

      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {loading && <p style={{ color: 'var(--text-soft)', textAlign: 'center' }}>Carregando...</p>}
          {!loading && list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-soft)' }}>
              <p>As informações das unidades regionais serão exibidas aqui em breve.</p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
            {list.map((unit, i) => (
              <Reveal key={unit.id} delay={i * 80}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', transition: 'box-shadow .2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(13,45,94,.09)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  {unit.image_url && (
                    <ResponsiveImage src={unit.image_url} kind="card" alt={unit.name}
                      style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ background: 'var(--cream-dark)', color: 'var(--navy)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {unit.state || 'RJ'}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
                      {unit.name}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 16 }}>{unit.city}</p>
                    {unit.description && (
                      <RichTextContent html={unit.description}
                        style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 18 }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {unit.address && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-mid)' }}>
                          <MapPin size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--gold)' }} />
                          <span>{unit.address}</span>
                        </div>
                      )}
                      {unit.phone && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-mid)' }}>
                          <Phone size={14} style={{ flexShrink: 0, color: 'var(--gold)' }} />
                          <a href={`tel:${unit.phone}`} style={{ color: 'inherit' }}>{unit.phone}</a>
                        </div>
                      )}
                      {unit.email && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-mid)' }}>
                          <Mail size={14} style={{ flexShrink: 0, color: 'var(--gold)' }} />
                          <a href={`mailto:${unit.email}`} style={{ color: 'inherit' }}>{unit.email}</a>
                        </div>
                      )}
                      {unit.maps_url && (
                        <a href={unit.maps_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
                          Ver no mapa <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {unit.coordinator && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-soft)' }}>
                        Coordenação: <strong style={{ color: 'var(--text-mid)' }}>{unit.coordinator}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
