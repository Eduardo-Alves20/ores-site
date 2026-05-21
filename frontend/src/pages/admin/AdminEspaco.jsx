import CrudTable from './CrudTable';

export default function AdminEspaco() {
  return (
    <CrudTable
      title="Espaço ORES — Ambientes"
      apiPath="/admin/facilities"
      searchField="name"
      columns={[
        { key: 'icon', label: 'Ícone' },
        { key: 'name', label: 'Nome', primary: true },
        { key: 'capacity', label: 'Capacidade' },
        { key: 'active', label: 'Ativo', render: v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key: 'icon', label: 'Emoji/Ícone' },
        { key: 'name', label: 'Nome do ambiente', required: true },
        { key: 'description', label: 'Descrição', textarea: true },
        { key: 'capacity', label: 'Capacidade (pessoas)', type: 'number' },
        { key: 'display_order', label: 'Ordem', type: 'number' },
        { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
      ]}
      initialForm={{ icon: '', name: '', description: '', capacity: '', display_order: '0', active: '1' }}
    />
  );
}
