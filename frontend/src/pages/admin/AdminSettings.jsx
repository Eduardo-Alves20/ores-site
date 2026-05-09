import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import { Save } from 'lucide-react';
import MediaField from './MediaField';
import { useAppAlert } from '../../components/AppAlert';
import { PUBLIC_MENU_ITEMS, ADMIN_MENU_ITEMS, enabledKey } from '../../lib/menuLabels';

function RichTextInput({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === (value || '')) return;
    editorRef.current.innerHTML = value || '';
  }, [value]);

  const apply = (command, arg) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const btn = {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: '#fff',
    fontSize: 12,
    color: 'var(--text-mid)',
    fontWeight: 700,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => apply('bold')} style={btn}>Negrito</button>
        <button type="button" onClick={() => apply('italic')} style={btn}>Italico</button>
        <button type="button" onClick={() => apply('insertUnorderedList')} style={btn}>Lista</button>
        <button type="button" onClick={() => apply('insertOrderedList')} style={btn}>Numerada</button>
        <button type="button" onClick={() => apply('insertParagraph')} style={btn}>Paragrafo</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        style={{
          width:'100%',
          minHeight: 130,
          padding:'10px 14px',
          borderRadius:8,
          border:'1px solid var(--border)',
          fontSize:14,
          outline:'none',
          lineHeight: 1.65,
          color: 'var(--text-mid)',
          background: '#fff',
        }}
      />
    </div>
  );
}

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
      ['radio_stream_url', 'URL da Web Radio'],
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
      ['home_stat_1_value', 'Faixa de numeros: valor 1'],
      ['home_stat_1_suffix', 'Faixa de numeros: sufixo 1 (ex: +)'],
      ['home_stat_1_label', 'Faixa de numeros: legenda 1'],
      ['home_stat_1_no_count', 'Faixa de numeros: sem animacao 1? (1 sim, 0 nao)'],
      ['home_stat_2_value', 'Faixa de numeros: valor 2'],
      ['home_stat_2_suffix', 'Faixa de numeros: sufixo 2'],
      ['home_stat_2_label', 'Faixa de numeros: legenda 2'],
      ['home_stat_2_no_count', 'Faixa de numeros: sem animacao 2? (1 sim, 0 nao)'],
      ['home_stat_3_value', 'Faixa de numeros: valor 3'],
      ['home_stat_3_suffix', 'Faixa de numeros: sufixo 3'],
      ['home_stat_3_label', 'Faixa de numeros: legenda 3'],
      ['home_stat_3_no_count', 'Faixa de numeros: sem animacao 3? (1 sim, 0 nao)'],
      ['home_stat_4_value', 'Faixa de numeros: valor 4'],
      ['home_stat_4_suffix', 'Faixa de numeros: sufixo 4'],
      ['home_stat_4_label', 'Faixa de numeros: legenda 4'],
      ['home_stat_4_no_count', 'Faixa de numeros: sem animacao 4? (1 sim, 0 nao)'],
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
    title: 'Palavra do Dia',
    fields: [
      ['word_day_mode', 'Modo (auto ou manual)'],
      ['word_day_manual_title', 'Titulo manual'],
      ['word_day_manual_subtitle', 'Subtitulo manual'],
      ['word_day_manual_content', 'Conteudo manual', 'textarea'],
      ['word_day_manual_link', 'Link manual (opcional)'],
    ],
  },
  {
    title: 'Conheca a Paroquia',
    fields: [
      ['conheca_eyebrow', 'Etiqueta'],
      ['conheca_title', 'Titulo'],
      ['conheca_subtitle', 'Subtitulo', 'textarea'],
      ['conheca_image_url', 'Imagem do banner', 'image'],
      ['conheca_history_title', 'Bloco: titulo'],
      ['conheca_history_text_1', 'Bloco: texto 1', 'textarea'],
      ['conheca_history_text_2', 'Bloco: texto 2', 'textarea'],
    ],
  },
  {
    title: 'Padres e Diaconos',
    fields: [
      ['priests_eyebrow', 'Etiqueta'],
      ['priests_title', 'Titulo'],
      ['priests_subtitle', 'Subtitulo', 'textarea'],
      ['priests_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Instalacoes',
    fields: [
      ['facilities_eyebrow', 'Etiqueta'],
      ['facilities_title', 'Titulo'],
      ['facilities_subtitle', 'Subtitulo', 'textarea'],
      ['facilities_image_url', 'Imagem do banner', 'image'],
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
    title: 'Agendamento de Salas',
    fields: [
      ['rooms_eyebrow', 'Etiqueta'],
      ['rooms_title', 'Titulo'],
      ['rooms_subtitle', 'Subtitulo', 'textarea'],
      ['rooms_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Grupos de Oracao',
    fields: [
      ['groups_eyebrow', 'Etiqueta'],
      ['groups_title', 'Titulo'],
      ['groups_subtitle', 'Subtitulo', 'textarea'],
      ['groups_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Pastorais e Movimentos',
    fields: [
      ['pastorals_eyebrow', 'Etiqueta'],
      ['pastorals_title', 'Titulo'],
      ['pastorals_subtitle', 'Subtitulo', 'textarea'],
      ['pastorals_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Comunidades',
    fields: [
      ['communities_eyebrow', 'Etiqueta'],
      ['communities_title', 'Titulo'],
      ['communities_subtitle', 'Subtitulo', 'textarea'],
      ['communities_image_url', 'Imagem do banner', 'image'],
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
    title: 'Web Radio',
    fields: [
      ['radio_eyebrow', 'Etiqueta'],
      ['radio_title', 'Titulo'],
      ['radio_subtitle', 'Subtitulo', 'textarea'],
      ['radio_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Homilias e Reflexoes',
    fields: [
      ['homilies_eyebrow', 'Etiqueta'],
      ['homilies_title', 'Titulo'],
      ['homilies_subtitle', 'Subtitulo', 'textarea'],
      ['homilies_image_url', 'Imagem do banner', 'image'],
    ],
  },
  {
    title: 'Obra Social',
    fields: [
      ['obra_social_eyebrow', 'Etiqueta'],
      ['obra_social_title', 'Titulo'],
      ['obra_social_subtitle', 'Subtitulo', 'textarea'],
      ['obra_social_image_url', 'Imagem do banner', 'image'],
      ['obra_social_mission_title', 'Missao: titulo'],
      ['obra_social_mission_text', 'Missao: texto', 'textarea'],
      ['obra_social_cta_label', 'Botao'],
      ['obra_social_cta_url', 'Link do botao'],
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

export default function AdminSettings() {
  const { data, refetch } = useFetch('/admin/settings');
  const { notify } = useAppAlert();
  const [form, setForm] = useState({});
  const [active, setActive] = useState(sections[0].title);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!data || hydratedRef.current) return;
    setForm(data);
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

  const refreshWordOfDay = async () => {
    try {
      await api.post('/admin/word-of-day/refresh');
      notify({ type:'success', title:'Palavra do Dia atualizada', message:'Conteudo do Vatican News atualizado com sucesso.' });
    } catch {
      notify({ type:'error', title:'Falha na atualizacao', message:'Nao foi possivel buscar a Palavra do Dia agora.' });
    }
  };

  const updateMenuLabel = (item, value) => {
    set(item.key, value);
    set(enabledKey(item.key), '1');
  };

  const hideMenuItem = (item) => {
    const ok = window.confirm(`Tem certeza que deseja excluir "${form[item.key] || item.defaultLabel}" do menu?`);
    if (!ok) return;
    set(enabledKey(item.key), '0');
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
                      onClick={() => {
                        const next = window.prompt('Novo nome do item:', label);
                        if (next === null) return;
                        updateMenuLabel(item, next.trim() || item.defaultLabel);
                      }}
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

  const Input = ({ field }) => {
    const [key, label, type] = field;
    if (type === 'menu_manager') return <MenuManager />;
    if (type === 'image') return <MediaField label={label} value={form[key] || ''} onChange={v => set(key, v)} />;
    const common = {
      value: form[key] || '',
      onChange: e => set(key, e.target.value),
      style: { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' },
      onFocus: e => e.target.style.borderColor = 'var(--gold)',
      onBlur: e => e.target.style.borderColor = 'var(--border)',
    };
    return (
      <div style={{ marginBottom:18 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</label>
        {type === 'textarea'
          ? <RichTextInput value={form[key] || ''} onChange={(v) => set(key, v)} />
          : <input type={type || 'text'} {...common} />}
      </div>
    );
  };

  const section = sections.find(s => s.title === active) || sections[0];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>Aparencia e Paginas</h1>
          <p style={{ fontSize:13, color:'var(--text-soft)' }}>Edite textos, links e imagens mantendo o layout do site.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={refreshWordOfDay} type="button" style={{ padding:'10px 18px', borderRadius:10, border:'1px solid var(--border)', color:'var(--navy)', fontWeight:600, fontSize:14, background:'#fff', flexShrink:0 }}>
            Atualizar Palavra do Dia
          </button>
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
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700, color:'var(--navy)', marginBottom:22 }}>{section.title}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:'0 18px' }}>
            {section.fields.map(field => (
              <div key={field[0]} style={{ gridColumn:field[2] === 'textarea' || field[2] === 'image' || field[2] === 'menu_manager' ? '1 / -1' : 'auto' }}>
                <Input field={field} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 240px 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(2,minmax(0,1fr))"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
