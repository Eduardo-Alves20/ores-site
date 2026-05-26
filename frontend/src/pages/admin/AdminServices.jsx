import CrudTable from './CrudTable';

export default function AdminServices() {
  return (
    <div style={{ display: 'grid', gap: 40 }}>
      <CrudTable
        title="Programas Sociais"
        apiPath="/admin/services"
        searchField="title"
        columns={[
          { key: 'icon', label: 'Ícone' },
          { key: 'title', label: 'Título', primary: true },
          { key: 'active', label: 'Ativo', render: v => v ? '✓' : '✗' },
        ]}
        fields={[
          { key: 'icon', label: 'Emoji/Ícone' },
          { key: 'title', label: 'Título', required: true },
          { key: 'description', label: 'Descrição', textarea: true },
          { key: 'display_order', label: 'Ordem', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
        ]}
        initialForm={{ icon: '', title: '', description: '', display_order: '0', active: '1' }}
      />

      <CrudTable
        title="Galeria dos Programas (foto única ou carrossel)"
        apiPath="/admin/program-slides"
        searchField="title"
        columns={[
          { key: 'title', label: 'Título', primary: true },
          { key: 'subtitle', label: 'Subtítulo' },
          { key: 'display_order', label: 'Ordem' },
          { key: 'active', label: 'Ativo', render: (v) => (v ? '✓' : '✕') },
        ]}
        fields={[
          { key: 'image_url', label: 'Imagem', upload: true, required: true },
          { key: 'title', label: 'Título (opcional)' },
          { key: 'subtitle', label: 'Subtítulo (opcional)' },
          { key: 'display_order', label: 'Ordem (menor aparece primeiro)', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
        ]}
        initialForm={{ image_url: '', title: '', subtitle: '', display_order: '0', active: '1' }}
      />
    </div>
  );
}
