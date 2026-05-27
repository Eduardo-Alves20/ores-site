import { useEffect, useState } from 'react';
import { Music, Save, Info } from 'lucide-react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import { useAppAlert } from '../../components/AppAlert';
import CrudTable from './CrudTable';

export default function AdminMusic() {
  const { data: settings, refetch } = useFetch('/admin/settings');
  const { notify } = useAppAlert();
  const [form, setForm] = useState({
    music_enabled: '0',
    music_default_volume: '35',
    music_autoplay: '1',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      music_enabled: settings.music_enabled ?? '0',
      music_default_volume: settings.music_default_volume ?? '35',
      music_autoplay: settings.music_autoplay ?? '1',
    });
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', form);
      notify({ type: 'success', title: 'Configuração salva', message: 'As alterações de música foram aplicadas.' });
      refetch();
    } catch (e) {
      notify({ type: 'error', title: 'Erro', message: e.response?.data?.error || 'Falha ao salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const enabled = form.music_enabled === '1';
  const autoplay = form.music_autoplay !== '0';

  return (
    <div style={{ display: 'grid', gap: 40 }}>
      {/* Settings block */}
      <div>
        <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Música de fundo</h1>
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 24 }}>
          Quando ativada, as músicas tocam no site público de forma contínua. Visitantes podem pausar, ajustar volume e pular faixas.
        </p>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 26px' }}>
          {/* Master toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Tocar música no site</div>
              <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Mestre — desativa todo o player se desligado.</div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, music_enabled: enabled ? '0' : '1' })}
              style={{ width: 50, height: 28, borderRadius: 14, background: enabled ? 'var(--gold)' : '#cbd5e1', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
              <div style={{ position: 'absolute', top: 3, left: enabled ? 26 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 2px 4px rgba(0,0,0,.2)' }} />
            </button>
          </div>

          {/* Autoplay */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Tentar tocar automaticamente</div>
              <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Se desligado, o visitante precisa clicar no botão play.</div>
            </div>
            <button type="button" onClick={() => setForm({ ...form, music_autoplay: autoplay ? '0' : '1' })}
              disabled={!enabled}
              style={{ width: 50, height: 28, borderRadius: 14, background: autoplay && enabled ? 'var(--gold)' : '#cbd5e1', border: 'none', position: 'relative', cursor: enabled ? 'pointer' : 'not-allowed', opacity: enabled ? 1 : 0.5, transition: 'background .2s' }}>
              <div style={{ position: 'absolute', top: 3, left: autoplay ? 26 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 2px 4px rgba(0,0,0,.2)' }} />
            </button>
          </div>

          {/* Default volume */}
          <div style={{ padding: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Volume inicial</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{form.music_default_volume}%</div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={form.music_default_volume}
              onChange={(e) => setForm({ ...form, music_default_volume: e.target.value })}
              disabled={!enabled}
              style={{ width: '100%', accentColor: 'var(--gold)', opacity: enabled ? 1 : 0.5 }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4 }}>
              0 = mudo, 100 = volume máximo. O visitante pode ajustar depois.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px', background: 'var(--cream)', borderRadius: 8, fontSize: 12, color: 'var(--text-mid)', marginTop: 14 }}>
            <Info size={16} style={{ flexShrink: 0, color: 'var(--gold)' }} />
            <span>
              Navegadores modernos bloqueiam reprodução automática com som. Se o autoplay falhar, o player ficará pausado aguardando o primeiro clique do visitante em qualquer lugar do site.
            </span>
          </div>

          <button onClick={save} disabled={saving}
            style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'var(--gold)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
            <Save size={16} />{saving ? 'Salvando…' : 'Salvar configurações'}
          </button>
        </div>
      </div>

      {/* Tracks CRUD */}
      <CrudTable
        title="Músicas (1 = repetir / 2+ = sequência)"
        apiPath="/admin/music"
        searchField="title"
        columns={[
          { key: 'title', label: 'Título', primary: true, render: (v, row) => v || (row.file_url ? row.file_url.split('/').pop() : '—') },
          { key: 'display_order', label: 'Ordem' },
          { key: 'active', label: 'Ativo', render: (v) => (v ? '✓' : '✕') },
        ]}
        fields={[
          { key: 'title', label: 'Título da música (opcional)' },
          { key: 'file_url', label: 'Arquivo de áudio', audio: true, required: true },
          { key: 'display_order', label: 'Ordem (menor toca primeiro)', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
        ]}
        initialForm={{ title: '', file_url: '', display_order: '0', active: '1' }}
      />
    </div>
  );
}
