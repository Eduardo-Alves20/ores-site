import CrudTable from './CrudTable';
export default function AdminFacilities() {
  return (
    <CrudTable title="Instalações" apiPath="/admin/facilities" searchField="name" noCreate noDelete
      columns={[
        { key:'icon', label:'Ícone' },
        { key:'name', label:'Nome', primary:true },
        { key:'capacity', label:'Capacidade' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'icon', label:'Emoji/Ícone' },
        { key:'name', label:'Nome', required:true },
        { key:'description', label:'Descrição', textarea:true },
        { key:'capacity', label:'Capacidade', type:'number' },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{}}
    />
  );
}
