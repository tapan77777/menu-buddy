'use client';

import { useEffect, useRef, useState } from 'react';

const FOOD_EMOJIS = [
  '🍽️','🥗','🍗','🥤','⭐','🍢','🍕','🍔','🌮','🌯','🍜','🍝','🍛','🍣',
  '🍱','🥘','🍲','🥙','🥚','🧁','🍰','🍩','🍦','🧃','☕','🍵','🥞','🍿',
  '🥪','🌽','🥕','🥦','🫕','🍖','🥩','🦐','🦞','🍤','🌶️','🧄','🍋','🍇',
];

export default function CategoryManager({ onCategoriesChange }) {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [addName, setAddName]         = useState('');
  const [addEmoji, setAddEmoji]       = useState('🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // 'add' | cat._id
  const [editingId, setEditingId]     = useState(null);
  const [editName, setEditName]       = useState('');
  const [editEmoji, setEditEmoji]     = useState('');
  const [saving, setSaving]           = useState(false);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        onCategoriesChange?.(data.categories);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!addName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName.trim(), emoji: addEmoji }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = [...categories, data.category];
        setCategories(updated);
        onCategoriesChange?.(updated);
        setAddName('');
        setAddEmoji('🍽️');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), emoji: editEmoji }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = categories.map((c) =>
          c._id === id ? { ...c, name: editName.trim(), emoji: editEmoji } : c
        );
        setCategories(updated);
        onCategoriesChange?.(updated);
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Items with this category will keep their current value.')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      const updated = categories.filter((c) => c._id !== id);
      setCategories(updated);
      onCategoriesChange?.(updated);
    }
  }

  // ── Drag-and-drop reorder ──────────────────────────────────────────────────
  function handleDragStart(index) { dragItem.current = index; }
  function handleDragEnter(index) { dragOver.current = index; }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }
    const reordered = [...categories];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, moved);
    dragItem.current = null;
    dragOver.current = null;

    // Optimistic update
    setCategories(reordered);
    onCategoriesChange?.(reordered);

    // Persist
    await fetch('/api/categories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((c) => c._id) }),
    });
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-32 mb-4" />
        {[1,2,3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-lg mb-2" />)}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className="text-lg">🗂️</span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Menu Categories</h3>
          <p className="text-xs text-slate-500">Drag to reorder · click ✏️ to rename</p>
        </div>
      </div>

      {/* Category list */}
      <ul className="divide-y divide-slate-50 px-4 py-2">
        {categories.map((cat, index) => (
          <li
            key={cat._id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-3 py-2.5 group cursor-grab active:cursor-grabbing"
          >
            {/* Drag handle */}
            <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>

            {editingId === cat._id ? (
              /* Edit mode */
              <div className="flex-1 flex items-center gap-2">
                {/* Emoji selector button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(showEmojiPicker === cat._id ? null : cat._id)}
                    className="text-xl w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:border-blue-400 transition-colors"
                  >
                    {editEmoji}
                  </button>
                  {showEmojiPicker === cat._id && (
                    <EmojiPicker
                      onSelect={(e) => { setEditEmoji(e); setShowEmojiPicker(null); }}
                      onClose={() => setShowEmojiPicker(null)}
                    />
                  )}
                </div>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(cat._id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-800"
                />
                <button
                  onClick={() => handleSaveEdit(cat._id)}
                  disabled={saving}
                  className="text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              /* View mode */
              <>
                <span className="text-xl w-8 text-center">{cat.emoji}</span>
                <span className="flex-1 text-sm font-medium text-slate-800 capitalize">{cat.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingId(cat._id); setEditName(cat.name); setEditEmoji(cat.emoji); }}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Rename"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </li>
        ))}

        {categories.length === 0 && (
          <li className="text-center py-6 text-sm text-slate-400">No categories yet — add one below</li>
        )}
      </ul>

      {/* Add new category form */}
      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          {/* Emoji picker for new category */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(showEmojiPicker === 'add' ? null : 'add')}
              className="text-xl w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:border-blue-400 transition-colors"
            >
              {addEmoji}
            </button>
            {showEmojiPicker === 'add' && (
              <EmojiPicker
                onSelect={(e) => { setAddEmoji(e); setShowEmojiPicker(null); }}
                onClose={() => setShowEmojiPicker(null)}
              />
            )}
          </div>
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="New category name..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={saving || !addName.trim()}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Emoji picker popover ──────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-2 w-48"
    >
      <div className="grid grid-cols-7 gap-1">
        {FOOD_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-6 h-6 text-base flex items-center justify-center hover:bg-slate-100 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
