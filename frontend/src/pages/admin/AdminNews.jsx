import CrudTable from './CrudTable';

export default function AdminNews() {
  return (
    <CrudTable
      title="Notícias"
      apiPath="/admin/news"
      searchField="title"
      columns={[
        { key:'title', label:'Título', primary:true },
        { key:'category', label:'Categoria' },
        { key:'published_at', label:'Data', render:v => v?.slice(0,10) || '-' },
        { key:'published', label:'Publicado', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'title', label:'Título', required:true },
        { key:'slug', label:'Slug (URL)', required:true },
        { key:'category', label:'Categoria' },
        { key:'summary', label:'Resumo', textarea:true },
        { key:'content', label:'Conteúdo', textarea:true },
        { key:'image_url', label:'Imagem da notícia', upload:true },
        { key:'published', label:'Publicado', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ title:'', slug:'', category:'', summary:'', content:'', image_url:'', published:'1' }}
    />
  );
}
