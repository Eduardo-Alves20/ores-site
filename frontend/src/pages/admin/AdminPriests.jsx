import CrudTable from './CrudTable';
export default function AdminPriests() {
  return (
    <CrudTable
      title="Padres e Diáconos"
      apiPath="/admin/priests"
      searchField="name"
      columns={[
        { key:'sigla', label:'Sigla' },
        { key:'name', label:'Nome', primary:true },
        { key:'role', label:'Cargo' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'name', label:'Nome completo', required:true },
        { key:'sigla', label:'Sigla', required:true },
        { key:'role', label:'Cargo', required:true },
        { key:'bio', label:'Biografia', textarea:true },
        { key:'photo_url', label:'Foto', upload:true },
        { key:'display_order', label:'Ordem de exibição', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ name:'', sigla:'', role:'', bio:'', photo_url:'', display_order:'0', active:'1' }}
    />
  );
}
