import CrudTable from './CrudTable';
export default function AdminCommunities() {
  return (
    <CrudTable title="Comunidades (Setores)" apiPath="/admin/communities" searchField="name"
      columns={[
        { key:'name', label:'Nome', primary:true },
        { key:'neighborhood', label:'Bairro' },
        { key:'coordinator_name', label:'Coordenador' },
        { key:'coordinator_phone', label:'Telefone' },
      ]}
      fields={[
        { key:'name', label:'Nome', required:true },
        { key:'neighborhood', label:'Bairro' },
        { key:'coordinator_name', label:'Nome do coordenador' },
        { key:'coordinator_phone', label:'Telefone' },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ name:'', neighborhood:'', coordinator_name:'', coordinator_phone:'', display_order:'0', active:'1' }}
    />
  );
}
