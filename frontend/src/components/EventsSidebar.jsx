import { Link } from 'react-router-dom';

const MONTHS_PT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

export default function EventsSidebar({ events = [], max = 3 }) {
  return (
    <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden' }}>
      <div style={{ background:'var(--navy)',padding:'18px 24px' }}>
        <h3 style={{ fontFamily:'Playfair Display,serif',fontSize:17,color:'#fff',fontWeight:600 }}>Próximos Eventos</h3>
      </div>
      {events.slice(0, max).map((ev, i) => {
        const d = new Date(ev.event_date + 'T12:00:00');
        const day = String(d.getDate()).padStart(2,'0');
        const month = MONTHS_PT[d.getMonth()];
        const time = ev.start_time ? ev.start_time.slice(0,5) : '';
        return (
          <div key={i} style={{ padding:'14px 20px',borderBottom:'1px solid var(--cream-dark)',display:'flex',gap:14,alignItems:'flex-start' }}>
            <div style={{ textAlign:'center',minWidth:40,paddingTop:2 }}>
              <div style={{ fontSize:20,fontWeight:700,color:'var(--navy)',fontFamily:'Playfair Display,serif',lineHeight:1 }}>{day}</div>
              <div style={{ fontSize:9,fontWeight:700,letterSpacing:'0.1em',color:'var(--gold)',textTransform:'uppercase' }}>{month}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600,fontSize:13,color:'var(--navy)',marginBottom:3,lineHeight:1.3 }}>{ev.title}</div>
              <div style={{ fontSize:11,color:'var(--text-soft)' }}>{time && `${time}h`}{time && ev.location && ' · '}{ev.location}</div>
            </div>
          </div>
        );
      })}
      <div style={{ padding:'12px 20px' }}>
        <Link to="/calendario" style={{ fontSize:13,color:'var(--gold)',fontWeight:600 }}>Ver calendário completo →</Link>
      </div>
    </div>
  );
}
