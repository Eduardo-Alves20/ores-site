import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Trash2, Plus, X, Check } from 'lucide-react';
import { useAppAlert } from '../../components/AppAlert';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { notify, confirm } = useAppAlert();
  const { data: users, loading, refetch } = useFetch('/admin/users');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'editor' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/admin/users', form);
      setModal(false);
      notify({ type:'success', title:'Usuário criado', message:'O acesso administrativo foi cadastrado.' });
      refetch();
    }
    catch (err) {
      const message = err.response?.data?.error || 'Erro ao criar.';
      setError(message);
      notify({ type:'error', title:'Erro ao criar usuário', message });
    }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    const ok = await confirm({ title:'Excluir usuário?', message:'Esse acesso será removido do painel administrativo.', confirmText:'Excluir' });
    if (!ok) return;
    try {
      await api.delete(`/admin/users/${id}`);
      notify({ type:'success', title:'Usuário excluído', message:'O acesso foi removido.' });
      refetch();
    } catch (err) {
      notify({ type:'error', title:'Erro ao excluir', message:err.response?.data?.error || 'Não consegui excluir este usuário agora.' });
    }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)' }}>Usuários Administrativos</h1>
        <button onClick={() => { setModal(true); setForm({ name:'', email:'', password:'', role:'editor' }); setError(''); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:13 }}>
          <Plus size={16}/> Novo usuário
        </button>
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'var(--cream)', borderBottom:'1px solid var(--border)' }}>
            {['Nome','E-mail','Papel','Último acesso',''].map(h => <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-soft)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'var(--text-soft)' }}>Carregando...</td></tr>
            : (users||[]).map(u => (
              <tr key={u.id} style={{ borderBottom:'1px solid var(--cream-dark)' }}>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--navy)', fontWeight:600 }}>{u.name} {u.id===me?.id && <span style={{ fontSize:10, color:'var(--gold)', marginLeft:4 }}>(você)</span>}</td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-mid)' }}>{u.email}</td>
                <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:100, background:u.role==='super_admin'?'rgba(184,148,90,.15)':'rgba(26,39,68,.08)', color:u.role==='super_admin'?'var(--gold)':'var(--navy)' }}>{u.role}</span></td>
                <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-soft)' }}>{u.last_login ? new Date(u.last_login).toLocaleString('pt-BR') : 'Nunca'}</td>
                <td style={{ padding:'12px 16px', textAlign:'right' }}>
                  {u.id !== me?.id && <button onClick={() => del(u.id)} style={{ color:'#ef4444', padding:'4px 8px', borderRadius:6 }}><Trash2 size={15}/></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={() => setModal(false)}>
          <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:460, padding:'28px 24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)' }}>Novo Usuário Admin</h3>
              <button onClick={() => setModal(false)} style={{ color:'var(--text-soft)' }}><X size={18}/></button>
            </div>
            {[
              { label:'Nome completo', k:'name', type:'text' },
              { label:'E-mail', k:'email', type:'email' },
              { label:'Senha (mín. 8 caracteres)', k:'password', type:'password' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-soft)', marginBottom:5, textTransform:'uppercase' }}>{f.label}</label>
                <input type={f.type} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]:e.target.value })} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-soft)', marginBottom:5, textTransform:'uppercase' }}>Papel</label>
              <select value={form.role} onChange={e => setForm({ ...form, role:e.target.value })} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, background:'#fff' }}>
                <option value="editor">Editor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            {error && <p style={{ fontSize:13, color:'#dc2626', marginBottom:14 }}>{error}</p>}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', fontSize:13 }}>Cancelar</button>
              <button onClick={create} disabled={saving} style={{ padding:'9px 20px', borderRadius:8, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:13 }}>
                {saving ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
