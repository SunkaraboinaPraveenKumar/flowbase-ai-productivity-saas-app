'use client';

import RichEditor from '@/components/notes/rich-editor';
import AIRefineToolbar from '@/components/notes/ai-toolbar';
import { useState } from 'react';

interface PageEditorProps {
  page: any;
  onSave: (updatedFields: any) => void;
}

export default function PageEditor({ page, onSave }: PageEditorProps) {
  const [selectedText, setSelectedText] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-2">
        <RichEditor
          note={page}
          onSave={onSave}
          onSelectionChange={setSelectedText}
        />
      </div>
      <div className="md:col-span-1">
        <AIRefineToolbar
          selectedText={selectedText}
          onRefined={(newText) => {
            onSave({
              content: JSON.stringify({
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: newText }] }]
              })
            });
          }}
        />
      </div>
    </div>
  );
}
export { PageEditor };
