export default function MassScheduleSidebar({ schedule = [], confessions = [] }) {
  return (
    <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden' }}>
      <div style={{ background:'var(--navy)',padding:'18px 24px' }}>
        <h3 style={{ fontFamily:'Playfair Display,serif',fontSize:17,color:'#fff',fontWeight:600 }}>Horários de Missa</h3>
      </div>
      <div style={{ padding:'4px 0' }}>
        {schedule.map((d, i) => {
          const times = typeof d.times === 'string' ? JSON.parse(d.times) : (d.times || []);
          return (
            <div key={i} style={{ padding:'11px 24px',borderBottom:i<schedule.length-1?'1px solid var(--cream-dark)':'none',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontSize:12,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--gold)',minWidth:36 }}>{d.day_short}</span>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end' }}>
                {times.filter(t => t?.time).map((t, j) => (
                  <span key={j} style={{ fontSize:13,color:'var(--navy)',fontWeight:600 }}>{t.time}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {confessions.length > 0 && (
        <div style={{ padding:'14px 24px',borderTop:'1px solid var(--border)',background:'var(--cream)' }}>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text-soft)',marginBottom:8 }}>Confissões</div>
          <div style={{ fontSize:13,color:'var(--navy)',lineHeight:2 }}>
            {confessions.map((c, i) => <div key={i}>{c.day_name}: {c.times}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
