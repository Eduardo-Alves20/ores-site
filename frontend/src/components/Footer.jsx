import { Link } from 'react-router-dom';
import { Mail, Phone, AtSign, Users, Play, MapPin } from 'lucide-react';
import { getSiteName, getSiteTagline } from '../lib/branding';

export default function Footer({ siteInfo = {} }) {
  const siteName = getSiteName(siteInfo);
  const tagline = getSiteTagline(siteInfo);
  const normalizeUrl = (value) => {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };
  const socialLinks = [
    siteInfo.site_instagram && { key: 'instagram', href: normalizeUrl(siteInfo.site_instagram), icon: <AtSign size={14} />, label: 'Instagram' },
    siteInfo.site_facebook && { key: 'facebook', href: normalizeUrl(siteInfo.site_facebook), icon: <Users size={14} />, label: 'Facebook' },
    siteInfo.site_youtube && { key: 'youtube', href: normalizeUrl(siteInfo.site_youtube), icon: <Play size={14} />, label: 'YouTube' },
  ].filter(Boolean);

  const quickLinks = [
    { label: 'Quem Somos', to: '/quem-somos' },
    { label: 'Unidades Regionais', to: '/regionais' },
    { label: 'Projetos', to: '/projetos' },
    { label: 'Espaço ORES', to: '/espaco-ores' },
    { label: 'Programas Sociais', to: '/programas' },
    { label: 'Cursos', to: '/cursos' },
    { label: 'Contato', to: '/contato' },
  ];

  return (
    <footer style={{ background: 'var(--navy)', color: '#fff', paddingTop: 64, paddingBottom: 32, marginTop: 96 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: '#fff', flexShrink: 0 }}>O</div>
              <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 15 }}>{siteName}</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>
              {tagline}
            </p>
            {siteInfo.site_address && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>
                <MapPin size={13} style={{ flexShrink: 0, marginTop: 2, color: 'var(--gold-light)', opacity: 0.8 }} />
                <span>{siteInfo.site_address}</span>
              </div>
            )}
            {siteInfo.maps_url && (
              <a href={siteInfo.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 500 }}>
                Como chegar →
              </a>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Contato</div>
            {siteInfo.site_email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
                <Mail size={14} style={{ color: 'var(--gold-light)', opacity: 0.8 }} />
                <a href={`mailto:${siteInfo.site_email}`} style={{ color: 'inherit' }}>{siteInfo.site_email}</a>
              </div>
            )}
            {siteInfo.site_whatsapp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
                <Phone size={14} style={{ color: 'var(--gold-light)', opacity: 0.8 }} />
                {siteInfo.site_whatsapp}
              </div>
            )}
            {siteInfo.site_phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
                <Phone size={14} style={{ color: 'var(--gold-light)', opacity: 0.8 }} />
                {siteInfo.site_phone}
              </div>
            )}
            {siteInfo.secretary_hours && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 10, lineHeight: 1.7 }}>
                {siteInfo.secretary_hours}
              </div>
            )}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {socialLinks.map((sl) => (
                  <a key={sl.key} href={sl.href} target="_blank" rel="noopener noreferrer"
                    title={sl.label} aria-label={sl.label}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,.18)', color: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sl.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Links Rápidos</div>
            {quickLinks.map((link) => (
              <Link key={link.label} to={link.to}
                style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 10, transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,.55)'; }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
            © {new Date().getFullYear()} {siteName} — Todos os direitos reservados
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>ores.org.br</p>
        </div>
      </div>
    </footer>
  );
}
