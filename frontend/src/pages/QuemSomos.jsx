import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';

const CARDS = [
  { label: 'Unidades Regionais', to: '/regionais', icon: '🏢', desc: 'Conheça nossas unidades em diferentes regiões do RJ.' },
  { label: 'Projetos', to: '/projetos', icon: '📋', desc: 'Iniciativas e projetos que desenvolvemos.' },
  { label: 'Espaço ORES', to: '/espaco-ores', icon: '🏠', desc: 'Nossos espaços de atendimento e convivência.' },
  { label: 'Voluntariado', to: '/voluntario', icon: '🤝', desc: 'Junte-se a nós e faça a diferença.' },
];

export default function QuemSomos() {
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};

  return (
    <div className="animate-page">
      <PageHeader
        headerKey="quem_somos"
        eyebrow={s.quem_somos_eyebrow || 'Sobre a ORES'}
        title={s.quem_somos_title || 'Quem Somos'}
        subtitle={s.quem_somos_subtitle || 'Conheça nossa história, missão e valores.'}
        imageUrl={s.quem_somos_image_url}
      />
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '40px', marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>
                {s.quem_somos_history_title || 'Nossa História'}
              </h2>
              <RichTextContent
                html={s.quem_somos_history_text_1}
                fallback="A ORES — Organização de Reintegração e Estímulo à Socialização — é uma entidade sem fins lucrativos dedicada à reintegração social de pessoas em situação de vulnerabilidade."
                style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 18 }}
              />
              <RichTextContent
                html={s.quem_somos_history_text_2}
                fallback="Com unidades em diferentes regiões do Rio de Janeiro, desenvolvemos projetos, programas e cursos que promovem dignidade humana, autonomia e reinserção social."
                style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.8 }}
              />
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
            {CARDS.map((card, i) => (
              <Reveal key={card.label} delay={i * 60}>
                <Link to={card.to}
                  style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '28px', display: 'block', transition: 'transform .2s,box-shadow .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,45,94,.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ fontSize: 34, marginBottom: 14 }}>{card.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.5 }}>{card.desc}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
