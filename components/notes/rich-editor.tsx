'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Bold, Italic, Code, List, ListOrdered, Quote, Heading1, Heading2, Undo, Redo } from 'lucide-react';
import SpeakButton from './speak-button';
import useAssemblyStreaming from '@/hooks/use-assembly-streaming';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface RichEditorHandle {
  replaceSelectedText: (selectedText: string, newText: string) => void;
}

interface RichEditorProps {
  note: any;
  onSave: (updatedFields: any) => void;
  onSelectionChange: (text: string) => void;
}

const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor({ note, onSave, onSelectionChange }, ref) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState('#1c1c28');
  const [lastNoteId, setLastNoteId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const colorPresets = [
    { hex: '#1c1c28', name: 'Default' },
    { hex: '#7c3aed', name: 'Violet' },
    { hex: '#2563eb', name: 'Blue' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#84cc16', name: 'Lime' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#f43f5e', name: 'Rose' },
    { hex: '#ec4899', name: 'Pink' },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      Image,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Debounce auto-save to prevent content replacement issues
      if (saveTimeout) clearTimeout(saveTimeout);
      const timeout = setTimeout(() => {
        onSave({ content: JSON.stringify(editor.getJSON()) });
      }, 800);
      setSaveTimeout(timeout);
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

  // Load note values only when switching to a different note
  useEffect(() => {
    if (note && editor && note.id !== lastNoteId) {
      setLastNoteId(note.id);
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
  }, [note?.id, editor]);

  // Close color picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  // Close icon picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const root = document.getElementById('icon-picker-root');
      if (root && !root.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    }
    if (showIconPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showIconPicker]);

  // Voice stream callback
  const [liveTranscript, setLiveTranscript] = useState('');

  const { isRecording, error: recordingError, startRecording, stopRecording } = useAssemblyStreaming({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        if (editor) editor.commands.insertContent(text + ' ');
        setLiveTranscript('');
      } else {
        setLiveTranscript(text);
      }
    }
  });

  // Expose replaceSelectedText so parent can update editor content directly
  // without going through a DB round-trip (which caused the stale-until-tab-switch bug)
  useImperativeHandle(ref, () => ({
    replaceSelectedText: (selectedText: string, newText: string) => {
      if (!editor) return;
      const { state } = editor;
      const { from, to } = state.selection;
      const currentSelectedText = state.doc.textBetween(from, to, ' ');

      if (currentSelectedText.trim() && currentSelectedText.includes(selectedText.trim())) {
        // Selection still active — replace just the selection
        editor.chain().focus().deleteSelection().insertContent(newText).run();
      } else {
        // No active selection — find & replace in full document text
        const fullText = editor.getText();
        const idx = fullText.indexOf(selectedText);
        if (idx !== -1) {
          // Walk through the document to find the exact position and replace
          let charCount = 0;
          let replaceFrom = -1;
          let replaceTo = -1;
          state.doc.descendants((node, pos) => {
            if (node.isText && replaceFrom === -1) {
              const nodeText = node.text || '';
              const localIdx = nodeText.indexOf(selectedText);
              if (localIdx !== -1) {
                replaceFrom = pos + localIdx;
                replaceTo = replaceFrom + selectedText.length;
                return false;
              }
            }
          });
          if (replaceFrom !== -1) {
            editor.chain().focus()
              .deleteRange({ from: replaceFrom, to: replaceTo })
              .insertContentAt(replaceFrom, newText)
              .run();
          }
        }
      }
    },
  }), [editor]);

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
          <div className="relative" id="icon-picker-root">
            <button
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              title="Change note icon"
              className="w-11 h-11 flex items-center justify-center text-2xl rounded-xl bg-bg-secondary border border-border hover:border-accent-primary hover:ring-2 hover:ring-accent-primary/20 transition-all duration-200 cursor-pointer select-none flex-shrink-0"
            >
              {icon || '📝'}
            </button>

            {showIconPicker && (
              <div className="absolute left-0 top-14 z-50 bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl p-3 w-56 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Pick an icon</p>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {['📝','📓','📔','📒','📕','📗','📘','📙','📋','🗒️','🗓️','📅','✍️','💡','🔖','⭐','🎯','🚀','💻','🎨','🔬','📊','📈','🧠','💼','🏆','❤️','⚡','🔥','🎵','📷','🌟','🛠️','🌈','🎲','🍀'].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setIcon(e);
                        onSave({ icon: e });
                        setShowIconPicker(false);
                      }}
                      className={`w-7 h-7 text-lg flex items-center justify-center rounded-lg transition-all hover:bg-white/10 hover:scale-110 ${icon === e ? 'bg-white/15 ring-1 ring-white/30' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/8 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">Custom</p>
                  <input
                    type="text"
                    value={icon}
                    maxLength={2}
                    onChange={(e) => {
                      setIcon(e.target.value);
                      onSave({ icon: e.target.value });
                    }}
                    placeholder="Type emoji…"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/25 text-center"
                  />
                </div>
              </div>
            )}
          </div>
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
          <Select value={category} onValueChange={(value) => {
            setCategory(value);
            onSave({ category: value });
          }}>
            <SelectTrigger className="w-32 text-[10px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
            </SelectContent>
          </Select>

          {/* Color picker with palette */}
          <div className="relative" ref={colorPickerRef}>
            {/* Trigger button */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Change note theme color"
              style={{ backgroundColor: color }}
              className="w-9 h-9 rounded-xl border-2 border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-md"
            >
              {/* Palette icon overlay on hover */}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 text-sm">
                🎨
              </span>
            </button>

            {showColorPicker && (
              <div
                className="absolute right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                style={{ minWidth: '196px' }}
              >
                {/* Popover card */}
                <div className="rounded-2xl border border-white/10 bg-[#16161f] shadow-2xl overflow-hidden">

                  {/* Header: gradient preview strip */}
                  <div
                    className="h-12 w-full relative flex items-end px-3 pb-2"
                    style={{
                      background: `linear-gradient(135deg, ${color}cc 0%, ${color}44 100%)`,
                    }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70 drop-shadow">
                      Theme Color
                    </span>
                    <div
                      className="ml-auto w-5 h-5 rounded-full border-2 border-white/40 shadow"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  {/* Preset swatches — 2 columns with names */}
                  <div className="p-3 grid grid-cols-2 gap-1.5">
                    {colorPresets.map(({ hex, name }) => {
                      const isActive = color === hex;
                      return (
                        <button
                          key={hex}
                          onClick={() => {
                            setColor(hex);
                            onSave({ color: hex });
                            setShowColorPicker(false);
                          }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 group/swatch ${
                            isActive
                              ? 'bg-white/10 ring-1 ring-white/20'
                              : 'hover:bg-white/5'
                          }`}
                          title={name}
                        >
                          {/* Swatch circle */}
                          <span
                            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-white/10"
                            style={{ backgroundColor: hex }}
                          >
                            {isActive && '✓'}
                          </span>
                          <span className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-white/50 group-hover/swatch:text-white/80'} transition-colors`}>
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom color row */}
                  <div className="mx-3 mb-3 mt-1 pt-2 border-t border-white/8">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">
                      Custom
                    </label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 border border-white/8 hover:border-white/15 transition-colors">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          setColor(e.target.value);
                          onSave({ color: e.target.value });
                        }}
                        className="flex-1 h-5 bg-transparent cursor-pointer border-0 outline-none appearance-none opacity-0 absolute"
                        style={{ width: '100%' }}
                        id="custom-color-input"
                      />
                      <label
                        htmlFor="custom-color-input"
                        className="flex-1 text-[11px] text-white/50 cursor-pointer hover:text-white/70 transition-colors"
                      >
                        {color.toUpperCase()}
                      </label>
                      <label
                        htmlFor="custom-color-input"
                        className="text-[10px] text-white/40 hover:text-white/70 cursor-pointer transition-colors font-medium"
                      >
                        Pick ›
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SpeakButton
            isRecording={isRecording}
            onClick={isRecording ? stopRecording : startRecording}
          />
        </div>
      </div>

      {/* Live transcript preview / error banner */}
      {(liveTranscript || recordingError) && (
        <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
          recordingError
            ? 'bg-accent-rose/10 border border-accent-rose/30 text-accent-rose'
            : 'bg-accent-primary/8 border border-accent-primary/20 text-text-secondary'
        }`}>
          <span className={`mt-0.5 flex-shrink-0 text-base ${ recordingError ? '❌' : '🎙️' }`}>
            {recordingError ? '❌' : '🎙️'}
          </span>
          <span className="italic leading-relaxed">
            {recordingError || liveTranscript}
          </span>
        </div>
      )}

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
});

export default RichEditor;
export { RichEditor };
