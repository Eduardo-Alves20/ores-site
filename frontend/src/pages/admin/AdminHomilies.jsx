import { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, Search } from 'lucide-react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import { useAppAlert } from '../../components/AppAlert';
import HomilyMediaField from './HomilyMediaField';

const EMPTY = { title: '', priest_name: '', type: 'Homilia', duration: '', audio_url: '', video_url: '', published_at: '', active: '1' };

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-soft)', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

const fieldStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans,sans-serif', background: '#fff' };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };

export default function AdminHomilies() {
  const { data, loading, refetch } = useFetch('/admin/homilies');
  const { notify, confirm } = useAppAlert();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const rows = Array.isArray(data) ? data : [];
  const filtered = search
    ? rows.filter(r => String(r.title || '').toLowerCase().includes(search.toLowerCase()))
    : rows;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit = (row) => { setForm({ ...EMPTY, ...row, active: String(row.active ?? '1') }); setError(''); setModal('edit'); };

  const save = async () => {
    setSaving(true); setError('');
    try {
      if (modal === 'create') await api.post('/admin/homilies', form);
      else await api.put(`/admin/homilies/${form.id}`, form);
      setModal(null);
      notify({ type: 'success', title: 'Salvo com sucesso', message: 'As alterações foram registradas.' });
      refetch();
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao salvar.';
      setError(message);
      notify({ type: 'error', title: 'Erro ao salvar', message });
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    const ok = await confirm({ title: 'Excluir homilia?', message: 'Essa ação não pode ser desfeita.', confirmText: 'Excluir' });
    if (!ok) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/homilies/${id}`);
      notify({ type: 'success', title: 'Registro excluído', message: 'A homilia foi removida.' });
      refetch();
    } catch { notify({ type: 'error', title: 'Erro ao excluir', message: 'Não foi possível excluir agora.' }); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, fontWeight: 700, color: 'var(--navy)' }}>Homilias e Reflexões</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ padding: '8px 12px 8px 30px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none', width: 180 }} />
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'var(--gold)', color: '#fff', fontWeight: 600, fontSize: 13 }}>
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
                  {['Título', 'Pregador', 'Tipo', 'Mídia', 'Duração', 'Data', 'Ativo', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Ações' ? 'right' : 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-soft)', fontSize: 13 }}>Nenhum registro encontrado.</td></tr>
                ) : filtered.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--cream-dark)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--navy)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-mid)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.priest_name || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-mid)' }}>{row.type}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-soft)' }}>
                      {row.audio_url && <span style={{ marginRight: 4 }}>🎵</span>}
                      {row.video_url && <span>🎬</span>}
                      {!row.audio_url && !row.video_url && '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-mid)' }}>{row.duration || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{row.published_at?.slice(0, 10) || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-mid)' }}>{row.active ? '✓' : '✗'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEdit(row)} style={{ color: 'var(--gold)', padding: '4px 8px', borderRadius: 6, marginRight: 4 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,148,90,.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(row.id)} disabled={deleting === row.id} style={{ color: '#ef4444', padding: '4px 8px', borderRadius: 6 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Nova Homilia' : 'Editar'} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Título *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} style={fieldStyle} required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Pregador</label>
            <input value={form.priest_name || ''} onChange={e => set('priest_name', e.target.value)} style={fieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.type || 'Homilia'} onChange={e => set('type', e.target.value)} style={fieldStyle}>
                {['Homilia', 'Reflexão', 'Podcast'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duração (ex: 18 min)</label>
              <input value={form.duration || ''} onChange={e => set('duration', e.target.value)} style={fieldStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Data de publicação</label>
              <input type="date" value={form.published_at || ''} onChange={e => set('published_at', e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ativo</label>
              <select value={form.active ?? '1'} onChange={e => set('active', e.target.value)} style={fieldStyle}>
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>
          </div>

          <HomilyMediaField
            audioUrl={form.audio_url}
            videoUrl={form.video_url}
            onAudioChange={v => set('audio_url', v)}
            onVideoChange={v => set('video_url', v)}
          />

          {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button onClick={() => setModal(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-mid)' }}>Cancelar</button>
            <button onClick={save} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--gold)', color: '#fff', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={15} />{saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
