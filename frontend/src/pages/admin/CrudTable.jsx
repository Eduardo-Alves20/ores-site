import { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, Search } from 'lucide-react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import MediaField from './MediaField';

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:'var(--navy)' }}>{title}</h3>
          <button onClick={onClose} style={{ color:'var(--text-soft)', padding:4 }}><X size={18}/></button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, type='text', value, onChange, options, required, textarea, upload }) {
  const style = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none', fontFamily:'Plus Jakarta Sans,sans-serif', transition:'border-color .2s' };
  const events = { onFocus:e=>e.target.style.borderColor='var(--gold)', onBlur:e=>e.target.style.borderColor='var(--border)' };
  if (upload) return <MediaField label={label} value={value} onChange={onChange} />;

  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-soft)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}{required && ' *'}</label>
      {options ? (
        <select value={value||''} onChange={e=>onChange(e.target.value)} style={{ ...style, background:'#fff' }} {...events}>
          <option value="">Selecionar...</option>
          {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
        </select>
      ) : textarea ? (
        <textarea rows={3} value={value||''} onChange={e=>onChange(e.target.value)} style={{ ...style, resize:'vertical' }} {...events} />
      ) : (
        <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} style={style} {...events} />
      )}
    </div>
  );
}

export default function CrudTable({
  title, apiPath, fields, columns, initialForm = {},
  searchField, extraActions, noCreate, noDelete
}) {
  const { data, loading, refetch } = useFetch(apiPath);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const rows = Array.isArray(data) ? data : [];
  const filtered = search && searchField
    ? rows.filter(r => String(r[searchField]||'').toLowerCase().includes(search.toLowerCase()))
    : rows;

  const openCreate = () => { setForm(initialForm); setError(''); setModal('create'); };
  const openEdit = (row) => { setForm({ ...initialForm, ...row }); setError(''); setModal('edit'); };

  const save = async () => {
    setSaving(true); setError('');
    try {
      if (modal === 'create') await api.post(apiPath, form);
      else await api.put(`${apiPath}/${form.id}`, form);
      setModal(null); refetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Excluir este registro?')) return;
    setDeleting(id);
    try { await api.delete(`${apiPath}/${id}`); refetch(); }
    catch { alert('Erro ao excluir.'); }
    finally { setDeleting(null); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)' }}>{title}</h1>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          {searchField && (
            <div style={{ position:'relative' }}>
              <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-soft)' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ padding:'8px 12px 8px 30px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, outline:'none', width:180 }} />
            </div>
          )}
          {!noCreate && (
            <button onClick={openCreate} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:13 }}>
              <Plus size={16}/> Novo
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'var(--text-soft)' }}>Carregando...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--cream)', borderBottom:'1px solid var(--border)' }}>
                  {columns.map(c => <th key={c.key} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-soft)', whiteSpace:'nowrap' }}>{c.label}</th>)}
                  <th style={{ padding:'12px 16px', textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-soft)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={columns.length + 1} style={{ padding:'32px 16px', textAlign:'center', color:'var(--text-soft)', fontSize:13 }}>Nenhum registro encontrado.</td></tr>
                ) : filtered.map(row => (
                  <tr key={row.id} style={{ borderBottom:'1px solid var(--cream-dark)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {columns.map(c => (
                      <td key={c.key} style={{ padding:'12px 16px', fontSize:13, color:c.primary?'var(--navy)':'var(--text-mid)', fontWeight:c.primary?600:400, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '')}
                      </td>
                    ))}
                    <td style={{ padding:'12px 16px', textAlign:'right', whiteSpace:'nowrap' }}>
                      {extraActions && extraActions(row)}
                      <button onClick={() => openEdit(row)} style={{ color:'var(--gold)', padding:'4px 8px', borderRadius:6, marginRight:4, transition:'background .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(184,148,90,.1)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <Pencil size={15}/>
                      </button>
                      {!noDelete && (
                        <button onClick={() => remove(row.id)} disabled={deleting===row.id} style={{ color:'#ef4444', padding:'4px 8px', borderRadius:6, transition:'background .15s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.1)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <Trash2 size={15}/>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal==='create'?`Novo ${title}`:`Editar`} onClose={()=>setModal(null)}>
          {fields.map(f => (
            <Field key={f.key} label={f.label} type={f.type} value={form[f.key]} onChange={v=>set(f.key,v)} options={f.options} required={f.required} textarea={f.textarea} upload={f.upload} />
          ))}
          {error && <p style={{ fontSize:13, color:'#dc2626', marginBottom:14 }}>{error}</p>}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:8 }}>
            <button onClick={()=>setModal(null)} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, color:'var(--text-mid)' }}>Cancelar</button>
            <button onClick={save} disabled={saving} style={{ padding:'9px 20px', borderRadius:8, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              <Check size={15}/>{saving?'Salvando...':'Salvar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
