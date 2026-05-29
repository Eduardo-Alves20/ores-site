import { Heart, Globe, Users, ShieldCheck } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';

const PAYPAL_BUTTON_ID = 'WPZWP2RXDTYDC';

const impacts = [
  { icon: <Users size={28} />, num: '1.200+', label: 'pessoas atendidas por ano' },
  { icon: <Heart size={28} />, num: '15+', label: 'anos de atuação social' },
  { icon: <Globe size={28} />, num: '3', label: 'unidades regionais ativas' },
];

const tiers = [
  { amount: 20,  label: 'Apoio',     desc: 'Ajuda a manter nossos projetos ativos' },
  { amount: 50,  label: 'Amigo',     desc: 'Apoia uma família por uma semana' },
  { amount: 100, label: 'Parceiro',  desc: 'Financia um mês de curso profissionalizante' },
  { amount: 250, label: 'Patrono',   desc: 'Transforma a vida de uma pessoa por um mês' },
];

export default function Doe() {
  useSeo({
    title: 'Doe agora',
    description: 'Faça uma doação para a ORES e ajude a transformar vidas. Aceitamos doações via PIX, cartão de crédito e PayPal (Brasil e exterior).',
    keywords: 'doar ORES, doação ONG, doação PIX, doação cartão, doação PayPal',
  });
  return (
    <div style={{ background: '#f7f9fc', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1565c0 100%)', color: '#fff', padding: '72px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '.04em' }}>
            <Heart size={14} fill="currentColor" /> FAÇA A DIFERENÇA
          </div>
          <h1 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,5vw,46px)', lineHeight: 1.15, marginBottom: 20 }}>
            Sua doação transforma<br />vidas no Brasil
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,.85)', maxWidth: 560, margin: '0 auto' }}>
            A ORES trabalha pela reintegração social de pessoas vulneráveis. Cada contribuição, grande ou pequena, gera impacto real e duradouro.
          </p>
        </div>
      </div>

      {/* Números de impacto */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8edf5' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
          {impacts.map((item, i) => (
            <div key={i} style={{ flex: '1 1 200px', textAlign: 'center', padding: '16px 24px', borderRight: i < impacts.length - 1 ? '1px solid #e8edf5' : 'none' }}>
              <div style={{ color: 'var(--gold)', marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--navy)' }}>{item.num}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Esquerda — valores sugeridos + botão */}
        <div style={{ flex: '1 1 360px' }}>
          <h2 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--navy)', marginBottom: 8 }}>
            Escolha como apoiar
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
            Você decide o valor. Aceitamos doações únicas em reais (BRL) via cartão de crédito ou PayPal de qualquer país.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
            {tiers.map((t) => (
              <a key={t.amount}
                href={`https://www.paypal.com/donate?hosted_button_id=${PAYPAL_BUTTON_ID}&amount=${t.amount}`}
                target="_top"
                rel="noopener noreferrer"
                style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '16px', textDecoration: 'none', display: 'block', transition: 'border-color .2s, box-shadow .2s, transform .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(25,118,210,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--navy)' }}>R${t.amount}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gold)', marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{t.desc}</div>
              </a>
            ))}
          </div>

          {/* Botão PayPal */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              Clique no botão abaixo para ser redirecionado ao PayPal.<br />
              <strong style={{ color: 'var(--navy)' }}>Você escolhe o valor na próxima tela.</strong>
            </p>
            <form action="https://www.paypal.com/donate" method="post" target="_top" style={{ display: 'inline-block' }}>
              <input type="hidden" name="hosted_button_id" value={PAYPAL_BUTTON_ID} />
              <button type="submit" style={{
                background: '#0070ba',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '14px 36px',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'Montserrat,sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '0 auto',
                transition: 'background .2s, transform .1s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#005ea6'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0070ba'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                  alt="PayPal" style={{ height: 20, borderRadius: 3 }} />
                Donate with PayPal
              </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
              <ShieldCheck size={13} /> Pagamento 100% seguro via PayPal
            </div>
          </div>
        </div>

        {/* Direita — por que doar */}
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1565c0 100%)', borderRadius: 20, padding: '32px 28px', color: '#fff', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              Onde sua doação vai
            </h3>
            {[
              { pct: '40%', label: 'Programas de reintegração social' },
              { pct: '30%', label: 'Cursos e capacitação profissional' },
              { pct: '20%', label: 'Assistência direta às famílias' },
              { pct: '10%', label: 'Infraestrutura e operação' },
            ].map((item) => (
              <div key={item.pct} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,.85)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700 }}>{item.pct}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 4, height: 5 }}>
                  <div style={{ background: '#42a5f5', borderRadius: 4, height: 5, width: item.pct, transition: 'width .8s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1.5px solid #e2e8f0' }}>
            <h3 style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--navy)', marginBottom: 12 }}>
              Outras formas de ajudar
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>
              Prefere ser voluntário ou propor uma parceria institucional?
            </p>
            <a href="/voluntario" style={{ display: 'block', textAlign: 'center', background: 'var(--cream)', color: 'var(--navy)', fontWeight: 600, fontSize: 13, padding: '10px 0', borderRadius: 8, textDecoration: 'none' }}>
              Seja voluntário →
            </a>
            <a href="/contato" style={{ display: 'block', textAlign: 'center', marginTop: 8, color: 'var(--gold)', fontWeight: 600, fontSize: 13, padding: '10px 0', borderRadius: 8, textDecoration: 'none' }}>
              Fale conosco →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
