"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2 } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  focusMode?: boolean;
}

export default function RichTextEditor({ content, onChange, placeholder, className = '', focusMode = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `ProseMirror focus:outline-none w-full text-base leading-[32px] text-ink ${focusMode ? "min-h-0" : "min-h-[300px] sm:min-h-[380px]"}`,
      },
    },
  });

  // Keep content in sync if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={`flex flex-col mt-5 w-full flex-1 bg-transparent ${className}`}>
      <div className="flex items-center gap-1 mb-2 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-accent/10 text-accent-text' : 'text-ink-soft hover:bg-surface'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-accent/10 text-accent-text' : 'text-ink-soft hover:bg-surface'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-accent/10 text-accent-text' : 'text-ink-soft hover:bg-surface'}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <div className="w-px h-5 bg-line mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-accent/10 text-accent-text' : 'text-ink-soft hover:bg-surface'}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-accent/10 text-accent-text' : 'text-ink-soft hover:bg-surface'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-accent/10 text-accent-text' : 'text-ink-soft hover:bg-surface'}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      
      <div className={`flex-1 overflow-y-auto ${focusMode ? "h-full" : ""}`}>
        {editor.isEmpty && (
          <div className="pointer-events-none absolute text-ink-muted">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
