export default function RichTextContent({ html, fallback = '', className = '', dark = false, style }) {
  const content = html || fallback;
  if (!content) return null;

  const classes = ['rich-text-content', dark ? 'rich-text-content-dark' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={classes}
        style={{
          fontSize: 15,
          color: dark ? 'rgba(255,255,255,.74)' : 'var(--text-mid)',
          lineHeight: 1.75,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style>{`
        .rich-text-content > :first-child { margin-top: 0; }
        .rich-text-content > :last-child { margin-bottom: 0; }
        .rich-text-content p { margin: 0 0 12px; }
        .rich-text-content ul,
        .rich-text-content ol { margin: 0 0 12px 20px; padding: 0; }
        .rich-text-content li { margin-bottom: 6px; }
        .rich-text-content strong { color: var(--navy); font-weight: 800; }
        .rich-text-content em { font-style: italic; }
        .rich-text-content h1,
        .rich-text-content h2,
        .rich-text-content h3,
        .rich-text-content h4 {
          font-family: 'Playfair Display,serif';
          color: var(--navy);
          font-weight: 700;
          line-height: 1.3;
          margin: 18px 0 10px;
        }
        .rich-text-content h1 { font-size: 30px; }
        .rich-text-content h2 { font-size: 26px; }
        .rich-text-content h3 { font-size: 22px; }
        .rich-text-content h4 { font-size: 19px; }
        .rich-text-content blockquote {
          margin: 14px 0;
          padding: 12px 14px;
          border-left: 3px solid var(--gold);
          background: var(--cream);
          border-radius: 8px;
        }
        .rich-text-content a {
          color: var(--gold);
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .rich-text-content-dark strong,
        .rich-text-content-dark h1,
        .rich-text-content-dark h2,
        .rich-text-content-dark h3,
        .rich-text-content-dark h4 { color: #fff; }
        .rich-text-content-dark blockquote {
          background: rgba(255,255,255,.08);
          border-left-color: var(--gold-light);
        }
        @media (max-width: 700px) {
          .rich-text-content { font-size: 14px !important; line-height: 1.7 !important; }
          .rich-text-content h1 { font-size: 25px; }
          .rich-text-content h2 { font-size: 22px; }
          .rich-text-content h3 { font-size: 19px; }
          .rich-text-content h4 { font-size: 17px; }
        }
      `}</style>
    </>
  );
}
