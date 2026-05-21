import CrudTable from './CrudTable';

export default function AdminRegionais() {
  return (
    <CrudTable
      title="Unidades Regionais"
      apiPath="/admin/regionais"
      searchField="name"
      columns={[
        { key: 'name', label: 'Nome', primary: true },
        {
          key: 'image_url',
          label: 'Foto',
          render: (v) => (v ? <img src={v} alt="" style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} /> : '—'),
        },
        { key: 'city', label: 'Cidade' },
        { key: 'state', label: 'Estado' },
        { key: 'coordinator', label: 'Coordenador' },
        { key: 'phone', label: 'Telefone' },
      ]}
      fields={[
        { key: 'name', label: 'Nome da unidade', required: true },
        { key: 'city', label: 'Cidade', required: true },
        { key: 'state', label: 'Estado (UF)' },
        { key: 'address', label: 'Endereço' },
        { key: 'image_url', label: 'Foto da unidade', upload: true },
        { key: 'description', label: 'Descrição', richText: true },
        { key: 'coordinator', label: 'Coordenador(a)' },
        { key: 'phone', label: 'Telefone' },
        { key: 'email', label: 'E-mail' },
        { key: 'maps_url', label: 'Link do Google Maps' },
        { key: 'display_order', label: 'Ordem', type: 'number' },
        { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
      ]}
      initialForm={{ name: '', city: '', state: 'RJ', address: '', image_url: '', description: '', coordinator: '', phone: '', email: '', maps_url: '', display_order: '0', active: '1' }}
    />
  );
}
