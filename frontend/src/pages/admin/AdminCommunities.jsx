import CrudTable from './CrudTable';

export default function AdminCommunities() {
  return (
    <CrudTable
      title="Comunidades (Setores)"
      apiPath="/admin/communities"
      searchField="name"
      columns={[
        { key: 'name', label: 'Nome', primary: true },
        {
          key: 'image_url',
          label: 'Foto',
          render: (v) => (v ? <img src={v} alt="" style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} /> : '—'),
        },
        { key: 'neighborhood', label: 'Bairro' },
        { key: 'coordinator_name', label: 'Coordenador' },
        { key: 'coordinator_phone', label: 'Telefone' },
      ]}
      fields={[
        { key: 'name', label: 'Nome', required: true },
        { key: 'image_url', label: 'Foto da comunidade', upload: true },
        { key: 'neighborhood', label: 'Bairro' },
        { key: 'description', label: 'Descricao', richText: true },
        { key: 'coordinator_name', label: 'Nome do coordenador' },
        { key: 'coordinator_phone', label: 'Telefone' },
        { key: 'display_order', label: 'Ordem', type: 'number' },
        { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Nao' }] },
      ]}
      initialForm={{ name: '', image_url: '', neighborhood: '', description: '', coordinator_name: '', coordinator_phone: '', display_order: '0', active: '1' }}
    />
  );
}
