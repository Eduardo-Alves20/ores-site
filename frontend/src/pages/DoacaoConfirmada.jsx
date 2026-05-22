import { Link } from 'react-router-dom';
import { CheckCircle, Heart, ArrowLeft } from 'lucide-react';

export default function DoacaoConfirmada() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f9fc', padding: '48px 24px' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2, #42a5f5)', marginBottom: 28 }}>
          <CheckCircle size={40} color="#fff" strokeWidth={2.5} />
        </div>

        <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 30, color: 'var(--navy)', marginBottom: 16 }}>
          Obrigado pela sua doação!
        </h1>

        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.8, marginBottom: 12 }}>
          Sua contribuição foi recebida com muito carinho. Você acaba de fazer parte da transformação de vidas reais no Brasil.
        </p>

        <div style={{ background: 'linear-gradient(135deg, var(--navy), #1565c0)', borderRadius: 16, padding: '24px 28px', color: '#fff', margin: '32px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Heart size={32} fill="rgba(255,255,255,.3)" color="#fff" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, lineHeight: 1.7, textAlign: 'left', margin: 0 }}>
            <strong>Você receberá um e-mail de confirmação do PayPal.</strong> Guarde-o como comprovante da sua generosidade.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--navy)', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
          <Link to="/doe" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cream)', color: 'var(--navy)', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <Heart size={16} /> Doe novamente
          </Link>
        </div>
      </div>
    </div>
  );
}
