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

function ToolbarButton({ title, children, onAction }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onAction();
      }}
      style={toolbarButtonStyle}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value = '', onChange, minHeight = 150, style }) {
  const editorRef = useRef(null);
  const isEditingRef = useRef(false);
  const selectionRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isEditingRef.current) return;
    const nextValue = value || '';
    if (editorRef.current.innerHTML === nextValue) return;
    editorRef.current.innerHTML = nextValue;
  }, [value]);

  const selectionIsInsideEditor = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || !selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    return editor.contains(range.commonAncestorContainer);
  };

  const saveSelection = () => {
    if (!selectionIsInsideEditor()) return;
    const selection = window.getSelection();
    selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || !selectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const sync = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
    saveSelection();
  };

  const apply = (command, arg) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('styleWithCSS', false, false);
    document.execCommand('defaultParagraphSeparator', false, 'p');
    restoreSelection();
    document.execCommand(command, false, arg);
    sync();
  };

  const applyParagraph = () => {
    apply('formatBlock', 'P');
  };

  const applyLineBreak = () => {
    apply('insertHTML', '<br>');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <ToolbarButton title="Negrito" onAction={() => apply('bold')}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italico" onAction={() => apply('italic')}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton title="Lista" onAction={() => apply('insertUnorderedList')}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Lista numerada" onAction={() => apply('insertOrderedList')}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Paragrafo" onAction={applyParagraph}>
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton title="Quebra de linha" onAction={applyLineBreak}>
          <CornerDownLeft size={15} />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onFocus={(event) => {
          isEditingRef.current = true;
          document.execCommand('defaultParagraphSeparator', false, 'p');
          saveSelection();
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
