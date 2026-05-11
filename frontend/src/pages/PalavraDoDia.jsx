import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import RichTextContent from '../components/RichTextContent';
import { useFetch } from '../hooks/useFetch';

export default function PalavraDoDia() {
  const { data, loading } = useFetch('/word-of-day');

  return (
    <div className="animate-page">
      <PageHeader
        eyebrow="Espiritualidade"
        title="Palavra do Dia"
        subtitle="Leituras diarias em comunhao com a Igreja."
      />
      <section style={{ padding: '72px 24px', maxWidth: 920, margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>Carregando...</p>
        ) : (
          <Reveal>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 36px rgba(26,39,68,.08)' }}>
              <div style={{ padding: '14px 20px', background: 'var(--navy)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Palavra do Dia
              </div>
              <div style={{ padding: '26px 24px' }}>
                <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(26px,3.5vw,38px)', color: 'var(--navy)', marginBottom: 8 }}>
                  {data?.title || 'Palavra do Dia'}
                </h2>
                {data?.subtitle && <p style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.75, marginBottom: 18 }}>{data.subtitle}</p>}
                {data?.content_html ? (
                  <RichTextContent html={data.content_html} style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8 }} />
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--text-soft)' }}>Conteudo indisponivel no momento.</p>
                )}
                {data?.link_url && (
                  <a
                    href={data.link_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 20, padding: '11px 18px', borderRadius: 10, background: 'var(--gold)', color: '#fff', fontSize: 13, fontWeight: 700 }}
                  >
                    Ver fonte original
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}
