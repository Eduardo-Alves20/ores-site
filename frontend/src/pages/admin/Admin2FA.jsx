import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldOff, Smartphone, AlertTriangle, Copy, Check } from 'lucide-react';
import api from '../../lib/api';

export default function Admin2FA() {
  const [enabled, setEnabled]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [setupData, setSetup]   = useState(null);  // { qrCode, secret, otpauth }
  const [code, setCode]         = useState('');
  const [disablePwd, setDisablePwd] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [copied, setCopied]     = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/auth/2fa/status');
      setEnabled(Boolean(data.enabled));
    } catch (e) {
      setError('Falha ao consultar status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const startSetup = async () => {
    setError(''); setSuccess('');
    try {
      const { data } = await api.post('/admin/auth/2fa/setup');
      setSetup(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Erro ao iniciar configuração.');
    }
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/admin/auth/2fa/enable', { code });
      setSuccess('2FA ativado com sucesso! Da próxima vez que entrar, será pedido o código.');
      setSetup(null);
      setCode('');
      fetchStatus();
    } catch (e) {
      setError(e.response?.data?.error || 'Código inválido.');
    }
  };

  const disable = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/admin/auth/2fa/disable', { password: disablePwd, code: disableCode });
      setSuccess('2FA desativado.');
      setDisablePwd(''); setDisableCode('');
      fetchStatus();
    } catch (e) {
      setError(e.response?.data?.error || 'Falha ao desativar.');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div style={{ padding:40, color:'#94a3b8' }}>Carregando…</div>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:24, color:'var(--navy)', marginBottom:6 }}>
        Autenticação em 2 fatores
      </h1>
      <p style={{ fontSize:14, color:'#64748b', marginBottom:28 }}>
        Adicione uma camada extra de segurança à sua conta usando um app autenticador.
      </p>

      {/* Status card */}
      <div style={{ background:'#fff', border:`1.5px solid ${enabled ? '#86efac' : '#fde68a'}`, borderRadius:14, padding:'22px 26px', marginBottom:24, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background: enabled ? '#dcfce7' : '#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', color: enabled ? '#16a34a' : '#d97706' }}>
          {enabled ? <ShieldCheck size={24}/> : <ShieldOff size={24}/>}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:16, color:'var(--navy)' }}>
            {enabled ? '2FA está ATIVO' : '2FA está DESATIVADO'}
          </div>
          <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>
            {enabled ? 'Sua conta está protegida por código TOTP.' : 'Recomendamos fortemente ativar 2FA.'}
          </div>
        </div>
      </div>

      {success && (
        <div style={{ background:'#dcfce7', color:'#166534', padding:'12px 18px', borderRadius:10, fontSize:14, marginBottom:18, border:'1px solid #86efac' }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 18px', borderRadius:10, fontSize:14, marginBottom:18, border:'1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* === ACTIVATE FLOW === */}
      {!enabled && !setupData && (
        <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'26px' }}>
          <h2 style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:17, color:'var(--navy)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
            <Smartphone size={18}/> Como funciona
          </h2>
          <ol style={{ fontSize:14, color:'#475569', lineHeight:1.8, paddingLeft:22, marginBottom:22 }}>
            <li>Baixe um app autenticador no seu celular (<strong>Google Authenticator</strong>, <strong>Authy</strong> ou <strong>1Password</strong>).</li>
            <li>Clique no botão abaixo para gerar um QR code.</li>
            <li>Escaneie o QR code com o app.</li>
            <li>Digite o código de 6 dígitos que o app mostrar para confirmar.</li>
          </ol>
          <button onClick={startSetup}
            style={{ background:'var(--navy)', color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Configurar 2FA agora
          </button>
        </div>
      )}

      {/* === SETUP IN PROGRESS === */}
      {!enabled && setupData && (
        <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'26px' }}>
          <h2 style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:17, color:'var(--navy)', marginBottom:16 }}>
            Escaneie o QR code
          </h2>
          <div style={{ display:'flex', gap:28, flexWrap:'wrap', alignItems:'flex-start' }}>
            <div style={{ background:'#fff', padding:14, border:'1.5px solid #e2e8f0', borderRadius:12 }}>
              <img src={setupData.qrCode} alt="QR Code 2FA" style={{ width:200, height:200, display:'block' }} />
            </div>
            <div style={{ flex:'1 1 240px', minWidth:240 }}>
              <p style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>
                Se não conseguir escanear, digite esta chave manualmente:
              </p>
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:13, color:'var(--navy)', letterSpacing:'.05em', wordBreak:'break-all', marginBottom:10 }}>
                {setupData.secret}
              </div>
              <button onClick={copySecret} type="button"
                style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#475569', cursor:'pointer' }}>
                {copied ? <><Check size={14}/> Copiado</> : <><Copy size={14}/> Copiar chave</>}
              </button>

              <div style={{ background:'#fef3c7', borderLeft:'3px solid #d97706', padding:'10px 14px', borderRadius:6, fontSize:12, color:'#78350f', marginTop:18, display:'flex', gap:8 }}>
                <AlertTriangle size={16} style={{ flexShrink:0, marginTop:1 }}/>
                <span>Guarde essa chave em local seguro. Sem ela e sem o app, você perde acesso ao painel.</span>
              </div>
            </div>
          </div>

          <form onSubmit={confirmEnable} style={{ marginTop:26, paddingTop:24, borderTop:'1px solid #e2e8f0' }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--navy)', marginBottom:10 }}>
              Digite o código de 6 dígitos do app:
            </label>
            <div style={{ display:'flex', gap:10 }}>
              <input
                type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                style={{ flex:1, padding:'12px 16px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:18, letterSpacing:'0.3em', textAlign:'center', fontFamily:'monospace' }}
              />
              <button type="submit" disabled={code.length !== 6}
                style={{ background:'var(--gold)', color:'#fff', border:'none', borderRadius:10, padding:'12px 22px', fontWeight:700, fontSize:14, cursor: code.length === 6 ? 'pointer' : 'not-allowed', opacity: code.length === 6 ? 1 : 0.5 }}>
                Ativar 2FA
              </button>
            </div>
            <button type="button" onClick={() => setSetup(null)}
              style={{ marginTop:12, background:'transparent', border:'none', color:'#94a3b8', fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* === DISABLE FLOW === */}
      {enabled && (
        <form onSubmit={disable} style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, padding:'26px' }}>
          <h2 style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:17, color:'var(--navy)', marginBottom:14 }}>
            Desativar 2FA
          </h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:18 }}>
            Para desativar, confirme com sua senha e um código do autenticador.
          </p>

          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--navy)', marginBottom:6 }}>Senha atual</label>
          <input type="password" required value={disablePwd} onChange={e => setDisablePwd(e.target.value)} autoComplete="current-password"
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, marginBottom:14 }} />

          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--navy)', marginBottom:6 }}>Código 2FA atual</label>
          <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required
            value={disableCode}
            onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:16, letterSpacing:'0.2em', textAlign:'center', fontFamily:'monospace', marginBottom:18 }} />

          <button type="submit" disabled={!disablePwd || disableCode.length !== 6}
            style={{ background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'12px 22px', fontWeight:700, fontSize:14, cursor: 'pointer', opacity:(!disablePwd || disableCode.length !== 6) ? 0.5 : 1 }}>
            Desativar 2FA
          </button>
        </form>
      )}
    </div>
  );
}
