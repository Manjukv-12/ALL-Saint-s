import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Info, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { AdminSessionBar, AdminSignInPanel } from '@/components/admin/AdminSignInPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Layout from '@/components/layout/Layout';
import SectionTitle from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  createPastLeader,
  deletePastLeader,
  getAllPastLeadersAdmin,
  mediaImageUrl,
  updatePastLeader,
  type PastLeaderGroupKey,
  type PastLeaderRow,
  verifyAdminApiKey,
} from '@/lib/api';
import { compressImageForUpload } from '@/lib/imageCompression';

const DISPLAY_SECTION_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

function normalizeDisplaySection(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(value)));
}

function emptyForm() {
  return {
    group_key: 'vicars-assistant-vicar' as PastLeaderGroupKey,
    name: '',
    role_title: 'Vicar',
    role_custom: '',
    display_section: 1,
    duration: '',
    sort_order: 0,
    is_active: true,
    image: null as File | null,
  };
}

async function readSingleImageFromInput(
  e: ChangeEvent<HTMLInputElement>,
  onDone: (file: File | null) => void,
  onMessage: (message: string) => void,
) {
  const picked = e.target.files?.[0] ?? null;
  if (!picked) return onDone(null);
  onMessage('Compressing image...');
  try {
    const compressed = await compressImageForUpload(picked, {
      maxBytes: 1_000_000,
      maxDimension: 1400,
      quality: 0.84,
    });
    onDone(compressed);
    onMessage('');
  } catch {
    onDone(picked);
    onMessage('');
  }
}

const PastLeadersAdminPage = () => {
  const qc = useQueryClient();
  const auth = useAdminAuth(verifyAdminApiKey);
  const verifiedKey = auth.verifiedKey;
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editingStoredImage, setEditingStoredImage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [message, setMessage] = useState('');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const listQuery = useQuery({
    queryKey: ['past-leaders', 'admin', verifiedKey ?? ''],
    queryFn: () => getAllPastLeadersAdmin(verifiedKey!),
    enabled: !!verifiedKey,
    retry: false,
  });

  const items = listQuery.data ?? [];
  const vicars = useMemo(
    () => [...items].filter((x) => x.group_key === 'vicars-assistant-vicar').sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [items],
  );
  const committees = useMemo(
    () => [...items].filter((x) => x.group_key === 'committee').sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [items],
  );
  const vicarBlocks = useMemo(
    () => [...new Set(vicars.map((x) => Math.max(1, x.display_section ?? 1)))].sort((a, b) => a - b),
    [vicars],
  );
  const committeeBlocks = useMemo(
    () => [...new Set(committees.map((x) => Math.max(1, x.display_section ?? 1)))].sort((a, b) => a - b),
    [committees],
  );

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['past-leaders'] });
    listQuery.refetch();
  };

  const roleToSave =
    form.role_title === 'Other' ? form.role_custom.trim() : form.role_title.trim();

  const createMut = useMutation({
    mutationFn: () =>
      createPastLeader(verifiedKey!, {
        ...form,
        role_title: roleToSave,
      }),
    onSuccess: () => {
      setMessage('Past leader created');
      setEditingId(null);
      setEditingStoredImage(null);
      setForm(emptyForm());
      refresh();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (id: number) =>
      updatePastLeader(verifiedKey!, id, {
        ...form,
        role_title: roleToSave,
      }),
    onSuccess: () => {
      setMessage('Past leader updated');
      setEditingId(null);
      setEditingStoredImage(null);
      setForm(emptyForm());
      refresh();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deletePastLeader(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Past leader deleted');
      refresh();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;
  const selectedGroupLabel = form.group_key === 'committee' ? 'Committee' : 'Vicars & Asst. Vicar';

  const persistReorder = async (group: PastLeaderGroupKey, draggedId: number, targetId: number) => {
    if (!verifiedKey || draggedId === targetId) return;
    const source = group === 'vicars-assistant-vicar' ? vicars : committees;
    const from = source.findIndex((x) => x.id === draggedId);
    const to = source.findIndex((x) => x.id === targetId);
    if (from === -1 || to === -1 || from === to) return;

    const reordered = [...source];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const changed = reordered
      .map((row, idx) => ({ row, nextSortOrder: idx }))
      .filter(({ row, nextSortOrder }) => row.sort_order !== nextSortOrder);
    if (changed.length === 0) return;

    try {
      await Promise.all(
        changed.map(({ row, nextSortOrder }) =>
          updatePastLeader(verifiedKey, row.id, {
            group_key: row.group_key,
            name: row.name ?? '',
            role_title: row.role_title ?? '',
            display_section: row.display_section ?? 1,
            duration: row.duration,
            sort_order: nextSortOrder,
            is_active: !!row.is_active,
            image: null,
          }),
        ),
      );
      setMessage('Order updated');
      refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to reorder');
    }
  };

  const startNew = (group: PastLeaderGroupKey) => {
    const source = group === 'vicars-assistant-vicar' ? vicars : committees;
    const maxSo = source.reduce((acc, x) => Math.max(acc, x.sort_order), -1);
    setEditingId('new');
    setEditingStoredImage(null);
    setForm({
      ...emptyForm(),
      group_key: group,
      sort_order: maxSo + 1,
      name: group === 'committee' ? '' : '',
      role_title: group === 'committee' ? '' : 'Vicar',
      role_custom: '',
      display_section: 1,
    });
  };

  const startEdit = (row: PastLeaderRow) => {
    setEditingId(row.id);
    setEditingStoredImage(row.image);
    setForm({
      group_key: row.group_key,
      name: row.name ?? '',
      role_title:
        row.group_key === 'committee'
          ? ''
          : row.role_title === 'Vicar' || row.role_title === 'Asst. Vicar'
            ? row.role_title
            : 'Other',
      role_custom:
        row.group_key === 'committee'
          ? ''
          : row.role_title === 'Vicar' || row.role_title === 'Asst. Vicar'
            ? ''
            : (row.role_title ?? ''),
      display_section: normalizeDisplaySection(row.display_section ?? 1),
      duration: row.duration,
      sort_order: row.sort_order,
      is_active: !!row.is_active,
      image: null,
    });
  };

  useEffect(() => {
    if (editingId === null) return;
    const id = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(id);
  }, [editingId]);

  return (
    <Layout>
      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Past Leaders admin"
            subtitle="Manage past Vicars/Asst. Vicars and Committee archives with photos, term period, grouping, and order."
            light
          />
        </div>
      </section>

      <section className="py-8 sm:py-10 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-6">
          {!verifiedKey ? (
            <AdminSignInPanel
              title="Past leaders admin"
              unlockLabel="Verify & continue"
              keyInput={auth.keyInput}
              onKeyInputChange={auth.setKeyInput}
              pending={auth.pending}
              error={auth.error}
              onUnlock={() => void auth.verifyWithKey(auth.keyInput)}
            />
          ) : (
            <>
              <AdminSessionBar onLock={() => { auth.lock(); setEditingId(null); setMessage(''); }} />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching || busy}>
                  {listQuery.isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
                </Button>
              </div>

              {editingId !== null && (
                <form
                  ref={formRef}
                  className="border rounded-xl p-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!form.duration.trim()) return setMessage('Duration is required');
                    if (form.group_key === 'vicars-assistant-vicar' && !form.name.trim()) return setMessage('Name is required for Vicars & Asst. Vicar');
                    if (form.group_key === 'vicars-assistant-vicar' && !roleToSave) return setMessage('Role is required for Vicars & Asst. Vicar');
                    if (editingId === 'new') createMut.mutate();
                    else updateMut.mutate(editingId);
                  }}
                >
                  <p className="font-medium">{editingId === 'new' ? 'Add new past leader entry' : `Edit entry #${editingId}`}</p>
                  <div>
                    <Label className="text-xs text-muted-foreground">Section</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-background mt-1"
                      value={form.group_key}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          group_key: e.target.value as PastLeaderGroupKey,
                          name: e.target.value === 'committee' ? '' : f.name,
                          role_title: e.target.value === 'committee' ? '' : f.role_title || 'Vicar',
                          role_custom: e.target.value === 'committee' ? '' : f.role_custom,
                        }))
                      }
                    >
                      <option value="vicars-assistant-vicar">Vicars & Asst. Vicar</option>
                      <option value="committee">Committee</option>
                    </select>
                  </div>
                  {form.group_key === 'vicars-assistant-vicar' ? (
                    <>
                      <input
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      />
                      <div>
                        <Label className="text-xs text-muted-foreground">Role</Label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-background mt-1"
                          value={form.role_title}
                          onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))}
                        >
                          <option value="Vicar">Vicar</option>
                          <option value="Asst. Vicar">Asst. Vicar</option>
                          <option value="Other">Other (custom)</option>
                        </select>
                      </div>
                      {form.role_title === 'Other' ? (
                        <input
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                          placeholder="Custom role"
                          value={form.role_custom}
                          onChange={(e) => setForm((f) => ({ ...f, role_custom: e.target.value }))}
                        />
                      ) : null}
                    </>
                  ) : null}
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="Term period (example: 2018 - 2021)"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info size={12} />
                      Display block (line group)
                    </Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-background mt-1"
                      value={normalizeDisplaySection(form.display_section)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          display_section: normalizeDisplaySection(parseInt(e.target.value, 10)),
                        }))
                      }
                    >
                      {DISPLAY_SECTION_OPTIONS.map((block) => (
                        <option key={block} value={block}>
                          {`Group ${block}`}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Applies to: <span className="font-medium text-foreground">{selectedGroupLabel}</span> section only.
                      Purpose: group entries on the public page. Same group number means same visual line/section
                      (example: Group 1, Group 2, ... Group 10).
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Suggested setup: use <span className="font-medium text-foreground">Group 1</span> for the first/main visible row,
                      then use Group 2, Group 3, etc. for the next rows.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="past-leader-photo" className="text-xs text-muted-foreground">Photo</Label>
                    <input
                      id="past-leader-photo"
                      className="mt-1 block w-full text-sm"
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.gif,.avif,image/png,image/jpeg,image/webp,image/gif,image/avif"
                      onChange={(e) => {
                        void readSingleImageFromInput(
                          e,
                          (file) => setForm((f) => ({ ...f, image: file })),
                          setMessage,
                        );
                      }}
                    />
                    {(form.image || editingStoredImage) ? (
                      <div className="mt-2 w-full aspect-[16/9] rounded-md border bg-muted overflow-hidden flex items-center justify-center">
                        <img
                          src={form.image ? URL.createObjectURL(form.image) : (mediaImageUrl(editingStoredImage) ?? '')}
                          alt=""
                          className="w-full h-full object-contain object-center"
                        />
                      </div>
                    ) : null}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                    Show this entry on public page
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={busy}>
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); setEditingStoredImage(null); setForm(emptyForm()); }}>
                      Cancel editing
                    </Button>
                  </div>
                </form>
              )}

              {message && <p className="text-sm rounded-lg border border-border bg-muted/40 px-3 py-2">{message}</p>}

              <div className="space-y-8">
                <div className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">Vicars & Asst. Vicar</p>
                    <Button size="sm" onClick={() => startNew('vicars-assistant-vicar')}><Plus className="w-4 h-4 mr-1" />Add entry</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Blocks used in this section: {vicarBlocks.length > 0 ? vicarBlocks.map((b) => `Block ${b}`).join(', ') : 'none'}.
                  </p>
                  <p className="text-xs text-muted-foreground">Tip: drag and drop cards to change display order.</p>
                  {vicars.map((row) => (
                    <div
                      key={row.id}
                      draggable={!busy}
                      onDragStart={() => setDraggingId(row.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggingId === null || draggingId === row.id || busy) return;
                        persistReorder('vicars-assistant-vicar', draggingId, row.id);
                      }}
                      className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border/70 ${
                        draggingId === row.id ? 'opacity-60' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="text-muted-foreground/70 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted"
                        aria-label="Drag to reorder"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      {mediaImageUrl(row.image) ? (
                        <img src={mediaImageUrl(row.image) ?? ''} alt={row.name ?? ''} className="w-14 h-14 rounded-md object-cover" />
                      ) : null}
                      <div className="flex-1 min-w-[180px]">
                        <p className="font-medium">{row.name ?? '—'}</p>
                        <p className="text-xs text-foreground/70">{row.role_title ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">Block {row.display_section ?? 1} · {row.duration}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => startEdit(row)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => confirm(`Delete ${row.name ?? 'item'}?`) && deleteMut.mutate(row.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {vicars.length === 0 ? <p className="text-sm text-muted-foreground">No entries added yet.</p> : null}
                </div>

                <div className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">Committee</p>
                    <Button size="sm" onClick={() => startNew('committee')}><Plus className="w-4 h-4 mr-1" />Add entry</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Blocks used in this section: {committeeBlocks.length > 0 ? committeeBlocks.map((b) => `Block ${b}`).join(', ') : 'none'}.
                  </p>
                  <p className="text-xs text-muted-foreground">Tip: drag and drop cards to change display order.</p>
                  {committees.map((row) => (
                    <div
                      key={row.id}
                      draggable={!busy}
                      onDragStart={() => setDraggingId(row.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggingId === null || draggingId === row.id || busy) return;
                        persistReorder('committee', draggingId, row.id);
                      }}
                      className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border/70 ${
                        draggingId === row.id ? 'opacity-60' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="text-muted-foreground/70 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted"
                        aria-label="Drag to reorder"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      {mediaImageUrl(row.image) ? (
                        <img src={mediaImageUrl(row.image) ?? ''} alt="Committee" className="w-24 h-16 rounded-md object-cover" />
                      ) : null}
                      <div className="flex-1 min-w-[180px]">
                        <p className="font-medium">Committee</p>
                        <p className="text-xs text-muted-foreground">Block {row.display_section ?? 1} · {row.duration}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => startEdit(row)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => confirm('Delete this committee item?') && deleteMut.mutate(row.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {committees.length === 0 ? <p className="text-sm text-muted-foreground">No entries added yet.</p> : null}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PastLeadersAdminPage;
