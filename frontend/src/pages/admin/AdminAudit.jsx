import { useFetch } from '../../hooks/useFetch';

export default function AdminAudit() {
  const { data: logs, loading } = useFetch('/admin/audit-log');
  return (
    <div>
      <h1 style={{ fontFamily:'Montserrat,sans-serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Log de Auditoria</h1>
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-soft)' }}>Carregando...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'var(--cream)', borderBottom:'1px solid var(--border)' }}>
                {['Data/Hora','Usuário','Ação','Tabela','ID'].map(h => <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-soft)', whiteSpace:'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {(logs||[]).length === 0 ? <tr><td colSpan={5} style={{ padding:'32px 16px', textAlign:'center', color:'var(--text-soft)', fontSize:13 }}>Nenhum registro.</td></tr>
                : (logs||[]).map((l, i) => (
                  <tr key={l.id} style={{ borderBottom:'1px solid var(--cream-dark)' }}>
                    <td style={{ padding:'11px 16px', fontSize:12, color:'var(--text-soft)', whiteSpace:'nowrap' }}>{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                    <td style={{ padding:'11px 16px', fontSize:13, color:'var(--navy)', fontWeight:500 }}>{l.admin_name || `#${l.admin_id}`}</td>
                    <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:100, background:l.action.includes('DELETE')?'rgba(239,68,68,.1)':l.action.includes('CREATE')?'rgba(22,163,74,.1)':'rgba(26,39,68,.08)', color:l.action.includes('DELETE')?'#ef4444':l.action.includes('CREATE')?'#16a34a':'var(--navy)' }}>{l.action.replace(/_/g,' ')}</span></td>
                    <td style={{ padding:'11px 16px', fontSize:12, color:'var(--text-soft)' }}>{l.table_name || '-'}</td>
                    <td style={{ padding:'11px 16px', fontSize:12, color:'var(--text-soft)' }}>{l.record_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
