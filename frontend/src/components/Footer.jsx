import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

export default function Footer({ siteInfo = {} }) {
  return (
    <footer style={{ background:'var(--navy)',color:'#fff',paddingTop:64,paddingBottom:32,marginTop:96 }}>
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 24px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:48,marginBottom:48 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
              <div style={{ width:30,height:30,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>✦</div>
              <span style={{ fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:15 }}>Paróquia Espírito Santo</span>
            </div>
            <p style={{ fontSize:13,lineHeight:1.9,color:'rgba(255,255,255,.55)',marginBottom:16 }}>
              {siteInfo.site_address || 'Av. Cassiopéia, 461 — Jardim Satélite\nSão José dos Campos/SP — 12230-011'}
            </p>
            {siteInfo.maps_url && (
              <a href={siteInfo.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:13,color:'var(--gold-light)',fontWeight:500 }}>Como chegar →</a>
            )}
          </div>

          <div>
            <div style={{ fontWeight:700,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,.35)',marginBottom:16 }}>Contato</div>
            {siteInfo.site_email && (
              <div style={{ display:'flex',alignItems:'center',gap:9,fontSize:13,color:'rgba(255,255,255,.65)',marginBottom:10 }}>
                <Mail size={14} style={{ color:'var(--gold-light)',opacity:.8 }} />
                {siteInfo.site_email}
              </div>
            )}
            {siteInfo.site_whatsapp && (
              <div style={{ display:'flex',alignItems:'center',gap:9,fontSize:13,color:'rgba(255,255,255,.65)',marginBottom:10 }}>
                <Phone size={14} style={{ color:'var(--gold-light)',opacity:.8 }} />
                {siteInfo.site_whatsapp}
              </div>
            )}
            {siteInfo.site_phone && (
              <div style={{ display:'flex',alignItems:'center',gap:9,fontSize:13,color:'rgba(255,255,255,.65)',marginBottom:10 }}>
                <Phone size={14} style={{ color:'var(--gold-light)',opacity:.8 }} />
                {siteInfo.site_phone}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight:700,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,.35)',marginBottom:16 }}>Funcionamento</div>
            <div style={{ fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:2.1 }}>
              <div>Secretaria: {siteInfo.secretary_hours || 'Seg–Sex 8h–17h30 | Sáb 8h–12h'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight:700,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,.35)',marginBottom:16 }}>Links</div>
            {[
              { label:'Conheça a PES', to:'/conheca' },
              { label:'Horários de Missa', to:'/conheca' },
              { label:'Grupos de Oração', to:'/grupos' },
              { label:'Obra Social', to:'/obra-social' },
              { label:'Contato', to:'/contato' },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ display:'block',fontSize:13,color:'rgba(255,255,255,.55)',marginBottom:8,transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--gold-light)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.55)'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
          <p style={{ fontSize:12,color:'rgba(255,255,255,.35)' }}>
            © {new Date().getFullYear()} Paróquia Espírito Santo · São José dos Campos/SP
          </p>
          <p style={{ fontSize:12,color:'rgba(255,255,255,.25)' }}>Diocese de São José dos Campos</p>
        </div>
      </div>
    </footer>
  );
}
