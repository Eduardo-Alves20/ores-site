export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div style={{ background:'var(--navy)',padding:'96px 24px 80px',position:'relative',overflow:'hidden' }}>
      <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 110%,rgba(184,148,90,.12) 0%,transparent 55%)' }} />
      <div style={{ position:'absolute',top:-80,right:-80,width:300,height:300,borderRadius:'50%',border:'1px solid rgba(184,148,90,.08)' }} />
      <div style={{ position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',border:'1px solid rgba(184,148,90,.06)' }} />
      <div style={{ maxWidth:1200,margin:'0 auto',position:'relative',textAlign:'center' }}>
        {eyebrow && <div style={{ fontSize:11,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--gold-light)',marginBottom:16 }}>{eyebrow}</div>}
        <h1 style={{ fontFamily:'Playfair Display,serif',fontSize:'clamp(30px,5vw,52px)',fontWeight:700,color:'#fff',marginBottom:subtitle?16:0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:16,color:'rgba(255,255,255,.62)',lineHeight:1.7,maxWidth:600,margin:'0 auto' }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
