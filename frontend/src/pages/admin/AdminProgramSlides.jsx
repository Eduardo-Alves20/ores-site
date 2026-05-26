import CrudTable from './CrudTable';

export default function AdminProgramSlides() {
  return (
    <CrudTable
      title="Galeria dos Programas Sociais"
      apiPath="/admin/program-slides"
      searchField="title"
      columns={[
        { key: 'title', label: 'Título', primary: true },
        { key: 'subtitle', label: 'Subtítulo' },
        { key: 'display_order', label: 'Ordem' },
        { key: 'active', label: 'Ativo', render: (v) => (v ? '✓' : '✕') },
      ]}
      fields={[
        { key: 'title', label: 'Título (opcional)' },
        { key: 'subtitle', label: 'Subtítulo (opcional)' },
        { key: 'image_url', label: 'Imagem do slide', upload: true, required: true },
        { key: 'display_order', label: 'Ordem (menor aparece primeiro)', type: 'number' },
        { key: 'active', label: 'Ativo', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Não' }] },
      ]}
      initialForm={{ title: '', subtitle: '', image_url: '', display_order: '0', active: '1' }}
    />
  );
}
