import CrudTable from './CrudTable';

export default function AdminGroups() {
  return (
    <div style={{ display: 'grid', gap: 40 }}>
      <CrudTable
        title="Grupos de Oracao"
        apiPath="/admin/groups"
        searchField="name"
        columns={[
          { key: 'name', label: 'Nome', primary: true },
          {
            key: 'image_url',
            label: 'Foto',
            render: (v) => (v ? <img src={v} alt="" style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} /> : '-'),
          },
          { key: 'day_of_week', label: 'Dia' },
          { key: 'time_value', label: 'Horario' },
          { key: 'location', label: 'Local' },
          { key: 'active', label: 'Ativo', render: (v) => (v ? 'Sim' : 'Nao') },
        ]}
        fields={[
          { key: 'name', label: 'Nome', required: true },
          { key: 'image_url', label: 'Foto do grupo', upload: true },
          { key: 'day_of_week', label: 'Dia da semana' },
          { key: 'time_value', label: 'Horario' },
          { key: 'location', label: 'Local' },
          { key: 'description', label: 'Descricao', richText: true },
          { key: 'coordinator_phone', label: 'Telefone do coordenador' },
          { key: 'display_order', label: 'Ordem', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Nao' }] },
        ]}
        initialForm={{ name: '', image_url: '', day_of_week: '', time_value: '', location: '', description: '', coordinator_phone: '', display_order: '0', active: '1' }}
      />

      <CrudTable
        title="Carrossel dos Grupos de Oracao"
        apiPath="/admin/group-slides"
        searchField="title"
        columns={[
          { key: 'title', label: 'Titulo', primary: true },
          { key: 'subtitle', label: 'Subtitulo' },
          { key: 'display_order', label: 'Ordem' },
          { key: 'active', label: 'Ativo', render: (v) => (v ? 'Sim' : 'Nao') },
        ]}
        fields={[
          { key: 'title', label: 'Titulo' },
          { key: 'subtitle', label: 'Subtitulo' },
          { key: 'image_url', label: 'Imagem do slide', upload: true, required: true },
          { key: 'display_order', label: 'Ordem', type: 'number' },
          { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Nao' }] },
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
