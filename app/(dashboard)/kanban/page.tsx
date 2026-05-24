'use client';

import { useState, useEffect } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import BoardList from '@/components/kanban/board-list';
import KanbanColumn from '@/components/kanban/kanban-column';
import CollaboratorsPanel from '@/components/kanban/collaborators-panel';
import TaskDialog from '@/components/kanban/task-dialog';

export default function KanbanPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  
  const [columns, setColumns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  const [newColName, setNewColName] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);

  // Fetch boards on mount
  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/kanban?type=boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
        if (data.boards?.length > 0 && !activeBoardId) {
          setActiveBoardId(data.boards[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch columns and tasks when active board change
  const fetchBoardData = async () => {
    if (!activeBoardId) return;
    try {
      const res = await fetch(`/api/kanban?type=board-data&boardId=${activeBoardId}`);
      if (res.ok) {
        const data = await res.json();
        setColumns(data.columns || []);
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    fetchBoardData();
  }, [activeBoardId]);

  const handleCreateBoard = async (name: string, color: string) => {
    try {
      const res = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'board', name, color })
      });
      if (res.ok) {
        const data = await res.json();
        fetchBoards();
        if (data.board) {
          setActiveBoardId(data.board.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      const res = await fetch(`/api/kanban?type=board&id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (activeBoardId === id) {
          setActiveBoardId(null);
          setColumns([]);
          setTasks([]);
        }
        fetchBoards();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim() || !activeBoardId) return;

    try {
      const res = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'column',
          name: newColName,
          boardId: activeBoardId,
          order: columns.length
        })
      });
      if (res.ok) {
        setNewColName('');
        setShowAddCol(false);
        fetchBoardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteColumn = async (colId: string) => {
    try {
      await fetch(`/api/kanban?type=column&id=${colId}`, { method: 'DELETE' });
      fetchBoardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTask = async (taskData: any) => {
    const method = taskData.id ? 'PUT' : 'POST';
    const body = taskData.id 
      ? { type: 'task', ...taskData }
      : { type: 'task', boardId: activeBoardId, columnId: targetColumnId, ...taskData };

    try {
      const res = await fetch('/api/kanban', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setSelectedTask(null);
        fetchBoardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/kanban?type=task&id=${taskId}`, { method: 'DELETE' });
      setIsDialogOpen(false);
      setSelectedTask(null);
      fetchBoardData();
    } catch (e) {
      console.error(e);
    }
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full items-start">
      
      {/* Board List Sidebar */}
      <div className="lg:col-span-1">
        <BoardList
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      </div>

      {/* Main Board Columns Area */}
      <div className="lg:col-span-3 space-y-4">
        {activeBoard ? (
          <>
            {/* Collaborators and Title info */}
            <div className="space-y-4">
              <CollaboratorsPanel />
            </div>

            {/* Board Column Row */}
            <div className="flex gap-4 overflow-x-auto pb-4 items-start scrollbar-thin">
              {columns.map((col) => {
                const colTasks = tasks.filter(t => t.columnId === col.id);
                return (
                  <KanbanColumn
                    key={col.id}
                    id={col.id}
                    name={col.name}
                    tasks={colTasks}
                    onAddTask={(columnId) => {
                      setTargetColumnId(columnId);
                      setSelectedTask(null);
                      setIsDialogOpen(true);
                    }}
                    onSelectTask={(task) => {
                      setSelectedTask(task);
                      setTargetColumnId(task.columnId);
                      setIsDialogOpen(true);
                    }}
                    onDeleteColumn={handleDeleteColumn}
                  />
                );
              })}

              {/* Add Column Button */}
              {showAddCol ? (
                <form onSubmit={handleAddColumn} className="flex-shrink-0 w-80 bg-bg-card border border-border p-4 rounded-xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Column Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Done"
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      className="w-full input-base text-xs py-1.5 px-2"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddCol(false)}
                      className="button-ghost text-[10px] py-1.5 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button-primary text-[10px] py-1.5 px-3 shadow-glow"
                    >
                      Add Column
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddCol(true)}
                  className="flex-shrink-0 w-80 min-h-[150px] rounded-xl border-2 border-dashed border-border/25 hover:border-accent-primary/40 flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-accent-primary transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="card p-12 text-center space-y-4 max-w-xl mx-auto mt-12 bg-bg-card">
            <LayoutGrid className="w-12 h-12 text-accent-primary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">No Active Board Selected</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Create a board or select one from the sidebar list to organize your team backlog, assign items, and track milestones.
            </p>
          </div>
        )}
      </div>

      {/* Task Dialogue details */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        columns={columns}
      />

    </div>
  );
}
