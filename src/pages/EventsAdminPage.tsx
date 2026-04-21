import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Key, Loader2, Plus, RefreshCw, Trash2, Pencil, LogOut } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  API_BASE,
  createEvent,
  deleteEvent,
  getAllEventsAdmin,
  updateEvent,
  type ChurchEventRow,
} from '@/lib/api';
import stainedGlass from '@/assets/stained-glass.jpg';

const ADMIN_KEY_ENV = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim() ?? '';

const emptyForm = () => ({
  title: '',
  time: '',
  location: '',
  description: '',
  is_active: true,
  imageFile: null as File | null,
});

const EventsAdminPage = () => {
  const queryClient = useQueryClient();
  const autoUnlockStarted = useRef(false);

  const [keyInput, setKeyInput] = useState('');
  const [verifiedKey, setVerifiedKey] = useState<string | null>(null);
  const [gatePending, setGatePending] = useState(false);
  const [gateError, setGateError] = useState('');

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [message, setMessage] = useState('');

  const verifyWithKey = useCallback(
    async (rawKey: string) => {
      const k = rawKey.trim();
      if (!k) {
        setGateError('Enter the admin API key (same as config.php ADMIN_API_KEY).');
        return;
      }
      setGatePending(true);
      setGateError('');
      try {
        await queryClient.prefetchQuery({
          queryKey: ['events', 'admin', k],
          queryFn: () => getAllEventsAdmin(k),
          retry: false,
          staleTime: 30_000,
        });
        setVerifiedKey(k);
      } catch (e) {
        setVerifiedKey(null);
        queryClient.removeQueries({ queryKey: ['events', 'admin', k] });
        setGateError(e instanceof Error ? e.message : 'Could not verify key. Check the key and try again.');
      } finally {
        setGatePending(false);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (autoUnlockStarted.current || !ADMIN_KEY_ENV) return;
    autoUnlockStarted.current = true;
    void verifyWithKey(ADMIN_KEY_ENV);
  }, [verifyWithKey]);

  const listQuery = useQuery({
    queryKey: ['events', 'admin', verifiedKey ?? ''],
    queryFn: () => getAllEventsAdmin(verifiedKey!),
    enabled: !!verifiedKey,
    retry: false,
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['events'] });

  const lockSession = () => {
    setVerifiedKey(null);
    setEditingId(null);
    setForm(emptyForm());
    setMessage('');
    queryClient.removeQueries({ queryKey: ['events', 'admin'] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      createEvent(verifiedKey!, {
        title: form.title,
        time: form.time,
        location: form.location,
        description: form.description,
        is_active: form.is_active,
        image: form.imageFile,
      }),
    onSuccess: () => {
      setMessage('Event created.');
      setEditingId(null);
      setForm(emptyForm());
      invalidate();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      updateEvent(verifiedKey!, id, {
        title: form.title,
        time: form.time,
        location: form.location,
        description: form.description,
        is_active: form.is_active,
        image: form.imageFile ?? undefined,
      }),
    onSuccess: () => {
      setMessage('Event saved.');
      setEditingId(null);
      setForm(emptyForm());
      invalidate();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ row, next }: { row: ChurchEventRow; next: boolean }) =>
      updateEvent(verifiedKey!, row.id, {
        title: row.title,
        time: row.time ?? '',
        location: row.location ?? '',
        description: row.description ?? '',
        is_active: next,
      }),
    onSuccess: (_, { next }) => {
      setMessage(next ? 'Event is now visible on the public Events page.' : 'Event hidden from the public page (admin only).');
      invalidate();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteEvent(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Event deleted.');
      invalidate();
      listQuery.refetch();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const startEdit = (row: ChurchEventRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      time: row.time ?? '',
      location: row.location ?? '',
      description: row.description ?? '',
      is_active: !!row.is_active,
      imageFile: null,
    });
    setMessage('');
  };

  const startNew = () => {
    setEditingId('new');
    setForm(emptyForm());
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setMessage('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!form.title.trim()) {
      setMessage('Title is required.');
      return;
    }
    if (editingId === 'new') {
      createMut.mutate();
    } else if (typeof editingId === 'number') {
      updateMut.mutate({ id: editingId });
    }
  };

  const busy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending || toggleActiveMut.isPending;

  const showAdminPanel = !!verifiedKey;
  const envAutoUnlockInFlight = !!ADMIN_KEY_ENV && gatePending && !verifiedKey;

  return (
    <Layout>
      <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={stainedGlass} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <SectionTitle
              title="Events admin"
              subtitle="Unlock with your API key to manage events. Only Active events appear on the public Events page; Hidden stays private until you enable again."
              light
            />
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <ScrollReveal>
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
              {!showAdminPanel && (
                <div className="space-y-4 border border-border rounded-xl p-4">
                  <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                    <Key size={18} /> Sign in with admin key
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The event list and create / edit / delete actions are shown only after the server accepts your key.
                  </p>
                  {envAutoUnlockInFlight && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking key from environment…
                    </div>
                  )}
                  {(!ADMIN_KEY_ENV || (!envAutoUnlockInFlight && gateError)) && (
                    <div className="space-y-2">
                      {!ADMIN_KEY_ENV && (
                        <label className="text-sm font-medium text-muted-foreground">Admin API key</label>
                      )}
                      {ADMIN_KEY_ENV && gateError && (
                        <p className="text-xs text-muted-foreground">
                          The key from <code className="px-1 rounded bg-muted">.env</code> was rejected. Paste the correct key from{' '}
                          <code className="px-1 rounded bg-muted">config.php</code> (remember quotes if it contains <code className="px-1 rounded bg-muted">#</code>).
                        </p>
                      )}
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Same as config.php ADMIN_API_KEY"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                        disabled={gatePending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void verifyWithKey(keyInput);
                          }
                        }}
                      />
                      <Button type="button" onClick={() => void verifyWithKey(keyInput)} disabled={gatePending}>
                        {gatePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock events admin'}
                      </Button>
                    </div>
                  )}
                  {gateError && <p className="text-sm text-destructive">{gateError}</p>}
                </div>
              )}

              {showAdminPanel && (
                <>
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <p className="text-sm text-muted-foreground">
                      Signed in · <span className="text-foreground font-medium">Active</span> = on public Events page ·{' '}
                      <span className="text-foreground font-medium">Hidden</span> = admin only
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={lockSession}>
                      <LogOut className="w-4 h-4 mr-1" /> Lock session
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => listQuery.refetch()}
                      disabled={listQuery.isFetching || busy}
                    >
                      {listQuery.isFetching ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      Refresh list
                    </Button>
                    <Button type="button" onClick={startNew} disabled={busy}>
                      <Plus className="w-4 h-4 mr-1" /> New event
                    </Button>
                    <ChurchButton variant="ghost" size="sm" asLink href="/events">
                      View public Events page
                    </ChurchButton>
                  </div>

                  {message && (
                    <p
                      className={`text-sm ${
                        message.includes('fail') ||
                        message.includes('required') ||
                        message.includes('Unauthorized') ||
                        message.includes('error')
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message}
                    </p>
                  )}

                  {listQuery.isError && (
                    <p className="text-sm text-destructive">
                      {listQuery.error instanceof Error ? listQuery.error.message : 'Failed to load'}
                    </p>
                  )}

                  {editingId !== null && (
                    <form onSubmit={submit} className="space-y-4 border border-border rounded-xl p-4">
                      <h3 className="font-serif text-lg font-semibold">
                        {editingId === 'new' ? 'New event' : `Edit event #${editingId}`}
                      </h3>
                      <div>
                        <label className="text-xs text-muted-foreground">Title *</label>
                        <input
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background"
                          value={form.title}
                          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Time</label>
                        <input
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background"
                          value={form.time}
                          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Location</label>
                        <input
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background"
                          value={form.location}
                          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Description</label>
                        <textarea
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background min-h-[100px]"
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">Active on public site</p>
                          <p className="text-xs text-muted-foreground">Turn off to hide this event from visitors (you can still edit it here).</p>
                        </div>
                        <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Image (JPG/PNG, optional on edit)</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          className="w-full mt-1 text-sm"
                          onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={busy}>
                          {busy ? <Loader2 className="animate-spin w-4 h-4" /> : editingId === 'new' ? 'Create' : 'Save'}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  <ul className="space-y-3">
                    {(listQuery.data ?? []).map((row) => {
                      const rowToggleBusy =
                        toggleActiveMut.isPending && toggleActiveMut.variables?.row.id === row.id;
                      return (
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30"
                        >
                          {row.image && (
                            <img
                              src={
                                `${API_BASE.replace(/\/$/, '')}/api/event-uploads/${encodeURIComponent(row.image)}` +
                                (!row.is_active && verifiedKey ? `?key=${encodeURIComponent(verifiedKey)}` : '')
                              }
                              alt=""
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-[140px]">
                            <p className="font-medium">{row.title}</p>
                            <p className="text-xs text-muted-foreground">id {row.id}</p>
                          </div>
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <Switch
                              checked={!!row.is_active}
                              disabled={rowToggleBusy || busy}
                              onCheckedChange={(next) => toggleActiveMut.mutate({ row, next })}
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {row.is_active ? 'Active' : 'Hidden'}
                            </span>
                            {rowToggleBusy && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
                          </div>
                          <Button type="button" size="sm" variant="outline" onClick={() => startEdit(row)} disabled={busy}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`Delete “${row.title}”?`)) deleteMut.mutate(row.id);
                            }}
                            disabled={busy}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>

                  {listQuery.isSuccess && (listQuery.data?.length ?? 0) === 0 && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar size={16} /> No events yet. Click “New event” to add one.
                    </p>
                  )}
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default EventsAdminPage;
