import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro de renderizacao da aplicacao:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--cream)' }}>
        <div style={{ maxWidth: 560, width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 28, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', color: 'var(--navy)', fontSize: 30, marginBottom: 10 }}>Opa, algo deu errado</h1>
          <p style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>
            Nao foi possivel carregar esta pagina agora.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '11px 20px', borderRadius: 10, background: 'var(--gold)', color: '#fff', fontWeight: 700, fontSize: 14 }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
}
