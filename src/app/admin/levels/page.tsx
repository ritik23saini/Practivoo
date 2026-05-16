'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import { FaLevelUpAlt } from 'react-icons/fa';
import { BsGraphUpArrow } from 'react-icons/bs';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Level = {
  _id: string;
  defaultName: string;
  order?: number; // optional order field
};

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selected, setSelected] = useState<Level | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [defaultName, setDefaultName] = useState('');
  
  const router = useRouter();
  useEffect(() => {
    fetch('/api/admin/levels', { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setLevels(data.levels || []);
      })
      .catch(() => {
        toast.error('Failed to load levels');
        router.replace('/admin/login');
      });
  }, []);


  const resetState = () => {
    setSelected(null);
    setEditMode(false);
    setDefaultName('');
  };

  const handleCreate = async () => {
    if (!defaultName.trim()) {
      toast.error('Please enter level name');
      return;
    }

    const res = await fetch('/api/admin/levels', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultName }),
    });

    const data = await res.json();
    if (res.ok) {
      setLevels([...levels, data.level]);
      toast.success('Level created');
      resetState();
    } else {
      toast.error(data.error || 'Failed to create level');
    }
  };

  const handleEdit = async () => {
    if (!selected || !defaultName.trim()) {
      toast.error('Please enter level name');
      return;
    }

    const res = await fetch('/api/admin/levels', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected._id, defaultName }),
    });

    const data = await res.json();
    if (res.ok) {
      setLevels(levels.map((l) => (l._id === selected._id ? data.level : l)));
      toast.success('Level updated');
      resetState();
    } else {
      toast.error(data.error || 'Failed to update level');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this level?');
    if (!confirmed) return;

    const res = await fetch('/api/admin/levels', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setLevels(levels.filter((l) => l._id !== id));
      toast.success('Level deleted');
      resetState();
    } else {
      toast.error('Failed to delete level');
    }
  };

  // 🟢 Handle drag reorder
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(levels);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setLevels(reordered);

    try {
      await fetch('/api/admin/levels/reorder', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((l) => l._id) }),
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save order');
    }
  };

  return (
    <div className="flex h-full p-6 gap-6">
      {/* Left Panel */}
      <div className="w-2/3 bg-[#e9efff] p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex  items-center gap-3">
            <div className="bg-white rounded-full p-3 text-black">
              <BsGraphUpArrow size={20} />

            </div>
            <h2 className="text-xl font-bold">Levels</h2>

          </div>

          <button
            onClick={() => {
              resetState();
              setEditMode(false);   // ensure not editing
              setSelected({} as Level); // trick: mark selected so panel opens
            }}
            className="px-4 py-1 rounded-lg border font-bold border-black flex items-center gap-2"
          >
            <PlusCircle /> Create New Level
          </button>
        </div>
        {/* Drag & Drop List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className='flex font-semibold text-md justify-between  p-3 space-y-3'>
            <p>Name</p>
            <p> Action</p>
          </div>
          <Droppable droppableId="levels">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {levels.map((lvl, index) => (
                  <Draggable key={lvl._id} draggableId={lvl._id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}

                        className="bg-white p-3 rounded-xl flex justify-between items-center shadow hover:bg-slate-200"
                      >
                        <span>{lvl.defaultName}</span>
                        <div className="flex gap-3">
                          <button
                            className="cursor-pointer"
                            onClick={() => {
                              setSelected(lvl);
                              setEditMode(true);
                              setDefaultName(lvl.defaultName);
                            }}
                          >
                            ✏️
                          </button>
                          <button className="cursor-pointer" onClick={() => {

                            handleDelete(lvl._id)
                          }
                          }>🗑️</button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <div className='flex text-center justify-center mt-5'>(Drag and drop to re-arrange the order)</div>
      </div>

      {/* Right Panel */}
      <div className="w-1/3 bg-white p-6 rounded-xl shadow">
        {!editMode && !selected ? (
          // Default closed panel
          <p className="text-gray-500 text-center">Create or Edit levels</p>
        ) : editMode && selected ? (
          // Edit Mode
          <>
            <h3 className="text-lg font-bold mb-2">Edit Level</h3>
            <input
              placeholder="Default Name"
              value={defaultName}
              onChange={(e) => setDefaultName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl  outline-0 bg-[#e9efff]"
            />
            <button
              onClick={handleEdit}
              className="mt-4 w-full py-2 font-semibold text-sm border border-black rounded-xl"
            >
              Save Changes
            </button>
          </>
        ) : (
          // Create Mode
          <>
            <h3 className="text-lg font-bold mb-2">Create New Level</h3>
            <input
              placeholder="Enter new level"
              value={defaultName}
              onChange={(e) => setDefaultName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-0 bg-[#e9efff]"
            />
            <button
              onClick={handleCreate}
              className="mt-4 w-full py-2 rounded-3xl border cursor-pointer hover:bg-slate-200 border-black"
            >
              Create Level
            </button>
          </>
        )}
      </div>

    </div>
  );
}