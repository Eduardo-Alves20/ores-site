import CrudTable from './CrudTable';

export default function AdminHeroSlides() {
  return (
    <CrudTable
      title="Carrossel da Home"
      apiPath="/admin/hero-slides"
      searchField="title"
      initialForm={{
        eyebrow: '',
        title: '',
        subtitle: '',
        image_url: '',
        primary_label: 'Conheça a ORES',
        primary_url: '/quem-somos',
        secondary_label: 'Fale Conosco',
        secondary_url: '/contato',
        duration_ms: 6000,
        display_order: 0,
        active: 1,
      }}
      fields={[
        { key:'eyebrow', label:'Texto acima do título' },
        { key:'title', label:'Título', required:true },
        { key:'subtitle', label:'Subtítulo', textarea:true },
        { key:'image_url', label:'Imagem de fundo', upload:true },
        { key:'primary_label', label:'Botão principal' },
        { key:'primary_url', label:'Link do botão principal' },
        { key:'secondary_label', label:'Botão secundário' },
        { key:'secondary_url', label:'Link do botão secundário' },
        { key:'duration_ms', label:'Tempo na tela (ms)', type:'number' },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Status', options:[{ value:1, label:'Ativo' }, { value:0, label:'Inativo' }] },
      ]}
      columns={[
        { key:'title', label:'Título', primary:true },
        { key:'duration_ms', label:'Tempo', render:v => `${Number(v || 0) / 1000}s` },
        { key:'display_order', label:'Ordem' },
        { key:'active', label:'Status', render:v => Number(v) ? 'Ativo' : 'Inativo' },
      ]}
    />
  );
}
