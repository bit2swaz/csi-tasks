'use client';

import { useState } from 'react';
import { useStore } from 'zustand';
import { useBoardStore } from '../store/useBoardStore';
import { Undo, Redo, StickyNote, Image as ImageIcon, Save, Trash2, Camera } from 'lucide-react';

export const Toolbar = () => {
  const addPin = useBoardStore((state) => state.addPin);
  
  // Access temporal state for undo/redo
  const { undo, redo } = useBoardStore.temporal.getState();
  const canUndo = useStore(useBoardStore.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(useBoardStore.temporal, (state) => state.futureStates.length > 0);
  
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapName, setSnapName] = useState('');
  
  const snapshots = useBoardStore((state) => state.snapshots);
  const saveSnapshot = useBoardStore((state) => state.saveSnapshot);
  const loadSnapshot = useBoardStore((state) => state.loadSnapshot);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) {
      alert("Image is too large! Please use images under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        addPin('image', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 border border-gray-100 z-50">
      
      {/* Add Text Note */}
      <button 
        onClick={() => addPin('text', '')}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
        title="Add Note"
      >
        <StickyNote size={20} />
      </button>

      {/* Add Image */}
      <label className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 cursor-pointer" title="Add Image">
        <ImageIcon size={20} />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </label>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* Undo / Redo */}
      <button 
        onClick={() => undo()}
        disabled={!canUndo}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 disabled:opacity-30"
      >
        <Undo size={20} />
      </button>
      <button 
        onClick={() => redo()}
        disabled={!canRedo}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 disabled:opacity-30"
      >
        <Redo size={20} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* Snapshots */}
      <div className="relative">
        <button 
            onClick={() => setShowSnapshots(!showSnapshots)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
        >
            <Camera size={20} />
        </button>

        {showSnapshots && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Snapshots</h3>
                <div className="flex gap-2 mb-4">
                    <input 
                        className="flex-1 border rounded px-2 py-1 text-sm outline-none"
                        placeholder="Name..." 
                        value={snapName}
                        onChange={(e) => setSnapName(e.target.value)}
                    />
                    <button 
                        onClick={() => {
                            if(snapName) { saveSnapshot(snapName); setSnapName(''); }
                        }}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                    >
                        <Save size={16} />
                    </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {Object.keys(snapshots).map(name => (
                        <div key={name} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <span 
                                onClick={() => loadSnapshot(name)}
                                className="cursor-pointer hover:underline truncate max-w-[100px]"
                            >
                                {name}
                            </span>
                            <button onClick={() => useBoardStore.getState().deleteSnapshot(name)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {Object.keys(snapshots).length === 0 && <p className="text-xs text-gray-400">No snapshots yet</p>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};