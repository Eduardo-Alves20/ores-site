import CrudTable from './CrudTable';

export default function AdminPastorals() {
  return (
    <CrudTable title="Pastorais e Movimentos" apiPath="/admin/pastorals" searchField="name"
      columns={[
        { key:'name', label:'Nome', primary:true },
        { key:'category', label:'Categoria' },
        { key:'coordinator', label:'Coordenador' },
        { key:'location', label:'Local' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✕' },
      ]}
      fields={[
        { key:'name', label:'Nome', required:true },
        { key:'category', label:'Categoria' },
        { key:'image_url', label:'Foto da pastoral', upload:true },
        { key:'description', label:'Descrição', textarea:true },
        { key:'coordinator', label:'Coordenador' },
        { key:'phone', label:'Telefone' },
        { key:'meeting_day', label:'Dia do encontro' },
        { key:'meeting_time', label:'Horário' },
        { key:'location', label:'Local' },
        { key:'address', label:'Endereço' },
        { key:'map_url', label:'Link do Google Maps' },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ name:'', category:'', image_url:'', description:'', coordinator:'', phone:'', meeting_day:'', meeting_time:'', location:'', address:'', map_url:'', display_order:'0', active:'1' }}
    />
  );
}
