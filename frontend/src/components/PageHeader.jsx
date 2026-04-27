import { useFetch } from '../hooks/useFetch';

const HEADER_KEYS = {
  'Conheca a Paroquia': 'conheca',
  'Conheça a Paróquia': 'conheca',
  'Conheça a PES': 'conheca',
  'Obra Social': 'obra_social',
  'Quero ser Voluntario': 'voluntario',
  'Quero ser Voluntário': 'voluntario',
  'Noticias': 'news',
  'Notícias': 'news',
  'Web Radio': 'radio',
  'Web Rádio': 'radio',
  'Web Rádio PES': 'radio',
  'Homilias e Reflexoes': 'homilies',
  'Homilias e Reflexões': 'homilies',
  Contato: 'contact',
  'Padres e Diaconos': 'priests',
  'Padres e Diáconos': 'priests',
  Instalacoes: 'facilities',
  'Instalações': 'facilities',
  'Calendario de Eventos': 'calendar',
  'Calendário de Eventos': 'calendar',
  'Agendamento de Salas': 'rooms',
  'Grupos de Oracao': 'groups',
  'Grupos de Oração': 'groups',
  'Pastorais e Movimentos': 'pastorals',
  'Comunidades (Setores)': 'communities',
};

export default function PageHeader({ eyebrow, title, subtitle, headerKey, children }) {
  const { data } = useFetch('/site-info');
  const prefix = headerKey || HEADER_KEYS[title];
  const e = prefix ? data?.[`${prefix}_eyebrow`] || eyebrow : eyebrow;
  const t = prefix ? data?.[`${prefix}_title`] || title : title;
  const s = prefix ? data?.[`${prefix}_subtitle`] || subtitle : subtitle;
  const image = prefix ? data?.[`${prefix}_image_url`] : null;

  return (
    <div style={{ background: '#111', padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
      {image ? (
        <>
          <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.52),rgba(0,0,0,.68))' }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#2a2a2a,#161616)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%,rgba(184,148,90,.22) 0%,transparent 58%)' }} />
      <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,.08)' }} />
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        {e && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 16 }}>{e}</div>}
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(30px,5vw,52px)', fontWeight: 700, color: '#fff', marginBottom: s ? 16 : 0 }}>{t}</h1>
        {s && <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>{s}</p>}
        {children}
      </div>
    </div>
  );
}
