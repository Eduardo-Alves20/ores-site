import { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { normalizeMediaUrl } from '../lib/media';
import RichTextContent from './RichTextContent';

const HEADER_KEYS = {
  'Quem Somos': 'quem_somos',
  'Quero ser Voluntario': 'voluntario',
  'Quero ser Voluntário': 'voluntario',
  Voluntariado: 'voluntario',
  'Noticias': 'news',
  'Notícias': 'news',
  Contato: 'contact',
  'Espaco ORES': 'espaco_ores',
  'Espaço ORES': 'espaco_ores',
  'Unidades Regionais': 'regionais',
  'Projetos': 'projetos',
  'Projetos e Iniciativas': 'projetos',
  'Programas Sociais': 'programas',
  'Calendario de Eventos': 'calendar',
  'Calendário de Eventos': 'calendar',
};

export default function PageHeader({ eyebrow, title, subtitle, headerKey, imageUrl, children }) {
  const { data } = useFetch('/site-info');
  const prefix = headerKey || HEADER_KEYS[title];
  const e = prefix ? data?.[`${prefix}_eyebrow`] || eyebrow : eyebrow;
  const t = prefix ? data?.[`${prefix}_title`] || title : title;
  const s = prefix ? data?.[`${prefix}_subtitle`] || subtitle : subtitle;
  const image = normalizeMediaUrl(imageUrl || (prefix ? data?.[`${prefix}_image_url`] : null));
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = image && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
    <div className="page-header" style={{ background: '#111', padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
      {showImage ? (
        <>
          <img
            src={image}
            alt=""
            onError={() => setImageFailed(true)}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px)', transform: 'scale(1.08)', opacity: 0.55 }}
          />
          <img
            src={image}
            alt=""
            onError={() => setImageFailed(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center center', opacity: 1 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.12))' }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#2a2a2a,#161616)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%,rgba(25,118,210,.06) 0%,transparent 58%)' }} />
      <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,.03)' }} />
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,.025)' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        {e && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 16 }}>{e}</div>}
        <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(30px,5vw,52px)', fontWeight: 700, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,.38)', marginBottom: s ? 16 : 0 }}>{t}</h1>
        {s && (
          <RichTextContent
            html={s}
            dark
            style={{ fontSize: 16, color: 'rgba(255,255,255,.85)', textShadow: '0 1px 8px rgba(0,0,0,.34)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}
          />
        )}
        {children}
      </div>
      <style>{`
        @media (max-width: 700px) {
          .page-header {
            padding: 72px 20px 58px !important;
            min-height: 224px;
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
