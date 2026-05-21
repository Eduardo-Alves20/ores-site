import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { Link } from 'react-router-dom';

export default function EspacoORES() {
  const { data: facilities, loading } = useFetch('/facilities');
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  const list = facilities || [];

  return (
    <div className="animate-page">
      <PageHeader
        headerKey="espaco_ores"
        eyebrow={s.espaco_ores_eyebrow || 'Espaço ORES'}
        title={s.espaco_ores_title || 'Espaço ORES'}
        subtitle={s.espaco_ores_subtitle || 'Conheça nossos espaços de atendimento e convivência.'}
        imageUrl={s.espaco_ores_image_url}
      />

      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {loading && <p style={{ color: 'var(--text-soft)', textAlign: 'center' }}>Carregando...</p>}

          {list.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20, marginBottom: 56 }}>
              {list.map((item, i) => (
                <Reveal key={item.id} delay={i * 60}>
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '28px', transition: 'box-shadow .2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(13,45,94,.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                    {item.icon && <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>}
                    <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <RichTextContent html={item.description}
                        style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 12 }} />
                    )}
                    {item.capacity && (
                      <span style={{ display: 'inline-block', background: 'var(--cream-dark)', color: 'var(--navy)', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
                        Capacidade: {item.capacity} pessoas
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <div style={{ background: 'var(--navy)', borderRadius: 20, padding: '48px', textAlign: 'center', color: '#fff' }}>
              <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 14 }}>
                Precisa de informações sobre o Espaço ORES?
              </h2>
              <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
                Entre em contato conosco para saber mais sobre o uso dos nossos espaços e programas disponíveis.
              </p>
              <Link to="/contato"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 10, transition: 'opacity .2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Fale Conosco
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
