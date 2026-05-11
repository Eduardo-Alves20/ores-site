import { useEffect, useRef } from 'react';
import { Bold, CornerDownLeft, Italic, List, ListOrdered, Pilcrow } from 'lucide-react';

const toolbarButtonStyle = {
  width: 34,
  height: 32,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: '#fff',
  color: 'var(--text-mid)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function ToolbarButton({ title, children, onClick }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      style={toolbarButtonStyle}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value = '', onChange, minHeight = 150, style }) {
  const editorRef = useRef(null);
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isEditingRef.current) return;
    const nextValue = value || '';
    if (editorRef.current.innerHTML === nextValue) return;
    editorRef.current.innerHTML = nextValue;
  }, [value]);

  const apply = (command, arg) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <ToolbarButton title="Negrito" onClick={() => apply('bold')}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italico" onClick={() => apply('italic')}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton title="Lista" onClick={() => apply('insertUnorderedList')}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Lista numerada" onClick={() => apply('insertOrderedList')}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Paragrafo" onClick={() => apply('formatBlock', 'p')}>
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton title="Quebra de linha" onClick={() => apply('insertParagraph')}>
          <CornerDownLeft size={15} />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onFocus={(event) => {
          isEditingRef.current = true;
          event.currentTarget.style.borderColor = 'var(--gold)';
        }}
        onBlur={(event) => {
          isEditingRef.current = false;
          onChange(event.currentTarget.innerHTML);
          event.currentTarget.style.borderColor = 'var(--border)';
        }}
        style={{
          width: '100%',
          minHeight,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          fontSize: 14,
          outline: 'none',
          fontFamily: 'Plus Jakarta Sans,sans-serif',
          lineHeight: 1.7,
          color: 'var(--text-mid)',
          background: '#fff',
          ...style,
        }}
      />
    </div>
  );
}
