import CrudTable from './CrudTable';

const CATS = ['Pastoral Familiar','Juventude','Evento Social','Oração','Gestão','Liturgia','Campanha','Paróquia','Outro'];

export default function AdminEvents() {
  return (
    <CrudTable
      title="Eventos"
      apiPath="/admin/events"
      searchField="title"
      columns={[
        { key:'title', label:'Título', primary:true },
        { key:'event_date', label:'Data', render:v => v?.slice(0,10) },
        { key:'start_time', label:'Horário', render:v => v?.slice(0,5) || '-' },
        { key:'location', label:'Local' },
        { key:'category', label:'Categoria' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'title', label:'Título', required:true },
        { key:'event_date', label:'Data', type:'date', required:true },
        { key:'start_time', label:'Horário de início', type:'time' },
        { key:'end_time', label:'Horário de fim', type:'time' },
        { key:'location', label:'Local' },
        { key:'category', label:'Categoria', options:CATS },
        { key:'description', label:'Descrição', textarea:true },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ title:'', event_date:'', start_time:'', end_time:'', location:'', category:'', description:'', active:'1' }}
    />
  );
}
