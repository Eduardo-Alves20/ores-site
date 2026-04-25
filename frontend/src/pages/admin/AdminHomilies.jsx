import CrudTable from './CrudTable';
export default function AdminHomilies() {
  return (
    <CrudTable title="Homilias e Reflexões" apiPath="/admin/homilies" searchField="title"
      columns={[
        { key:'title', label:'Título', primary:true },
        { key:'priest_name', label:'Pregador' },
        { key:'type', label:'Tipo' },
        { key:'duration', label:'Duração' },
        { key:'published_at', label:'Data', render:v => v?.slice(0,10) || '-' },
        { key:'active', label:'Ativo', render:v => v ? '✓' : '✗' },
      ]}
      fields={[
        { key:'title', label:'Título', required:true },
        { key:'priest_name', label:'Pregador' },
        { key:'type', label:'Tipo', options:['Homilia','Reflexão','Podcast'] },
        { key:'duration', label:'Duração (ex: 18 min)' },
        { key:'audio_url', label:'URL do áudio' },
        { key:'published_at', label:'Data de publicação', type:'date' },
        { key:'active', label:'Ativo', options:[{value:'1',label:'Sim'},{value:'0',label:'Não'}] },
      ]}
      initialForm={{ title:'', priest_name:'', type:'Homilia', duration:'', audio_url:'', published_at:'', active:'1' }}
    />
  );
}
