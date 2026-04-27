import CrudTable from './CrudTable';

export default function AdminNews() {
  return (
    <CrudTable
      title="Noticias"
      apiPath="/admin/news"
      searchField="title"
      columns={[
        { key: 'title', label: 'Titulo', primary: true },
        { key: 'category', label: 'Categoria' },
        { key: 'published_at', label: 'Data', render: (v) => v?.slice(0, 10) || '-' },
        { key: 'published', label: 'Publicado', render: (v) => (v ? '✓' : '✕') },
      ]}
      fields={[
        { key: 'title', label: 'Titulo', required: true },
        { key: 'slug', label: 'Slug (URL)', required: true },
        { key: 'category', label: 'Categoria' },
        { key: 'summary', label: 'Resumo', textarea: true },
        { key: 'content', label: 'Conteudo', textarea: true },
        { key: 'image_url', label: 'Imagem da noticia', upload: true },
        { key: 'external_url', label: 'Link externo (opcional)' },
        { key: 'published', label: 'Publicado', options: [{ value: '1', label: 'Sim' }, { value: '0', label: 'Nao' }] },
      ]}
      initialForm={{ title: '', slug: '', category: '', summary: '', content: '', image_url: '', external_url: '', published: '1' }}
    />
  );
}
