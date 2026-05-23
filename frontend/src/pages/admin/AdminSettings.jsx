import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import { ChevronDown, ChevronUp, Pencil, Save, Trash2 } from 'lucide-react';
import MediaField from './MediaField';
import { useAppAlert } from '../../components/AppAlert';
import { PUBLIC_MENU_ITEMS, ADMIN_MENU_ITEMS, enabledKey } from '../../lib/menuLabels';
import RichTextEditor from '../../components/RichTextEditor';

const sections = [
  {
    title: 'Identidade',
    fields: [
      ['site_name', 'Nome do site'],
      ['site_tagline', 'Linha de apoio'],
      ['site_logo_url', 'Logo', 'image'],
      ['site_address', 'Endereco', 'textarea'],
      ['secretary_hours', 'Horario de funcionamento'],
      ['maps_url', 'URL do Google Maps'],
    ],
  },
  {
    title: 'Contato e redes',
    fields: [
      ['site_email', 'E-mail', 'email'],
      ['site_whatsapp', 'WhatsApp'],
      ['site_phone', 'Telefone'],
      ['site_facebook', 'Facebook URL'],
      ['site_instagram', 'Instagram URL'],
      ['site_youtube', 'YouTube URL'],
    ],
  },
  {
    title: 'Menus (Site e Admin)',
    fields: [['menu_manager', 'Gerenciador de Menus', 'menu_manager']],
  },
  {
    title: 'Home',
    fields: [
      ['hero_eyebrow', 'Texto acima do titulo'],
      ['hero_title', 'Titulo principal'],
      ['hero_subtitle', 'Subtitulo', 'textarea'],
      ['hero_image_url', 'Imagem do hero', 'image'],
      ['hero_primary_label', 'Botao principal'],
      ['hero_primary_url', 'Link do botao principal'],
      ['hero_secondary_label', 'Botao secundario'],
      ['hero_secondary_url', 'Link do botao secundario'],
      ['daily_message', 'Mensagem do dia', 'textarea'],
      ['home_quick_title', 'Titulo dos acessos rapidos'],
      ['home_mission_eyebrow', 'Missao: etiqueta'],
      ['home_mission_title', 'Missao: titulo'],
      ['home_mission_text', 'Missao: texto', 'textarea'],
      ['home_mission_primary_label', 'Missao: botao principal'],
      ['home_mission_primary_url', 'Missao: link principal'],
      ['home_mission_secondary_label', 'Missao: botao secundario'],
      ['home_mission_secondary_url', 'Missao: link secundario'],
    ],
  },
  {
    title: 'Home - Faixa de numeros',
    fields: [
      ['home_stats_manager', 'Gerenciador da faixa de numeros', 'home_stats_manager'],
    ],
  },
  {
    title: 'Doacoes',
    fields: [
      ['donation_enabled', 'Mostrar secao? (1 sim, 0 nao)'],
      ['donation_eyebrow', 'Etiqueta'],
      ['donation_title', 'Titulo'],
      ['donation_text', 'Mensagem de incentivo', 'textarea'],
      ['donation_pix_key', 'Chave Pix'],
      ['donation_background_url', 'Foto de fundo da secao', 'image'],
      ['donation_qr_url', 'QR Code Pix', 'image'],
      ['donation_button_label', 'Texto do botao'],
      ['donation_gallery_1_url', 'Foto 1', 'image'],
      ['donation_gallery_1_caption', 'Legenda da foto 1'],
      ['donation_gallery_2_url', 'Foto 2', 'image'],
      ['donation_gallery_2_caption', 'Legenda da foto 2'],
      ['donation_gallery_3_url', 'Foto 3', 'image'],
      ['donation_gallery_3_caption', 'Legenda da foto 3'],
    ],
  },
  {
    title: 'Quem Somos',
    fields: [
      ['quem_somos_eyebrow', 'Etiqueta'],
      ['quem_somos_title', 'Titulo'],
      ['quem_somos_subtitle', 'Subtitulo', 'textarea'],
      ['quem_somos_image_url', 'Imagem do banner', 'image'],
      ['quem_somos_history_title', 'Bloco: titulo'],
      ['quem_somos_history_text_1', 'Bloco: texto 1', 'textarea'],
      ['quem_somos_history_text_2', 'Bloco: texto 2', 'textarea'],
    ],
  },
  {
    title: 'Unidades Regionais',
    fields: [
      ['regionais_eyebrow', 'Etiqueta'],
      ['regionais_title', 'Titulo'],
      ['regionais_subtitle', 'Subtitulo', 'textarea'],
      ['regionais_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Projetos e Iniciativas',
    fields: [
      ['projetos_eyebrow', 'Etiqueta'],
      ['projetos_title', 'Titulo'],
      ['projetos_subtitle', 'Subtitulo', 'textarea'],
      ['projetos_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Espaco ORES',
    fields: [
      ['espaco_ores_eyebrow', 'Etiqueta'],
      ['espaco_ores_title', 'Titulo'],
      ['espaco_ores_subtitle', 'Subtitulo', 'textarea'],
      ['espaco_ores_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Calendario de Eventos',
    fields: [
      ['calendar_eyebrow', 'Etiqueta'],
      ['calendar_title', 'Titulo'],
      ['calendar_subtitle', 'Subtitulo', 'textarea'],
      ['calendar_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Noticias',
    fields: [
      ['news_eyebrow', 'Etiqueta'],
      ['news_title', 'Titulo'],
      ['news_subtitle', 'Subtitulo', 'textarea'],
      ['news_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Programas Sociais',
    fields: [
      ['programas_eyebrow', 'Etiqueta'],
      ['programas_title', 'Titulo'],
      ['programas_subtitle', 'Subtitulo', 'textarea'],
      ['programas_image_url', 'Imagem do banner', 'image'],
      ['programas_mission_title', 'Missao: titulo'],
      ['programas_mission_text', 'Missao: texto', 'textarea'],
      ['programas_cta_label', 'Botao'],
      ['programas_cta_url', 'Link do botao'],
    ],
  },
  {
    title: 'Voluntario',
    fields: [
      ['voluntario_eyebrow', 'Etiqueta'],
      ['voluntario_title', 'Titulo'],
      ['voluntario_subtitle', 'Subtitulo', 'textarea'],
      ['voluntario_image_url', 'Imagem do banner', 'image'],
      ['voluntario_cta_title', 'CTA: titulo'],
      ['voluntario_cta_text', 'CTA: texto', 'textarea'],
      ['voluntario_cta_label', 'CTA: botao'],
      ['voluntario_cta_url', 'CTA: link'],
      ['voluntario_area_1_icon', 'Area 1: icone (heart, users, book, handshake)'],
      ['voluntario_area_1_title', 'Area 1: titulo'],
      ['voluntario_area_1_desc', 'Area 1: descricao', 'textarea'],
      ['voluntario_area_2_icon', 'Area 2: icone (heart, users, book, handshake)'],
      ['voluntario_area_2_title', 'Area 2: titulo'],
      ['voluntario_area_2_desc', 'Area 2: descricao', 'textarea'],
      ['voluntario_area_3_icon', 'Area 3: icone (heart, users, book, handshake)'],
      ['voluntario_area_3_title', 'Area 3: titulo'],
      ['voluntario_area_3_desc', 'Area 3: descricao', 'textarea'],
      ['voluntario_area_4_icon', 'Area 4: icone (heart, users, book, handshake)'],
      ['voluntario_area_4_title', 'Area 4: titulo'],
      ['voluntario_area_4_desc', 'Area 4: descricao', 'textarea'],
    ],
  },
  {
    title: 'Contato',
    fields: [
      ['contact_eyebrow', 'Etiqueta'],
      ['contact_title', 'Titulo'],
      ['contact_subtitle', 'Subtitulo', 'textarea'],
      ['contact_image_url', 'Imagem do banner', 'image'],
    ],
  },
];

function SettingsField({ field, form, setValue, MenuManagerComponent, HomeStatsManagerComponent }) {
  const [key, label, type] = field;
  if (type === 'menu_manager') return <MenuManagerComponent />;
  if (type === 'home_stats_manager') return <HomeStatsManagerComponent />;
  if (type === 'image') return <MediaField label={label} value={form[key] || ''} onChange={(v) => setValue(key, v)} />;
  if (type === 'boolean01') {
    return (
      <div style={{ marginBottom:18 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
        <select
          value={(form[key] ?? '0') === '1' ? '1' : '0'}
          onChange={(e) => setValue(key, e.target.value)}
          style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
        >
          <option value="0">Nao (com animacao)</option>
          <option value="1">Sim (sem animacao)</option>
        </select>
      </div>
    );
  }
  const common = {
    value: form[key] || '',
    onChange: (e) => setValue(key, e.target.value),
    style: { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' },
    onFocus: (e) => { e.target.style.borderColor = 'var(--gold)'; },
    onBlur: (e) => { e.target.style.borderColor = 'var(--border)'; },
  };
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
      {type === 'textarea'
        ? <RichTextEditor value={form[key] || ''} onChange={(v) => setValue(key, v)} minHeight={130} style={{ padding:'10px 14px', lineHeight:1.65 }} />
        : <input type={type || 'text'} {...common} />}
    </div>
  );
}

export default function AdminSettings() {
  const { data, refetch } = useFetch('/admin/settings');
  const { notify, confirm } = useAppAlert();
  const [form, setForm] = useState({});
  const [active, setActive] = useState(sections[0].title);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [editingMenuLabel, setEditingMenuLabel] = useState('');
  const [openStat, setOpenStat] = useState(1);
  const [editingStat, setEditingStat] = useState(null);
  const [editingStatDraft, setEditingStatDraft] = useState({ value: '', suffix: '', label: '', noCount: '0' });
  const hydratedRef = useRef(false);

  const statDefaults = {
    1: { value: '3', suffix: '', label: 'Unidades Regionais', noCount: '0' },
    2: { value: '15', suffix: '+', label: 'Projetos Ativos', noCount: '0' },
    3: { value: '500', suffix: '+', label: 'Familias Atendidas', noCount: '0' },
    4: { value: '1992', suffix: '', label: 'Ano de Fundacao', noCount: '1' },
  };

  useEffect(() => {
    if (!data || hydratedRef.current) return;
    setForm({
      ...data,
      home_stat_1_value: data.home_stat_1_value ?? statDefaults[1].value,
      home_stat_1_suffix: data.home_stat_1_suffix ?? statDefaults[1].suffix,
      home_stat_1_label: data.home_stat_1_label ?? statDefaults[1].label,
      home_stat_1_no_count: data.home_stat_1_no_count ?? statDefaults[1].noCount,
      home_stat_2_value: data.home_stat_2_value ?? statDefaults[2].value,
      home_stat_2_suffix: data.home_stat_2_suffix ?? statDefaults[2].suffix,
      home_stat_2_label: data.home_stat_2_label ?? statDefaults[2].label,
      home_stat_2_no_count: data.home_stat_2_no_count ?? statDefaults[2].noCount,
      home_stat_3_value: data.home_stat_3_value ?? statDefaults[3].value,
      home_stat_3_suffix: data.home_stat_3_suffix ?? statDefaults[3].suffix,
      home_stat_3_label: data.home_stat_3_label ?? statDefaults[3].label,
      home_stat_3_no_count: data.home_stat_3_no_count ?? statDefaults[3].noCount,
      home_stat_4_value: data.home_stat_4_value ?? statDefaults[4].value,
      home_stat_4_suffix: data.home_stat_4_suffix ?? statDefaults[4].suffix,
      home_stat_4_label: data.home_stat_4_label ?? statDefaults[4].label,
      home_stat_4_no_count: data.home_stat_4_no_count ?? statDefaults[4].noCount,
    });
    hydratedRef.current = true;
  }, [data]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setLoading(true);
    setMsg('');
    try {
      await api.put('/admin/settings', form);
      setMsg('Configuracoes salvas com sucesso.');
      notify({ type:'success', title:'Configuracoes salvas', message:'As alteracoes ja estao prontas para aparecer no site.' });
      refetch();
    } catch {
      setMsg('Erro ao salvar.');
      notify({ type:'error', title:'Erro ao salvar', message:'Nao consegui salvar as configuracoes agora. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const updateMenuLabel = (item, value) => {
    set(item.key, value);
    set(enabledKey(item.key), '1');
  };

  const openMenuEditor = (item) => {
    setEditingMenuItem(item);
    setEditingMenuLabel(form[item.key] || item.defaultLabel);
  };

  const saveMenuEditor = () => {
    if (!editingMenuItem) return;
    updateMenuLabel(editingMenuItem, editingMenuLabel.trim() || editingMenuItem.defaultLabel);
    setEditingMenuItem(null);
    setEditingMenuLabel('');
  };

  const hideMenuItem = async (item) => {
    const ok = await confirm({ title:'Excluir item do menu?', message:`"${form[item.key] || item.defaultLabel}" sera ocultado do menu.`, confirmText:'Excluir' });
    if (!ok) return;
    set(enabledKey(item.key), '0');
  };

  const openStatEditor = (index) => {
    setEditingStat(index);
    setEditingStatDraft({
      value: form[`home_stat_${index}_value`] ?? statDefaults[index].value,
      suffix: form[`home_stat_${index}_suffix`] ?? statDefaults[index].suffix,
      label: form[`home_stat_${index}_label`] ?? statDefaults[index].label,
      noCount: (form[`home_stat_${index}_no_count`] ?? statDefaults[index].noCount) === '1' ? '1' : '0',
    });
  };

  const saveStatEditor = () => {
    if (!editingStat) return;
    const index = editingStat;
    set(`home_stat_${index}_value`, editingStatDraft.value);
    set(`home_stat_${index}_suffix`, editingStatDraft.suffix);
    set(`home_stat_${index}_label`, editingStatDraft.label);
    set(`home_stat_${index}_no_count`, editingStatDraft.noCount);
    setEditingStat(null);
  };

  const clearStat = async (index) => {
    const ok = await confirm({
      title:'Excluir indicador?',
      message:`O indicador ${index} sera resetado para o valor atual padrao do site.`,
      confirmText:'Excluir',
    });
    if (!ok) return;

    set(`home_stat_${index}_value`, statDefaults[index].value);
    set(`home_stat_${index}_suffix`, statDefaults[index].suffix);
    set(`home_stat_${index}_label`, statDefaults[index].label);
    set(`home_stat_${index}_no_count`, statDefaults[index].noCount);
    notify({ type:'success', title:'Indicador resetado', message:`Indicador ${index} voltou ao padrao.` });
  };

  const MenuManager = () => {
    const groups = [
      { title: 'Menu do Site', items: PUBLIC_MENU_ITEMS },
      { title: 'Menu do Painel Admin', items: ADMIN_MENU_ITEMS },
    ];

    return (
      <div style={{ display: 'grid', gap: 18 }}>
        {groups.map((group) => (
          <div key={group.title} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', background: 'var(--cream)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {group.title}
            </div>
            {group.items.map((item) => {
              const label = form[item.key] || item.defaultLabel;
              const activeItem = form[enabledKey(item.key)] !== '0';
              return (
                <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '11px 14px', borderBottom: '1px solid var(--cream-dark)', opacity: activeItem ? 1 : 0.55 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-soft)' }}>{activeItem ? 'Visivel no menu' : 'Oculto no menu'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openMenuEditor(item)}
                      style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', background: '#fff' }}
                    >
                      Editar
                    </button>
                    {activeItem ? (
                      <button
                        type="button"
                        onClick={() => hideMenuItem(item)}
                        style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12.5, fontWeight: 700, color: '#b91c1c', background: '#fff5f5' }}
                      >
                        Excluir
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => set(enabledKey(item.key), '1')}
                        style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12.5, fontWeight: 700, color: '#166534', background: '#f0fdf4' }}
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const HomeStatsManager = () => {
    const stats = [1, 2, 3, 4].map((index) => ({
      index,
      value: form[`home_stat_${index}_value`] ?? statDefaults[index].value,
      suffix: form[`home_stat_${index}_suffix`] ?? statDefaults[index].suffix,
      label: form[`home_stat_${index}_label`] ?? statDefaults[index].label,
      noCount: (form[`home_stat_${index}_no_count`] ?? statDefaults[index].noCount) === '1',
    }));

    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', background: 'var(--cream)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Indicadores da Home
        </div>
        {stats.map((item, idx) => (
          <div key={item.index} style={{ borderBottom: idx === stats.length - 1 ? 'none' : '1px solid var(--cream-dark)' }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpenStat(openStat === item.index ? 0 : item.index)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenStat(openStat === item.index ? 0 : item.index); } }}
              style={{ width: '100%', padding: '11px 14px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, textAlign: 'left', background: '#fff', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>
                  Indicador {item.index}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-soft)' }}>
                  {item.value}{item.suffix} - {item.label}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openStatEditor(item.index); }}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', background: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); void clearStat(item.index); }}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #fecaca', fontSize: 12.5, fontWeight: 700, color: '#b91c1c', background: '#fff5f5', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Trash2 size={13} /> Excluir
                </button>
                {openStat === item.index ? <ChevronUp size={16} color="var(--text-soft)" /> : <ChevronDown size={16} color="var(--text-soft)" />}
              </div>
            </div>

            {openStat === item.index && (
              <div style={{ padding: '0 14px 14px', background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 6, textTransform: 'uppercase' }}>Valor</label>
                    <input readOnly value={item.value} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fafafa' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 6, textTransform: 'uppercase' }}>Sufixo</label>
                    <input readOnly value={item.suffix} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fafafa' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 6, textTransform: 'uppercase' }}>Legenda</label>
                    <input readOnly value={item.label} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fafafa' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 6, textTransform: 'uppercase' }}>Animacao</label>
                    <input readOnly value={item.noCount ? 'Sem animacao' : 'Com animacao'} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fafafa' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const section = sections.find(s => s.title === active) || sections[0];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Montserrat,sans-serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>Aparência e Páginas</h1>
          <p style={{ fontSize:13, color:'var(--text-soft)' }}>Edite textos, links e imagens mantendo o layout do site.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={save} disabled={loading} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:14, flexShrink:0 }}>
            <Save size={16}/>{loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {msg && <p style={{ marginBottom:18, fontSize:14, color:msg.includes('sucesso')?'#16a34a':'#dc2626', fontWeight:600 }}>{msg}</p>}

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24, alignItems:'start' }}>
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', maxHeight:'72vh', overflowY:'auto', position:'sticky', top:12 }}>
          {sections.map(s => (
            <button key={s.title} onClick={() => setActive(s.title)}
              style={{ display:'block', width:'100%', textAlign:'left', padding:'12px 14px', fontSize:12.5, fontWeight:active===s.title?700:500, color:active===s.title?'var(--gold)':'var(--navy)', background:active===s.title?'var(--cream)':'#fff', borderBottom:'1px solid var(--cream-dark)' }}>
              {s.title}
            </button>
          ))}
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:28 }}>
          <h2 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:700, color:'var(--navy)', marginBottom:22 }}>{section.title}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:'0 18px' }}>
            {section.fields.map(field => (
              <div key={field[0]} style={{ gridColumn:field[2] === 'textarea' || field[2] === 'image' || field[2] === 'menu_manager' || field[2] === 'home_stats_manager' ? '1 / -1' : 'auto' }}>
                <SettingsField field={field} form={form} setValue={set} MenuManagerComponent={MenuManager} HomeStatsManagerComponent={HomeStatsManager} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingStat && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={() => setEditingStat(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:620, boxShadow:'0 24px 64px rgba(0,0,0,.2)', border:'1px solid var(--border)' }}
          >
            <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:700, color:'var(--navy)' }}>Editar Indicador {editingStat}</h3>
            </div>
            <div style={{ padding:'22px', display:'grid', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Valor</label>
                  <input value={editingStatDraft.value} onChange={(e) => setEditingStatDraft((d) => ({ ...d, value: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Sufixo</label>
                  <input value={editingStatDraft.suffix} onChange={(e) => setEditingStatDraft((d) => ({ ...d, suffix: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Legenda</label>
                <input value={editingStatDraft.label} onChange={(e) => setEditingStatDraft((d) => ({ ...d, label: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Sem animacao?</label>
                <select value={editingStatDraft.noCount} onChange={(e) => setEditingStatDraft((d) => ({ ...d, noCount: e.target.value }))} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }}>
                  <option value="0">Nao (com animacao)</option>
                  <option value="1">Sim (sem animacao)</option>
                </select>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:6 }}>
                <button onClick={() => setEditingStat(null)} type="button" style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, color:'var(--text-mid)' }}>Cancelar</button>
                <button onClick={saveStatEditor} type="button" style={{ padding:'9px 20px', borderRadius:8, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:13 }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingMenuItem && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={() => setEditingMenuItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,.2)', border:'1px solid var(--border)' }}
          >
            <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontFamily:'Montserrat,sans-serif', fontSize:20, fontWeight:700, color:'var(--navy)' }}>Editar Nome do Menu</h3>
            </div>
            <div style={{ padding:'22px' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                Novo nome
              </label>
              <input
                value={editingMenuLabel}
                onChange={(e) => setEditingMenuLabel(e.target.value)}
                style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
              />
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18 }}>
                <button onClick={() => setEditingMenuItem(null)} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, color:'var(--text-mid)' }}>Cancelar</button>
                <button onClick={saveMenuEditor} style={{ padding:'9px 20px', borderRadius:8, background:'var(--gold)', color:'#fff', fontWeight:600, fontSize:13 }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 240px 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(2,minmax(0,1fr))"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
