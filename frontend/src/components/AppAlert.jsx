import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const AlertContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={28} />,
  error: <XCircle size={28} />,
  warning: <AlertTriangle size={28} />,
  info: <Info size={28} />,
};

const COLORS = {
  success: '#16a34a',
  error: '#dc2626',
  warning: '#b8945a',
  info: 'var(--navy)',
};

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const resolver = useRef(null);

  const close = useCallback((value = false) => {
    setAlert(null);
    if (resolver.current) {
      resolver.current(value);
      resolver.current = null;
    }
  }, []);

  const show = useCallback((options) => new Promise((resolve) => {
    resolver.current = resolve;
    setAlert({
      type: 'info',
      title: 'Aviso',
      message: '',
      confirmText: 'Ok',
      cancelText: '',
      ...options,
    });
  }), []);

  const notify = useCallback((options) => show(options).then(() => true), [show]);
  const confirm = useCallback((options) => show({
    type: 'warning',
    title: 'Confirmar ação',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    ...options,
  }), [show]);

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);
  const color = alert ? COLORS[alert.type] || COLORS.info : COLORS.info;

  return (
    <AlertContext.Provider value={value}>
      {children}
      {alert && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'rgba(26,39,68,.58)', backdropFilter:'blur(6px)' }} onClick={() => close(false)}>
          <div style={{ width:'100%', maxWidth:430, background:'#fff', borderRadius:16, border:'1px solid rgba(255,255,255,.45)', boxShadow:'0 28px 80px rgba(0,0,0,.28)', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ height:5, background:color }} />
            <div style={{ padding:'26px 26px 22px' }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--cream)', color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {ICONS[alert.type] || ICONS.info}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:14, alignItems:'flex-start' }}>
                    <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'var(--navy)', fontWeight:700, lineHeight:1.2 }}>{alert.title}</h3>
                    <button type="button" onClick={() => close(false)} style={{ color:'var(--text-soft)', padding:2, flexShrink:0 }} aria-label="Fechar">
                      <X size={18} />
                    </button>
                  </div>
                  {alert.message && <p style={{ marginTop:10, fontSize:14, lineHeight:1.7, color:'var(--text-mid)' }}>{alert.message}</p>}
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24 }}>
                {alert.cancelText && (
                  <button type="button" onClick={() => close(false)} style={{ padding:'10px 18px', borderRadius:10, border:'1px solid var(--border)', color:'var(--text-mid)', fontSize:13, fontWeight:700, background:'#fff' }}>
                    {alert.cancelText}
                  </button>
                )}
                <button type="button" onClick={() => close(true)} style={{ padding:'10px 20px', borderRadius:10, background:color, color:'#fff', fontSize:13, fontWeight:800, boxShadow:'0 8px 22px rgba(184,148,90,.22)' }}>
                  {alert.confirmText || 'Ok'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAppAlert must be used inside AlertProvider');
  return ctx;
}
