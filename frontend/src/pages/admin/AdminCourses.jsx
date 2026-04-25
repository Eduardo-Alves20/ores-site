import CrudTable from './CrudTable';
export default function AdminCourses() {
  return (
    <CrudTable title="Cursos Gratuitos" apiPath="/admin/courses" searchField="name"
      columns={[
        { key:'name', label:'Nome', primary:true },
        { key:'duration', label:'Duração' },
        { key:'schedule', label:'Horário' },
        { key:'vacancies', label:'Vagas' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'name', label:'Nome', required:true },
        { key:'duration', label:'Duração' },
        { key:'schedule', label:'Horário/Dias' },
        { key:'vacancies', label:'Número de vagas', type:'number' },
        { key:'description', label:'Descrição', textarea:true },
        { key:'display_order', label:'Ordem', type:'number' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ name:'', duration:'', schedule:'', vacancies:'', description:'', display_order:'0', active:'1' }}
    />
  );
}
