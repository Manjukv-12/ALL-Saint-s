import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GripVertical, ImagePlus, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { AdminSessionBar, AdminSignInPanel } from '@/components/admin/AdminSignInPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Layout from '@/components/layout/Layout';
import SectionTitle from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import {
  bulkUploadGalleryImages,
  createGalleryVideo,
  createGalleryVideoCategory,
  createGalleryCategory,
  deleteGalleryVideoCategory,
  deleteGalleryVideo,
  deleteGalleryCategory,
  deleteGalleryImage,
  getAllGalleryAdmin,
  getAllGalleryVideoCategoriesAdmin,
  getAllGalleryVideosAdmin,
  mediaImageUrl,
  updateGalleryVideoCategory,
  updateGalleryVideo,
  updateGalleryCategory,
  verifyAdminApiKey,
} from '@/lib/api';
import { compressImagesForUpload } from '@/lib/imageCompression';

const GalleryAdminPage = () => {
  const qc = useQueryClient();
  const auth = useAdminAuth(verifyAdminApiKey);
  const verifiedKey = auth.verifiedKey;
  const [categoryForm, setCategoryForm] = useState({ name: '', sort_order: 0, is_active: true });
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [uploadForm, setUploadForm] = useState({
    category_id: 0,
    files: [] as File[],
    sort_order: 0,
    is_active: true,
  });
  const [message, setMessage] = useState('');
  const [videoForm, setVideoForm] = useState({
    category_id: 0,
    title: '',
    video_url: '',
    sort_order: 0,
    is_active: true,
  });
  const [editVideoId, setEditVideoId] = useState<number | null>(null);
  const [draggingVideoId, setDraggingVideoId] = useState<number | null>(null);
  const [draggingPhotoCategoryId, setDraggingPhotoCategoryId] = useState<number | null>(null);
  const [draggingVideoCategoryId, setDraggingVideoCategoryId] = useState<number | null>(null);
  const [videoCategoryForm, setVideoCategoryForm] = useState({
    name: '',
    subtitle: '',
    sort_order: 0,
    is_active: true,
  });
  const [editVideoCategoryId, setEditVideoCategoryId] = useState<number | null>(null);
  const photoCategoryFormRef = useRef<HTMLFormElement | null>(null);
  const videoCategoryFormRef = useRef<HTMLFormElement | null>(null);
  const videoFormRef = useRef<HTMLFormElement | null>(null);

  const scrollToForm = (el: HTMLElement | null) => {
    if (!el) return;
    const headerOffsetPx = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffsetPx;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const listQuery = useQuery({
    queryKey: ['gallery', 'admin', verifiedKey ?? ''],
    queryFn: () => getAllGalleryAdmin(verifiedKey!),
    enabled: !!verifiedKey,
    retry: false,
  });
  const videosQuery = useQuery({
    queryKey: ['gallery-videos', 'admin', verifiedKey ?? ''],
    queryFn: () => getAllGalleryVideosAdmin(verifiedKey!),
    enabled: !!verifiedKey,
    retry: false,
  });
  const videoCategoriesQuery = useQuery({
    queryKey: ['gallery-video-categories', 'admin', verifiedKey ?? ''],
    queryFn: () => getAllGalleryVideoCategoriesAdmin(verifiedKey!),
    enabled: !!verifiedKey,
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['gallery'] });

  const saveCategoryMut = useMutation({
    mutationFn: async () => {
      if (!verifiedKey) return;
      if (editCategoryId) {
        return updateGalleryCategory(verifiedKey, editCategoryId, categoryForm);
      }
      const maxSort = categories.reduce((acc, c) => Math.max(acc, c.sort_order), -1);
      return createGalleryCategory(verifiedKey, { ...categoryForm, sort_order: maxSort + 1 });
    },
    onSuccess: () => {
      setMessage(editCategoryId ? 'Category updated' : 'Category created');
      setEditCategoryId(null);
      setCategoryForm({ name: '', sort_order: 0, is_active: true });
      refresh();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const uploadMut = useMutation({
    mutationFn: async () => {
      if (!verifiedKey) return;
      const compressedFiles = await compressImagesForUpload(uploadForm.files, {
        maxBytes: 1_200_000,
        maxDimension: 1800,
        quality: 0.84,
      });
      return bulkUploadGalleryImages(verifiedKey, {
        ...uploadForm,
        files: compressedFiles,
        alt_text: '',
        caption: '',
      });
    },
    onSuccess: () => {
      setMessage('Bulk upload completed');
      setUploadForm({ category_id: 0, files: [], sort_order: 0, is_active: true });
      refresh();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const deleteCategoryMut = useMutation({
    mutationFn: (id: number) => deleteGalleryCategory(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Category deleted');
      refresh();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const deleteImageMut = useMutation({
    mutationFn: (id: number) => deleteGalleryImage(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Image deleted');
      refresh();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });
  const saveVideoMut = useMutation({
    mutationFn: async () => {
      if (!verifiedKey) return;
      if (editVideoId) return updateGalleryVideo(verifiedKey, editVideoId, videoForm);
      const maxSort = videos.reduce((acc, v) => Math.max(acc, v.sort_order), -1);
      return createGalleryVideo(verifiedKey, { ...videoForm, sort_order: maxSort + 1 });
    },
    onSuccess: () => {
      setMessage(editVideoId ? 'Video updated' : 'Video created');
      setEditVideoId(null);
      setVideoForm({ category_id: 0, title: '', video_url: '', sort_order: 0, is_active: true });
      videosQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });
  const saveVideoCategoryMut = useMutation({
    mutationFn: async () => {
      if (!verifiedKey) return;
      if (editVideoCategoryId) return updateGalleryVideoCategory(verifiedKey, editVideoCategoryId, videoCategoryForm);
      const maxSort = videoCategories.reduce((acc, c) => Math.max(acc, c.sort_order), -1);
      return createGalleryVideoCategory(verifiedKey, { ...videoCategoryForm, sort_order: maxSort + 1 });
    },
    onSuccess: () => {
      setMessage(editVideoCategoryId ? 'Video category updated' : 'Video category created');
      setEditVideoCategoryId(null);
      setVideoCategoryForm({ name: '', subtitle: '', sort_order: 0, is_active: true });
      videoCategoriesQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });
  const deleteVideoCategoryMut = useMutation({
    mutationFn: (id: number) => deleteGalleryVideoCategory(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Video category deleted');
      videoCategoriesQuery.refetch();
      videosQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });
  const deleteVideoMut = useMutation({
    mutationFn: (id: number) => deleteGalleryVideo(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Video deleted');
      videosQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const busy =
    saveCategoryMut.isPending ||
    uploadMut.isPending ||
    deleteCategoryMut.isPending ||
    deleteImageMut.isPending ||
    saveVideoMut.isPending ||
    deleteVideoMut.isPending ||
    saveVideoCategoryMut.isPending ||
    deleteVideoCategoryMut.isPending;
  const categories = listQuery.data ?? [];
  const videos = videosQuery.data ?? [];
  const videoCategories = videoCategoriesQuery.data ?? [];
  const totalImages = useMemo(() => categories.reduce((n, c) => n + c.images.length, 0), [categories]);

  const reorderVideos = async (draggedId: number, targetId: number) => {
    if (!verifiedKey || draggedId === targetId) return;
    const from = videos.findIndex((v) => v.id === draggedId);
    const to = videos.findIndex((v) => v.id === targetId);
    if (from === -1 || to === -1 || from === to) return;

    const reordered = [...videos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const changed = reordered
      .map((v, idx) => ({ v, sort: idx }))
      .filter(({ v, sort }) => v.sort_order !== sort);
    if (changed.length === 0) return;

    try {
      await Promise.all(changed.map(({ v, sort }) =>
        updateGalleryVideo(verifiedKey, v.id, {
          category_id:
            v.category_id ??
            (videoCategories.find((vc) => vc.name.trim().toLowerCase() === (v.category_name ?? '').trim().toLowerCase())?.id ?? 0),
          title: v.title,
          video_url: v.video_url,
          thumbnail_url: v.thumbnail_url ?? '',
          sort_order: sort,
          is_active: !!v.is_active,
        })));
      setMessage('Video order updated');
      videosQuery.refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to reorder videos');
    }
  };

  const reorderPhotoCategories = async (draggedId: number, targetId: number) => {
    if (!verifiedKey || draggedId === targetId) return;
    const from = categories.findIndex((c) => c.id === draggedId);
    const to = categories.findIndex((c) => c.id === targetId);
    if (from === -1 || to === -1 || from === to) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const changed = reordered.map((c, idx) => ({ c, sort: idx })).filter(({ c, sort }) => c.sort_order !== sort);
    if (changed.length === 0) return;
    try {
      await Promise.all(
        changed.map(({ c, sort }) =>
          updateGalleryCategory(verifiedKey, c.id, { name: c.name, sort_order: sort, is_active: !!c.is_active }),
        ),
      );
      setMessage('Photo category order updated');
      listQuery.refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to reorder photo categories');
    }
  };

  const reorderVideoCategories = async (draggedId: number, targetId: number) => {
    if (!verifiedKey || draggedId === targetId) return;
    const from = videoCategories.findIndex((c) => c.id === draggedId);
    const to = videoCategories.findIndex((c) => c.id === targetId);
    if (from === -1 || to === -1 || from === to) return;
    const reordered = [...videoCategories];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const changed = reordered.map((c, idx) => ({ c, sort: idx })).filter(({ c, sort }) => c.sort_order !== sort);
    if (changed.length === 0) return;
    try {
      await Promise.all(
        changed.map(({ c, sort }) =>
          updateGalleryVideoCategory(verifiedKey, c.id, {
            name: c.name,
            subtitle: c.subtitle ?? '',
            sort_order: sort,
            is_active: !!c.is_active,
          }),
        ),
      );
      setMessage('Video category order updated');
      videoCategoriesQuery.refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to reorder video categories');
    }
  };

  useEffect(() => {
    if (editCategoryId === null) return;
    const t = window.setTimeout(() => {
      scrollToForm(photoCategoryFormRef.current);
    }, 60);
    return () => window.clearTimeout(t);
  }, [editCategoryId]);

  useEffect(() => {
    if (editVideoCategoryId === null) return;
    const t = window.setTimeout(() => {
      scrollToForm(videoCategoryFormRef.current);
    }, 60);
    return () => window.clearTimeout(t);
  }, [editVideoCategoryId]);

  useEffect(() => {
    if (editVideoId === null) return;
    const t = window.setTimeout(() => {
      scrollToForm(videoFormRef.current);
    }, 60);
    return () => window.clearTimeout(t);
  }, [editVideoId]);

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle title="Gallery management" subtitle="Create categories and bulk upload images from admin." light />
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl space-y-6">
          {!verifiedKey && (
            <AdminSignInPanel
              title="Gallery admin"
              unlockLabel="Unlock gallery admin"
              keyInput={auth.keyInput}
              onKeyInputChange={auth.setKeyInput}
              pending={auth.pending}
              error={auth.error}
              onUnlock={() => void auth.verifyWithKey(auth.keyInput)}
            />
          )}

          {verifiedKey && (
            <>
              <AdminSessionBar onLock={() => { auth.lock(); setMessage(''); }} />
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="outline" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching || busy}>
                  {listQuery.isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
                </Button>
                <p className="text-sm text-muted-foreground">Categories: {categories.length} · Images: {totalImages}</p>
              </div>

              <div className="border rounded-xl p-4 space-y-4 bg-card">
                <div>
                  <p className="font-semibold">Photo Gallery Management</p>
                  <p className="text-xs text-muted-foreground mt-1">Step 1: create photo category, then Step 2: upload photos into that category.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                <form
                  ref={photoCategoryFormRef}
                  className="border rounded-xl p-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!categoryForm.name.trim()) return setMessage('Category name required');
                    saveCategoryMut.mutate();
                  }}
                >
                  <p className="font-medium flex items-center gap-2"><Plus size={16} /> {editCategoryId ? 'Step 1 · Edit photo category' : 'Step 1 · New photo category'}</p>
                  <input className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={categoryForm.is_active} onChange={(e) => setCategoryForm((f) => ({ ...f, is_active: e.target.checked }))} />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={busy}>{saveCategoryMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save category'}</Button>
                    {editCategoryId && <Button type="button" variant="outline" onClick={() => { setEditCategoryId(null); setCategoryForm({ name: '', sort_order: 0, is_active: true }); }}>Cancel</Button>}
                  </div>
                </form>

                <form
                  className="border rounded-xl p-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!uploadForm.category_id) return setMessage('Select category');
                    if (uploadForm.files.length === 0) return setMessage('Select at least one image');
                    uploadMut.mutate();
                  }}
                >
                  <p className="font-medium flex items-center gap-2"><ImagePlus size={16} /> Step 2 · Upload photos</p>
                  <select className="w-full px-3 py-2 border rounded-lg bg-background" value={uploadForm.category_id} onChange={(e) => setUploadForm((f) => ({ ...f, category_id: Number(e.target.value) }))}>
                    <option value={0}>Select photo category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input className="w-full px-3 py-2 border rounded-lg bg-background" type="file" accept="image/*" multiple onChange={(e) => setUploadForm((f) => ({ ...f, files: Array.from(e.target.files ?? []) }))} />
                  <Button type="submit" disabled={busy}>{uploadMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload files'}</Button>
                </form>
                </div>
                <div className="border rounded-xl p-4 space-y-2">
                  <p className="font-medium">Edit photo categories</p>
                  <p className="text-xs text-muted-foreground">Use Edit to modify name/active status. Drag rows to change order.</p>
                  {categories.length > 0 ? (
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <div
                          key={`photo-cat-edit-${cat.id}`}
                          draggable={!busy}
                          onDragStart={() => setDraggingPhotoCategoryId(cat.id)}
                          onDragEnd={() => setDraggingPhotoCategoryId(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (busy || draggingPhotoCategoryId === null || draggingPhotoCategoryId === cat.id) return;
                            reorderPhotoCategories(draggingPhotoCategoryId, cat.id);
                          }}
                          className={`border rounded-lg p-3 flex flex-wrap gap-2 items-center justify-between ${
                            draggingPhotoCategoryId === cat.id ? 'opacity-60' : ''
                          }`}
                        >
                          <button
                            type="button"
                            className="text-muted-foreground/70 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted"
                            aria-label="Drag to reorder photo categories"
                            title="Drag to reorder photo categories"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <div className="min-w-[220px] flex-1">
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cat.is_active ? 'Active' : 'Hidden'} · Images: {cat.images.length}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditCategoryId(cat.id); setCategoryForm({ name: cat.name, sort_order: cat.sort_order, is_active: !!cat.is_active }); }}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => confirm(`Delete ${cat.name}?`) && deleteCategoryMut.mutate(cat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No photo categories yet.</p>}
                </div>
              </div>

              {message && <p className="text-sm text-muted-foreground">{message}</p>}

              <div className="border rounded-xl p-4 space-y-4 bg-card">
                <div>
                  <p className="font-semibold">Video Gallery Management</p>
                  <p className="text-xs text-muted-foreground mt-1">Step 1: create video category, Step 2: add video links, Step 3: drag to reorder videos.</p>
                </div>
                <form
                  ref={videoCategoryFormRef}
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!videoCategoryForm.name.trim()) return setMessage('Video category name required');
                    saveVideoCategoryMut.mutate();
                  }}
                >
                  <p className="font-medium flex items-center gap-2"><Plus size={16} /> {editVideoCategoryId ? 'Step 1 · Edit video category' : 'Step 1 · New video category'}</p>
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="Video category name (example: Sermon Videos)"
                    value={videoCategoryForm.name}
                    onChange={(e) => setVideoCategoryForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="Category subtitle (optional)"
                    value={videoCategoryForm.subtitle}
                    onChange={(e) => setVideoCategoryForm((f) => ({ ...f, subtitle: e.target.value }))}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={videoCategoryForm.is_active} onChange={(e) => setVideoCategoryForm((f) => ({ ...f, is_active: e.target.checked }))} />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={busy}>{saveVideoCategoryMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save video category'}</Button>
                    {editVideoCategoryId ? (
                      <Button type="button" variant="outline" onClick={() => { setEditVideoCategoryId(null); setVideoCategoryForm({ name: '', subtitle: '', sort_order: 0, is_active: true }); }}>
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </form>
                {videoCategories.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Drag and drop video categories to change order.</p>
                    {videoCategories.map((vc) => (
                      <div
                        key={vc.id}
                        draggable={!busy}
                        onDragStart={() => setDraggingVideoCategoryId(vc.id)}
                        onDragEnd={() => setDraggingVideoCategoryId(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (busy || draggingVideoCategoryId === null || draggingVideoCategoryId === vc.id) return;
                          reorderVideoCategories(draggingVideoCategoryId, vc.id);
                        }}
                        className={`border rounded-lg p-3 flex flex-wrap gap-2 items-center justify-between ${
                          draggingVideoCategoryId === vc.id ? 'opacity-60' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="text-muted-foreground/70 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted"
                          aria-label="Drag to reorder video categories"
                          title="Drag to reorder video categories"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <div className="min-w-[220px] flex-1">
                          <p className="font-medium">{vc.name}</p>
                          {vc.subtitle ? <p className="text-xs text-muted-foreground">{vc.subtitle}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditVideoCategoryId(vc.id); setVideoCategoryForm({ name: vc.name, subtitle: vc.subtitle ?? '', sort_order: vc.sort_order, is_active: !!vc.is_active }); }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => confirm(`Delete ${vc.name}?`) && deleteVideoCategoryMut.mutate(vc.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No video categories yet.</p>}

                <form
                  ref={videoFormRef}
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!videoForm.category_id) return setMessage('Select video category');
                    if (!videoForm.title.trim()) return setMessage('Video title required');
                    if (!videoForm.video_url.trim()) return setMessage('Video link required');
                    saveVideoMut.mutate();
                  }}
                >
                  <p className="font-medium flex items-center gap-2"><Plus size={16} /> {editVideoId ? 'Step 2 · Edit video link' : 'Step 2 · Add video link'}</p>
                  <select className="w-full px-3 py-2 border rounded-lg bg-background" value={videoForm.category_id} onChange={(e) => setVideoForm((f) => ({ ...f, category_id: Number(e.target.value) }))}>
                    <option value={0}>Select video category</option>
                    {videoCategories.map((vc) => <option key={vc.id} value={vc.id}>{vc.name}</option>)}
                  </select>
                  <input className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Video title" value={videoForm.title} onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))} />
                  <input className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Video URL (YouTube or direct)" value={videoForm.video_url} onChange={(e) => setVideoForm((f) => ({ ...f, video_url: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    Thumbnail is auto-generated from YouTube link.
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={videoForm.is_active} onChange={(e) => setVideoForm((f) => ({ ...f, is_active: e.target.checked }))} />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={busy}>{saveVideoMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save video'}</Button>
                    {editVideoId ? (
                      <Button type="button" variant="outline" onClick={() => { setEditVideoId(null); setVideoForm({ category_id: 0, title: '', video_url: '', sort_order: 0, is_active: true }); }}>
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </form>
                {videos.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Drag and drop videos below to change display order.</p>
                    {videos.map((v) => (
                      <div
                        key={v.id}
                        draggable={!busy}
                        onDragStart={() => setDraggingVideoId(v.id)}
                        onDragEnd={() => setDraggingVideoId(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (busy || draggingVideoId === null || draggingVideoId === v.id) return;
                          reorderVideos(draggingVideoId, v.id);
                        }}
                        className={`border rounded-lg p-3 flex flex-wrap gap-2 items-center justify-between ${draggingVideoId === v.id ? 'opacity-60' : ''}`}
                      >
                        <button
                          type="button"
                          className="text-muted-foreground/70 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted"
                          aria-label="Drag to reorder videos"
                          title="Drag to reorder videos"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <div className="min-w-[220px] flex-1">
                          <p className="text-xs text-muted-foreground">{v.category_name?.trim() || 'General Videos'}</p>
                          <p className="font-medium">{v.title}</p>
                          <p className="text-xs text-muted-foreground break-all">{v.video_url}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditVideoId(v.id); setVideoForm({ category_id: v.category_id ?? 0, title: v.title, video_url: v.video_url, sort_order: v.sort_order, is_active: !!v.is_active }); }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => confirm(`Delete ${v.title}?`) && deleteVideoMut.mutate(v.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No video links yet.</p>}
              </div>

            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default GalleryAdminPage;
