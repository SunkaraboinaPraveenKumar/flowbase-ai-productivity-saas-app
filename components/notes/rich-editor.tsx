'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useState } from 'react';
import { Bold, Italic, Code, List, ListOrdered, Quote, Heading1, Heading2, Undo, Redo } from 'lucide-react';
import SpeakButton from './speak-button';
import useAssemblyStreaming from '@/hooks/use-assembly-streaming';

interface RichEditorProps {
  note: any;
  onSave: (updatedFields: any) => void;
  onSelectionChange: (text: string) => void;
}

export default function RichEditor({ note, onSave, onSelectionChange }: RichEditorProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState('#1c1c28');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Trigger auto-save of content JSON
      onSave({ content: JSON.stringify(editor.getJSON()) });
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      onSelectionChange(text);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-text-primary text-sm leading-relaxed p-4',
      },
    },
  });

  // Load note values on note ID changes
  useEffect(() => {
    if (note && editor) {
      setTitle(note.title || '');
      setCategory(note.category || 'General');
      setIcon(note.icon || '📝');
      setColor(note.color || '#1c1c28');

      try {
        const jsonContent = JSON.parse(note.content);
        editor.commands.setContent(jsonContent);
      } catch {
        editor.commands.setContent(note.content || '');
      }
    }
  }, [note, editor]);

  // Voice stream callback
  const { isRecording, startRecording, stopRecording } = useAssemblyStreaming({
    onTranscript: (text, isFinal) => {
      if (editor && isFinal) {
        editor.commands.insertContent(text);
      }
    }
  });

  if (!editor || !note) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-xs italic">
        Select a note from the sidebar to view editor
      </div>
    );
  }

  return (
    <div className="card bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      {/* Note Headers */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border pb-4 items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Icon picker */}
          <input
            type="text"
            value={icon}
            onChange={(e) => {
              setIcon(e.target.value);
              onSave({ icon: e.target.value });
            }}
            className="w-10 h-10 text-center text-lg bg-bg-secondary border border-border rounded-xl focus:outline-none"
            title="Emoji Icon"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onSave({ title: e.target.value });
            }}
            className="text-2xl font-bold bg-transparent text-text-primary focus:outline-none font-display flex-1 w-full"
            placeholder="Untitled Note"
          />
        </div>

        {/* Toolbar Speech triggers & details */}
        <div className="flex gap-2.5 items-center justify-end w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              onSave({ category: e.target.value });
            }}
            className="input-base text-[10px] py-1.5 px-3 bg-bg-secondary"
          >
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Design">Design</option>
            <option value="Development">Development</option>
          </select>

          {/* Color strip picker */}
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              onSave({ color: e.target.value });
            }}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            title="Theme Color Strip"
          />

          <SpeakButton 
            isRecording={isRecording} 
            onClick={isRecording ? stopRecording : startRecording} 
          />
        </div>
      </div>

      {/* Editor Tool Menubar */}
      <div className="flex gap-1 flex-wrap border-b border-border pb-3 bg-bg-secondary/20 p-1.5 rounded-lg items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('bold') ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('italic') ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('code') ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <Code className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('heading', { level: 1 }) ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('heading', { level: 2 }) ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('bulletList') ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('orderedList') ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary ${editor.isActive('blockquote') ? 'text-accent-primary bg-bg-secondary border border-border' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1 flex-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="border border-border rounded-xl bg-bg-secondary/10 overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Info details */}
      <div className="flex justify-between items-center text-[10px] text-text-muted font-bold uppercase tracking-wider px-2 pt-2 border-t border-border/40">
        <span>Word Count: {editor.storage.characterCount?.words?.() || 0}</span>
        <span>Characters: {editor.storage.characterCount?.characters?.() || 0}</span>
      </div>
    </div>
  );
}
export { RichEditor };
