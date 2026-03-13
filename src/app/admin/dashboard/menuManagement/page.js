'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CategoryManager from '@/components/CategoryManager';

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ sm }) {
  return (
    <svg
      className={`animate-spin ${sm ? 'w-4 h-4' : 'w-5 h-5'} text-current`}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 ${colors[toast.type] || colors.info} text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl`}>
      {toast.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
      {toast.type === 'error'   && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>}
      {toast.msg}
    </div>
  );
}

// ── Input / Textarea / Select shared styles ───────────────────────────────────
const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all';

// ── Item card (grid mode) ─────────────────────────────────────────────────────
function ItemCard({ item, onEdit, onDelete, categoryEmoji }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-slate-100 flex-shrink-0">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">🍽️</span>
          </div>
        )}
        {/* Overlay actions on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              await onDelete(item._id);
              setDeleting(false);
            }}
            className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            {deleting ? <Spinner sm /> : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
        {item.bestseller && (
          <div className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            🔥 Best
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 leading-snug flex-1">{item.name}</h3>
          <span className="text-sm font-bold text-slate-900 flex-shrink-0">₹{item.price}</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-3">
          {item.description || <span className="italic">No description</span>}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
            {categoryEmoji} {item.category}
          </span>
          <button
            onClick={() => onEdit(item)}
            className="text-xs font-semibold text-orange-500 hover:text-orange-700 transition-colors"
          >
            Edit →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Item row (list mode) ──────────────────────────────────────────────────────
function ItemRow({ item, onEdit, onDelete, categoryEmoji }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 px-4 py-3 hover:shadow-sm hover:border-slate-200 transition-all duration-150 group">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🍽️</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-slate-900 text-sm truncate">{item.name}</span>
          {item.bestseller && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">🔥 Best</span>}
        </div>
        <p className="text-xs text-slate-400 truncate">{item.description || 'No description'}</p>
      </div>
      <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize flex-shrink-0 hidden sm:block">
        {categoryEmoji} {item.category}
      </span>
      <span className="font-bold text-slate-900 text-sm flex-shrink-0 w-16 text-right">₹{item.price}</span>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={async () => { setDeleting(true); await onDelete(item._id); setDeleting(false); }}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
        >
          {deleting ? <Spinner sm /> : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ── Item Drawer (add + edit) ──────────────────────────────────────────────────
function ItemDrawer({ open, onClose, editingItem, restaurantCategories, onSaved }) {
  const isEdit = !!editingItem;
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    setImagePreview(isEdit ? editingItem.imageUrl : null);
    if (!open) setSaving(false);
  }, [open, editingItem, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const form = e.target;

    try {
      let imageUrl = isEdit ? editingItem.imageUrl : undefined;

      if (form.image.files[0]) {
        const fd = new FormData();
        fd.append('file', form.image.files[0]);
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await up.json();
        if (!upData.success) { onSaved(null, 'Image upload failed'); setSaving(false); return; }
        imageUrl = upData.url;
      }

      const payload = {
        name: form.itemName.value,
        description: form.description.value,
        price: form.price.value,
        category: form.category.value,
        bestseller: form.bestseller.checked,
        ...(imageUrl ? { imageUrl } : {}),
      };

      const url    = isEdit ? `/api/menu/${editingItem._id}` : '/api/menu';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data   = await res.json();

      if (data.success) {
        onSaved(data.item || data, null, isEdit);
        onClose();
      } else {
        onSaved(null, data.error || 'Something went wrong');
      }
    } catch {
      onSaved(null, 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{isEdit ? `Editing: ${editingItem?.name}` : 'Fill in the details below'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Photo</label>
            <div
              className="relative h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors"
              onClick={() => formRef.current?.querySelector('input[name=image]')?.click()}
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="preview" fill className="object-cover rounded-2xl" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Click to upload photo</span>
                  <span className="text-xs">JPG, PNG, WEBP</span>
                </div>
              )}
              {imagePreview && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm font-semibold opacity-0 hover:opacity-100 transition-opacity">Change photo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) setImagePreview(URL.createObjectURL(f));
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Item Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="itemName"
              defaultValue={isEdit ? editingItem?.name : ''}
              key={editingItem?._id ?? 'add-name'}
              placeholder="e.g. Butter Chicken"
              required
              className={inputCls}
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Price (₹) <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="price"
                defaultValue={isEdit ? editingItem?.price : ''}
                key={editingItem?._id ?? 'add-price'}
                placeholder="0"
                required
                min="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Category <span className="text-red-400">*</span></label>
              <select
                name="category"
                defaultValue={isEdit ? editingItem?.category : ''}
                key={editingItem?._id ?? 'add-cat'}
                required
                className={inputCls}
              >
                <option value="">Select…</option>
                {restaurantCategories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.emoji} {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</label>
            <textarea
              name="description"
              defaultValue={isEdit ? editingItem?.description : ''}
              key={editingItem?._id ?? 'add-desc'}
              rows={3}
              placeholder="Short description of the dish…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Bestseller toggle */}
          <label className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
            <input
              type="checkbox"
              name="bestseller"
              defaultChecked={isEdit ? editingItem?.bestseller : false}
              key={editingItem?._id ?? 'add-bs'}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">🔥 Mark as Bestseller</p>
              <p className="text-xs text-slate-500">Shows a badge on this item</p>
            </div>
          </label>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
          >
            {saving && <Spinner sm />}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="h-44 bg-slate-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MenuManagement() {
  const [items, setItems]                         = useState([]);
  const [restaurant, setRestaurant]               = useState(null);
  const [restaurantCategories, setRestaurantCats] = useState([]);
  const [categoryFilter, setCategoryFilter]       = useState('all');
  const [search, setSearch]                       = useState('');
  const [viewMode, setViewMode]                   = useState('grid');
  const [drawerOpen, setDrawerOpen]               = useState(false);
  const [editingItem, setEditingItem]             = useState(null);
  const [initialLoading, setInitialLoading]       = useState(true);
  const [toast, setToast]                         = useState(null);
  const [showCategories, setShowCategories]       = useState(false);
  const router = useRouter();
  const toastTimer = useRef(null);

  useEffect(() => { fetchMenuItems(); }, []);

  function showToast(msg, type = 'success') {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function fetchMenuItems() {
    try {
      const res = await fetch('/api/menu');
      if (res.status === 401) { router.replace('/login'); return; }
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          if (data.restaurant.categories?.length) setRestaurantCats(data.restaurant.categories);
        }
      }
    } finally {
      setInitialLoading(false);
    }
  }

  async function deleteItem(id) {
    const res  = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      showToast('Item deleted');
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  }

  function openAdd() { setEditingItem(null); setDrawerOpen(true); }
  function openEdit(item) { setEditingItem(item); setDrawerOpen(true); }

  function handleSaved(item, error, isEdit) {
    if (error) { showToast(error, 'error'); return; }
    if (isEdit) {
      setItems((prev) => prev.map((i) => (i._id === item._id ? item : i)));
      showToast('Item updated');
    } else {
      setItems((prev) => [item, ...prev]);
      showToast('Item added');
    }
  }

  async function handleLogout() {
    if (!window.confirm('Log out?')) return;
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  // Derived — all category comparisons are normalised to lowercase to avoid
  // case-mismatch bugs (e.g. stored "Special" vs filter id "special").
  const catMap = Object.fromEntries(
    restaurantCategories.map((c) => [c.name.toLowerCase(), c.emoji])
  );
  const filterPills = [
    { id: 'all', name: 'All', icon: '📋', count: items.length },
    ...restaurantCategories.map((c) => ({
      id: c.name.toLowerCase(),
      name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
      icon: c.emoji,
      count: items.filter((i) => i.category?.toLowerCase() === c.name.toLowerCase()).length,
    })),
  ];

  const filteredItems = items.filter((item) => {
    const matchCat    = categoryFilter === 'all' || item.category?.toLowerCase() === categoryFilter;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const bestsellers = items.filter((i) => i.bestseller).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

          {/* Back */}
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:block">Dashboard</span>
          </Link>

          <span className="text-slate-300 font-light text-lg hidden sm:block">/</span>

          {/* Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🍽️</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate">{restaurant?.name || 'Menu Management'}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Manage your menu items</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-xl transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:block">Add Item</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Items',  value: items.length,     icon: '🍽️', color: 'bg-blue-50   text-blue-700'   },
            { label: 'Bestsellers',  value: bestsellers,      icon: '🔥', color: 'bg-amber-50  text-amber-700'  },
            { label: 'Categories',   value: restaurantCategories.length, icon: '🗂️', color: 'bg-purple-50 text-purple-700' },
            { label: 'Filtered Now', value: filteredItems.length, icon: '🔍', color: 'bg-emerald-50 text-emerald-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${s.color}`}>{s.icon}</span>
              <div>
                <p className="text-xl font-black text-slate-900 leading-none">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col gap-3">

          {/* Search + view toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {filterPills.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  categoryFilter === cat.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  categoryFilter === cat.id ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Category Manager (collapsible) ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🗂️</span>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Manage Categories</p>
                <p className="text-xs text-slate-400">{restaurantCategories.length} categories · drag to reorder</p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCategories && (
            <div className="border-t border-slate-100">
              <CategoryManager onCategoriesChange={setRestaurantCats} />
            </div>
          )}
        </div>

        {/* ── Menu Items ──────────────────────────────────────────────────── */}
        <div>
          {/* Section label */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-500">
              {filteredItems.length === 0
                ? 'No items'
                : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`}
              {(search || categoryFilter !== 'all') && (
                <button onClick={() => { setSearch(''); setCategoryFilter('all'); }} className="ml-2 text-orange-500 hover:text-orange-700 font-semibold">
                  Clear filters ×
                </button>
              )}
            </p>
          </div>

          {initialLoading ? (
            <SkeletonGrid />
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                {search ? '🔍' : '🍽️'}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {search ? 'No items match your search' : 'No items yet'}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {search
                  ? `Try different keywords or clear the search`
                  : `Add your first menu item to get started`}
              </p>
              {!search && (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Item
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={deleteItem}
                  categoryEmoji={catMap[item.category?.toLowerCase()] || ''}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={deleteItem}
                  categoryEmoji={catMap[item.category?.toLowerCase()] || ''}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      <ItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingItem={editingItem}
        restaurantCategories={restaurantCategories}
        onSaved={handleSaved}
      />

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <Toast toast={toast} />
    </div>
  );
}
