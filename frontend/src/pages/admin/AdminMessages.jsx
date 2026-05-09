import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { Trash2 } from 'lucide-react';
import { useAppAlert } from '../../components/AppAlert';

const BR_TZ = 'America/Sao_Paulo';
const formatDate = (value) => new Date(value).toLocaleDateString('pt-BR', { timeZone: BR_TZ });
const formatDateTime = (value) => new Date(value).toLocaleString('pt-BR', { timeZone: BR_TZ });

export default function AdminMessages() {
  const { data: messages, loading, refetch } = useFetch('/admin/messages');
  const { notify, confirm } = useAppAlert();
  const [selected, setSelected] = useState(null);

  const markRead = async (id) => {
    await api.put(`/admin/messages/${id}/read`);
    refetch();
  };

  const del = async (id) => {
    const ok = await confirm({ title:'Excluir mensagem?', message:'A mensagem será removida definitivamente.', confirmText:'Excluir' });
    if (!ok) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      setSelected(null);
      notify({ type:'success', title:'Mensagem excluída', message:'A mensagem foi removida.' });
      refetch();
    } catch {
      notify({ type:'error', title:'Erro ao excluir', message:'Não consegui excluir a mensagem agora.' });
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:24 }}>Mensagens de Contato</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
          {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-soft)' }}>Carregando...</div> : (
            (messages||[]).length === 0
              ? <div style={{ padding:32, textAlign:'center', color:'var(--text-soft)', fontSize:13 }}>Nenhuma mensagem.</div>
              : (messages||[]).map((m, i) => (
                <button key={m.id} onClick={() => { setSelected(m); if (!m.read_at) markRead(m.id); }} style={{ display:'block', width:'100%', textAlign:'left', padding:'14px 20px', borderBottom:i<messages.length-1?'1px solid var(--cream-dark)':'none', background:selected?.id===m.id?'var(--cream)':'transparent', transition:'background .15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontWeight:600, fontSize:13, color:'var(--navy)' }}>{m.name}</span>
                    {!m.read_at && <span style={{ fontSize:9, background:'#ef4444', color:'#fff', padding:'2px 6px', borderRadius:100, fontWeight:700 }}>NOVO</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-soft)', marginBottom:2 }}>{m.subject || '(Sem assunto)'}</div>
                  <div style={{ fontSize:11, color:'var(--text-soft)' }}>{m.email} · {formatDate(m.created_at)}</div>
                </button>
              ))
          )}
        </div>

        {selected ? (
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>{selected.name}</h3>
                <div style={{ fontSize:12, color:'var(--text-soft)' }}>{selected.email}{selected.phone && ` · ${selected.phone}`}</div>
              </div>
              <button onClick={() => del(selected.id)} style={{ color:'#ef4444', padding:'4px 8px', borderRadius:6 }}><Trash2 size={16}/></button>
            </div>
            {selected.subject && <div style={{ fontSize:13, fontWeight:600, color:'var(--navy)', marginBottom:12 }}>Assunto: {selected.subject}</div>}
            <div style={{ fontSize:14, color:'var(--text-mid)', lineHeight:1.7, background:'var(--cream)', borderRadius:8, padding:16 }}>{selected.message}</div>
            <div style={{ fontSize:11, color:'var(--text-soft)', marginTop:12 }}>Recebido em {formatDateTime(selected.created_at)}</div>
          </div>
        ) : (
          <div style={{ background:'var(--cream)', borderRadius:12, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
            <p style={{ color:'var(--text-soft)', fontSize:14 }}>Selecione uma mensagem para ler.</p>
          </div>
        )}
      </div>
    </div>
  );
}
