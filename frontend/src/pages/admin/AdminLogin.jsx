import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useFetch } from '../../hooks/useFetch';
import { getSiteName } from '../../lib/branding';

export default function AdminLogin() {
  const { login } = useAuth();
  const { data: siteInfo } = useFetch('/site-info');
  const siteName = getSiteName(siteInfo || {});
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:700, margin:'0 auto 16px' }}>✦</div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:26, color:'#fff', fontWeight:700, marginBottom:4 }}>Painel Administrativo</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.45)' }}>{siteName}</p>
        </div>

        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'40px 36px' }}>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.55)', marginBottom:8, letterSpacing:'0.05em' }}>E-MAIL</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} autoComplete="email"
                style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', transition:'border-color .2s' }}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,.12)'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.55)', marginBottom:8, letterSpacing:'0.05em' }}>SENHA</label>
              <input type="password" required value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} autoComplete="current-password"
                style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', transition:'border-color .2s' }}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,.12)'} />
            </div>
            {error && <p style={{ fontSize:13, color:'#fca5a5', background:'rgba(220,38,38,.1)', padding:'10px 14px', borderRadius:8 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ padding:'13px', borderRadius:10, background:'var(--gold)', color:'#fff', fontWeight:700, fontSize:15, boxShadow:'0 4px 18px rgba(184,148,90,.4)', transition:'transform .2s,opacity .2s', opacity:loading?0.7:1, marginTop:4 }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform='translateY(-1px)')}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,.2)', marginTop:24 }}>
          Acesso restrito · {siteName}
        </p>
      </div>
    </div>
  );
}
