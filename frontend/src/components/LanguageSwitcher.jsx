import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';

// Languages offered to the visitor. Add/remove freely — Google supports many more.
const LANGUAGES = [
  { code: 'pt', label: 'PT', name: 'Português',  flag: '🇧🇷' },
  { code: 'en', label: 'EN', name: 'English',     flag: '🇺🇸' },
  { code: 'es', label: 'ES', name: 'Español',     flag: '🇪🇸' },
  { code: 'fr', label: 'FR', name: 'Français',    flag: '🇫🇷' },
];

function readCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name, value) {
  const expires = new Date(Date.now() + 365 * 86400000).toUTCString();
  // Set with no domain first (works for any host), then try with the apex domain
  // so the cookie survives subdomain redirects (www -> root).
  document.cookie = `${name}=${value};expires=${expires};path=/`;
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length >= 2) {
    const apex = '.' + parts.slice(-2).join('.');
    document.cookie = `${name}=${value};expires=${expires};path=/;domain=${apex}`;
  }
}

function clearCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length >= 2) {
    const apex = '.' + parts.slice(-2).join('.');
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${apex}`;
  }
}

function currentLangFromCookie() {
  // Google Translate stores its choice in a `googtrans` cookie as `/<source>/<target>`
  const cookie = readCookie('googtrans');
  if (!cookie) return 'pt';
  const parts = cookie.split('/');
  return parts[2] || 'pt';
}

let scriptInjected = false;
function injectGoogleTranslate() {
  if (scriptInjected) return;
  scriptInjected = true;

  // Callback Google calls once its script is ready
  window.googleTranslateElementInit = () => {
    try {
      // The widget needs an element to mount on, but we never display it.
      // eslint-disable-next-line no-new
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'pt',
          includedLanguages: LANGUAGES.filter((l) => l.code !== 'pt').map((l) => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    } catch {
      /* widget can throw on hot-reload — safe to ignore */
    }
  };

  const script = document.createElement('script');
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

export default function LanguageSwitcher({ dark = true }) {
  const [current, setCurrent] = useState('pt');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setCurrent(currentLangFromCookie());
    injectGoogleTranslate();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const change = (code) => {
    if (code === current) {
      setOpen(false);
      return;
    }
    if (code === 'pt') {
      clearCookie('googtrans');
    } else {
      writeCookie('googtrans', `/pt/${code}`);
    }
    setCurrent(code);
    setOpen(false);
    // Easiest way to apply the new language to every text node
    window.location.reload();
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  // Buttons get a `notranslate` class so Google leaves them alone.
  return (
    <div ref={wrapRef} className="notranslate" translate="no" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Trocar idioma"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 8,
          background: dark ? 'rgba(255,255,255,.08)' : 'transparent',
          border: dark ? '1px solid rgba(255,255,255,.18)' : '1px solid var(--border)',
          color: dark ? '#fff' : 'var(--navy)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background .15s, border-color .15s',
        }}
        onMouseEnter={(e) => {
          if (dark) e.currentTarget.style.background = 'rgba(255,255,255,.14)';
          else e.currentTarget.style.background = 'var(--cream)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = dark ? 'rgba(255,255,255,.08)' : 'transparent';
        }}
      >
        <Globe size={14} />
        <span>{currentLang.label}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,.18)',
            overflow: 'hidden',
            minWidth: 170,
            zIndex: 1000,
            border: '1px solid var(--border)',
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => change(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                background: lang.code === current ? 'var(--cream)' : '#fff',
                color: 'var(--navy)',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => {
                if (lang.code !== current) e.currentTarget.style.background = 'var(--cream)';
              }}
              onMouseLeave={(e) => {
                if (lang.code !== current) e.currentTarget.style.background = '#fff';
              }}
            >
              <span style={{ fontSize: 16 }}>{lang.flag}</span>
              <span style={{ flex: 1 }}>{lang.name}</span>
              {lang.code === current && <Check size={14} color="var(--gold)" />}
            </button>
          ))}
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-soft)', background: 'var(--cream)' }}>
            Tradução automática Google
          </div>
        </div>
      )}

      {/* Hidden mount point for Google Translate widget */}
      <div id="google_translate_element" style={{ position: 'absolute', top: '-9999px', left: '-9999px', visibility: 'hidden' }} />
    </div>
  );
}
