import CrudTable from './CrudTable';

export default function AdminPastorals() {
  return (
    <div style={{ display: 'grid', gap: 40 }}>
      <CrudTable
        title="Pastorais e Movimentos"
        apiPath="/admin/pastorals"
        searchField="name"
        columns={[
          { key: 'name', label: 'Nome', primary: true },
          { key: 'category', label: 'Categoria' },
          { key: 'coordinator', label: 'Coordenador' },
          { key: 'location', label: 'Local' },
          { key: 'active', label: 'Ativo', render: (v) => (v ? '✓' : '✕') },
        ]}
        fields={[
          { key: 'name', label: 'Nome', required: true },
          { key: 'category', label: 'Categoria' },
          { key: 'image_url', label: 'Foto da pastoral', upload: true },
          { key: 'description', label: 'Descrição', richText: true },
          { key: 'coordinator', label: 'Coordenador' },
          { key: 'phone', label: 'Telefone' },
          { key: 'meeting_day', label: 'Dia do encontro' },
          { key: 'meeting_time', label: 'Horário' },
          { key: 'location', label: 'Local' },
          { key: 'address', label: 'Endereço' },
          { key: 'map_url', label: 'Link do Google Maps' },
          { key: 'display_order', label: 'Ordem', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
        ]}
        initialForm={{
          name: '',
          category: '',
          image_url: '',
          description: '',
          coordinator: '',
          phone: '',
          meeting_day: '',
          meeting_time: '',
          location: '',
          address: '',
          map_url: '',
          display_order: '0',
          active: '1',
        }}
      />

      <CrudTable
        title="Carrossel das Pastorais"
        apiPath="/admin/pastoral-slides"
        searchField="title"
        columns={[
          { key: 'title', label: 'Título', primary: true },
          { key: 'subtitle', label: 'Subtítulo' },
          { key: 'display_order', label: 'Ordem' },
          { key: 'active', label: 'Ativo', render: (v) => (v ? '✓' : '✕') },
        ]}
        fields={[
          { key: 'title', label: 'Título' },
          { key: 'subtitle', label: 'Subtítulo' },
          { key: 'image_url', label: 'Imagem do slide', upload: true, required: true },
          { key: 'display_order', label: 'Ordem', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
        ]}
        initialForm={{
          title: '',
          subtitle: '',
          image_url: '',
          display_order: '0',
          active: '1',
        }}
      />
    </div>
  );
}
