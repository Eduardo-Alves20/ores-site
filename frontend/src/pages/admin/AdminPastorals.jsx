import CrudTable from './CrudTable';
export default function AdminPastorals() {
  return (
    <CrudTable title="Pastorais e Movimentos" apiPath="/admin/pastorals" searchField="name"
      columns={[
        { key:'name', label:'Nome', primary:true },
        { key:'category', label:'Categoria' },
        { key:'coordinator', label:'Coordenador' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'name', label:'Nome', required:true },
        { key:'category', label:'Categoria' },
        { key:'description', label:'Descrição', textarea:true },
        { key:'coordinator', label:'Coordenador' },
        { key:'phone', label:'Telefone' },
        { key:'meeting_day', label:'Dia do encontro' },
        { key:'meeting_time', label:'Horário' },
        { key:'location', label:'Local' },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ name:'', category:'', description:'', coordinator:'', phone:'', meeting_day:'', meeting_time:'', location:'', display_order:'0', active:'1' }}
    />
  );
}
