import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import MassScheduleSidebar from '../components/MassScheduleSidebar';
import { getConhecaLabel, getSiteName } from '../lib/branding';

const CARDS = [
  { label: 'Padres e Diaconos', to: '/padres', icon: '✝️', desc: 'Conheca os sacerdotes e diaconos que nos servem.' },
  { label: 'Instalacoes', to: '/instalacoes', icon: '⛪', desc: 'Espacos disponiveis para a comunidade.' },
  { label: 'Calendario', to: '/calendario', icon: '📅', desc: 'Eventos e celebracoes da paroquia.' },
  { label: 'Agendamento de Salas', to: '/salas', icon: '🏠', desc: 'Reserve espacos para atividades pastorais.' },
];

export default function Conheca() {
  const { data: massData } = useFetch('/mass-schedule');
  const { data: siteInfo } = useFetch('/site-info');
  const s = siteInfo || {};
  const siteName = getSiteName(s);
  const schedule = massData?.schedule || [];
  const confessions = massData?.confessions || [];

  return (
    <div className="animate-page">
      <PageHeader
        headerKey="conheca"
        eyebrow={s.conheca_eyebrow || 'Paroquia'}
        title={s.conheca_title || getConhecaLabel(s)}
        subtitle={s.conheca_subtitle || `Tudo sobre a ${siteName}.`}
      />
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          <div>
            <Reveal>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '32px', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>{s.conheca_history_title || 'Nossa Historia'}</h2>
                <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: 16 }}>
                  {s.conheca_history_text_1 || `A ${siteName} serve a comunidade com fe, caridade e evangelizacao.`}
                </p>
                <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.75 }}>
                  {s.conheca_history_text_2 || 'Nossa missao e evangelizar, celebrar os sacramentos e promover o desenvolvimento integral da pessoa humana.'}
                </p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
              {CARDS.map((card, i) => (
                <Reveal key={card.label} delay={i * 60}>
                  <Link
                    to={card.to}
                    style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '24px', display: 'block', transition: 'transform .2s,box-shadow .2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.07)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{card.desc}</div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal delay={100}>
              <MassScheduleSidebar schedule={schedule} confessions={confessions} />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
