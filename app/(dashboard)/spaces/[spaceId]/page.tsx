'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PagesList from '@/components/spaces/pages-list';
import PageEditor from '@/components/spaces/page-editor';
import { FileText } from 'lucide-react';

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.spaceId as string;

  const [pages, setPages] = useState<any[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const fetchPages = async () => {
    if (!spaceId) return;
    try {
      const res = await fetch(`/api/pages?spaceId=${spaceId}`);
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
        if (data.pages?.length > 0 && !activePageId) {
          setActivePageId(data.pages[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [spaceId]);

  const handleCreatePage = async (title: string) => {
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId,
          title,
          content: '{"type":"doc","content":[{"type":"paragraph","content":[]}]}',
          icon: '📄',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchPages();
        if (data.page) {
          setActivePageId(data.page.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePage = async (updatedFields: any) => {
    if (!activePageId) return;
    
    // Optimistic UI updates
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, ...updatedFields } : p));

    try {
      await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activePageId, ...updatedFields }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activePageId === id) {
          setActivePageId(null);
        }
        fetchPages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activePage = pages.find(p => p.id === activePageId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-full">
      {/* Left List sidebar */}
      <div className="lg:col-span-1">
        <PagesList
          pages={pages}
          activePageId={activePageId}
          onSelectPage={setActivePageId}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
        />
      </div>

      {/* Page editor layout */}
      <div className="lg:col-span-3">
        {activePage ? (
          <PageEditor
            page={activePage}
            onSave={handleUpdatePage}
          />
        ) : (
          <div className="card p-12 text-center space-y-4 max-w-xl mx-auto mt-12 bg-bg-card">
            <FileText className="w-12 h-12 text-accent-primary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">No Active Page</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Create a document page or select one from the nested space sidebar list to start writing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export { SpaceDetailPage };
