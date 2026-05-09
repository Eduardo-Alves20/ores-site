import { Link } from 'react-router-dom';
import { Mail, Phone, AtSign, Users, Play } from 'lucide-react';
import { getConhecaLabel, getSiteName } from '../lib/branding';
import { getPublicMenuLabels } from '../lib/menuLabels';

export default function Footer({ siteInfo = {} }) {
  const siteName = getSiteName(siteInfo);
  const menuLabels = getPublicMenuLabels(siteInfo);
  const normalizeUrl = (value) => {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };
  const socialLinks = [
    siteInfo.site_instagram && { key: 'instagram', href: normalizeUrl(siteInfo.site_instagram), icon: <AtSign size={14} />, label: 'Instagram' },
    siteInfo.site_facebook && { key: 'facebook', href: normalizeUrl(siteInfo.site_facebook), icon: <Users size={14} />, label: 'Facebook' },
    siteInfo.site_youtube && { key: 'youtube', href: normalizeUrl(siteInfo.site_youtube), icon: <Play size={14} />, label: 'YouTube' },
  ].filter(Boolean);

  return (
    <footer style={{ background: 'var(--navy)', color: '#fff', paddingTop: 64, paddingBottom: 32, marginTop: 96 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✦</div>
              <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 15 }}>{siteName}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>
              {siteInfo.site_address || 'Endereco nao informado'}
            </p>
            {siteInfo.maps_url && (
              <a href={siteInfo.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 500 }}>Como chegar →</a>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Contato</div>
            {siteInfo.site_email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
                <Mail size={14} style={{ color: 'var(--gold-light)', opacity: 0.8 }} />
                {siteInfo.site_email}
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
            {socialLinks.length > 0 && (
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                {socialLinks.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    aria-label={s.label}
                    style={{ width:28, height:28, borderRadius:8, border:'1px solid rgba(255,255,255,.18)', color:'var(--gold-light)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Funcionamento</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 2.1 }}>
              <div>Secretaria: {siteInfo.secretary_hours || 'Seg-Sex 8h-17h30 | Sab 8h-12h'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>Links</div>
            {[
              { label: siteInfo?.menu_public_about || getConhecaLabel(siteInfo), to: '/conheca' },
              { label: 'Horarios de Missa', to: '/conheca' },
              { label: menuLabels.menu_public_groups, to: '/grupos' },
              { label: menuLabels.menu_public_social, to: '/obra-social' },
              { label: menuLabels.menu_public_contact, to: '/contato' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 8, transition: 'color .15s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--gold-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,.55)';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
            © {new Date().getFullYear()} {siteName}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>Diocese</p>
        </div>
      </div>
    </footer>
  );
}
