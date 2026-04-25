import CrudTable from './CrudTable';
export default function AdminServices() {
  return (
    <CrudTable title="Serviços Sociais" apiPath="/admin/services" searchField="title" noCreate noDelete
      columns={[
        { key:'icon', label:'Ícone' },
        { key:'title', label:'Título', primary:true },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'icon', label:'Emoji/Ícone' },
        { key:'title', label:'Título', required:true },
        { key:'description', label:'Descrição', textarea:true },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ icon:'', title:'', description:'', display_order:'0', active:'1' }}
    />
  );
}
