import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cross, ExternalLink, Loader2, Plus, RefreshCw } from 'lucide-react';
import { AdminSessionBar, AdminSignInPanel } from '@/components/admin/AdminSignInPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Layout from '@/components/layout/Layout';
import SectionTitle from '@/components/common/SectionTitle';
import { LeadershipSectionMemberList } from '@/components/admin/LeadershipSectionMemberList';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  createLeadershipMember,
  deleteLeadershipMember,
  getAllLeadershipAdmin,
  getAllLeadershipSectionsAdmin,
  getLeadershipYears,
  mediaImageUrl,
  upsertLeadershipSection,
  updateLeadershipMember,
  verifyAdminApiKey,
} from '@/lib/api';
import type { LeadershipMemberRow } from '@/lib/api';
import {
  LEADERSHIP_SECTION_ORDER,
  leadershipDefaultSections,
  leadershipSectionAllowsMembers,
} from '@/lib/leadershipPage';
import { compressImageForUpload } from '@/lib/imageCompression';
import { sanitizePhoneDigits } from '@/lib/phoneInput';

/** Sections where a wide / hero image is uploaded here (shown on the public Leadership page). */
function leadershipSectionUsesPhotoUpload(sectionKey: string | null): boolean {
  return sectionKey === 'church-committee' || sectionKey === 'our-bishop';
}

function makeEmptyForm(year: number) {
  return {
    section_key: 'church-leadership',
    name: '',
    role_title: '',
    phone: '',
    bio: '',
    sort_order: 0,
    is_active: true,
    year,
    image: null as File | null,
  };
}

async function handleCompressedImagePick(
  e: ChangeEvent<HTMLInputElement>,
  onDone: (file: File | null) => void,
  onMessage: (message: string) => void,
  options: { maxBytes: number; maxDimension: number; quality: number },
) {
  const picked = e.target.files?.[0] ?? null;
  if (!picked) return onDone(null);
  onMessage('Compressing image...');
  try {
    const compressed = await compressImageForUpload(picked, options);
    onDone(compressed);
    onMessage('');
  } catch {
    onDone(picked);
    onMessage('');
  }
}

const LeadershipAdminPage = () => {
  const qc = useQueryClient();
  const auth = useAdminAuth(verifyAdminApiKey);
  const verifiedKey = auth.verifiedKey;
  const [adminYear, setAdminYear] = useState(() => new Date().getFullYear());
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [form, setForm] = useState(() => makeEmptyForm(new Date().getFullYear()));
  const [sectionForm, setSectionForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });
  const [message, setMessage] = useState('');
  /** Filename or URL from API when editing — for preview only (new upload uses `form.image`). */
  const [memberStoredImage, setMemberStoredImage] = useState<string | null>(null);
  /** Pending file for section save (`church-committee` / `our-bishop` only). */
  const [sectionImageFile, setSectionImageFile] = useState<File | null>(null);
  const sectionEditorRef = useRef<HTMLFormElement>(null);
  const memberFormRef = useRef<HTMLFormElement>(null);
  /** Bumped when opening the member editor so scroll runs even if `editingId` was already `'new'`. */
  const [memberFormScrollTick, setMemberFormScrollTick] = useState(0);

  const newPhotoObjectUrl = useMemo(() => {
    if (!form.image) return null;
    return URL.createObjectURL(form.image);
  }, [form.image]);

  useEffect(() => {
    return () => {
      if (newPhotoObjectUrl) URL.revokeObjectURL(newPhotoObjectUrl);
    };
  }, [newPhotoObjectUrl]);

  const memberPhotoPreviewSrc =
    newPhotoObjectUrl ??
    (memberStoredImage?.trim()
      ? mediaImageUrl(memberStoredImage.trim(), verifiedKey ?? undefined)
      : null);

  const sectionNewPhotoObjectUrl = useMemo(() => {
    if (!sectionImageFile) return null;
    return URL.createObjectURL(sectionImageFile);
  }, [sectionImageFile]);

  useEffect(() => {
    return () => {
      if (sectionNewPhotoObjectUrl) URL.revokeObjectURL(sectionNewPhotoObjectUrl);
    };
  }, [sectionNewPhotoObjectUrl]);

  const yearsQuery = useQuery({
    queryKey: ['leadership-years'],
    queryFn: getLeadershipYears,
    enabled: !!verifiedKey,
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ['leadership', 'admin', verifiedKey ?? '', adminYear],
    queryFn: () => getAllLeadershipAdmin(verifiedKey!, adminYear),
    enabled: !!verifiedKey,
    retry: false,
  });
  const sectionsQuery = useQuery({
    queryKey: ['leadership-sections', 'admin', verifiedKey ?? '', adminYear],
    queryFn: () => getAllLeadershipSectionsAdmin(verifiedKey!, adminYear),
    enabled: !!verifiedKey,
    retry: false,
  });

  useEffect(() => {
    if (!verifiedKey) return;
    getLeadershipYears()
      .then((years) => {
        setAdminYear(years.current_year);
        setForm(makeEmptyForm(years.current_year));
      })
      .catch(() => {});
  }, [verifiedKey]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['leadership'] });
    qc.invalidateQueries({ queryKey: ['leadership-sections'] });
    listQuery.refetch();
    sectionsQuery.refetch();
  };

  /** Same roster year drives members + all section intros (Our Bishop, committee, etc.). */
  const applyRosterYear = (nextYear: number) => {
    setAdminYear(nextYear);
    setEditingSectionKey(null);
    setSectionImageFile(null);
  };

  useEffect(() => {
    if (editingId === 'new') {
      setForm((f) => ({ ...f, year: adminYear }));
    }
  }, [adminYear, editingId]);

  const saveMut = useMutation({
    mutationFn: () => {
      if (editingId === 'new') return createLeadershipMember(verifiedKey!, form);
      if (typeof editingId === 'number') return updateLeadershipMember(verifiedKey!, editingId, form);
      return Promise.resolve();
    },
    onSuccess: () => {
      setMessage(editingId === 'new' ? 'Member created' : 'Member updated');
      setEditingId(null);
      setMemberStoredImage(null);
      setForm(makeEmptyForm(adminYear));
      refresh();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteLeadershipMember(verifiedKey!, id),
    onSuccess: () => {
      setMessage('Member deleted');
      refresh();
    },
    onError: (e: Error) => setMessage(e.message),
  });
  const saveSectionMut = useMutation({
    mutationFn: (opts?: { clear_image?: boolean }) => {
      const clear = !!opts?.clear_image;
      return upsertLeadershipSection(verifiedKey!, editingSectionKey!, {
        ...sectionForm,
        year: adminYear,
        ...(clear ? { clear_image: true } : sectionImageFile ? { image: sectionImageFile } : {}),
      });
    },
    onSuccess: (_data, variables) => {
      setSectionImageFile(null);
      if (variables?.clear_image) {
        setMessage('Section photo removed from database');
        refresh();
        return;
      }
      setMessage('Section updated');
      setEditingSectionKey(null);
      setSectionForm({ title: '', subtitle: '', description: '', sort_order: 0, is_active: true });
      refresh();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const members = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const sectionsForUi = useMemo(() => {
    const raw = sectionsQuery.data;
    if (raw && raw.length > 0) return raw;
    if (sectionsQuery.isPending || sectionsQuery.isFetching) return [];
    return leadershipDefaultSections();
  }, [sectionsQuery.data, sectionsQuery.isPending, sectionsQuery.isFetching]);

  const sectionKeyForMember = useCallback(
    (m: LeadershipMemberRow) =>
      (m.section_key && m.section_key.trim()) ||
      sectionsForUi.find((s) => s.title === m.section_name)?.section_key ||
      'church-leadership',
    [sectionsForUi],
  );

  const editingSectionStoredImage = useMemo(() => {
    if (!editingSectionKey) return null;
    const raw = sectionsForUi.find((s) => s.section_key === editingSectionKey)?.image;
    if (typeof raw !== 'string' || !raw.trim()) return null;
    return raw.trim();
  }, [editingSectionKey, sectionsForUi]);

  const sectionPhotoPreviewSrc =
    sectionNewPhotoObjectUrl ??
    (editingSectionStoredImage ? mediaImageUrl(editingSectionStoredImage, verifiedKey ?? undefined) : null);

  const membersGrouped = useMemo(() => {
    const groups = new Map<string, LeadershipMemberRow[]>();
    for (const m of members) {
      const k = sectionKeyForMember(m);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(m);
    }
    for (const arr of groups.values()) {
      arr.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }
    const orderedKeys = [
      ...LEADERSHIP_SECTION_ORDER.filter((k) => groups.has(k)),
      ...[...groups.keys()].filter((k) => !LEADERSHIP_SECTION_ORDER.includes(k as (typeof LEADERSHIP_SECTION_ORDER)[number])),
    ];
    return orderedKeys.map((key) => {
      const meta = sectionsForUi.find((s) => s.section_key === key);
      return {
        key,
        title: meta?.title ?? key,
        subtitle: meta?.subtitle ?? null,
        members: groups.get(key) ?? [],
      };
    });
  }, [members, sectionsForUi, sectionKeyForMember]);

  /** Always includes Church Committee (narrative-only) even when it has zero members. */
  const adminMemberSectionKeys = useMemo(() => {
    const keys = new Set<string>();
    membersGrouped.forEach((g) => keys.add(g.key));
    keys.add('church-committee');
    keys.add('our-bishop');
    const ordered: string[] = [];
    for (const k of LEADERSHIP_SECTION_ORDER) {
      if (keys.has(k)) ordered.push(k);
    }
    for (const k of keys) {
      if (!LEADERSHIP_SECTION_ORDER.includes(k as (typeof LEADERSHIP_SECTION_ORDER)[number])) ordered.push(k);
    }
    return ordered;
  }, [membersGrouped]);

  const memberSectionOptions = useMemo(
    () => sectionsForUi.filter((s) => leadershipSectionAllowsMembers(s.section_key)),
    [sectionsForUi],
  );

  useEffect(() => {
    if (!leadershipSectionAllowsMembers(form.section_key) && memberSectionOptions.length > 0) {
      const fallback = memberSectionOptions[0]!.section_key;
      setForm((f) => ({ ...f, section_key: fallback }));
    }
  }, [form.section_key, memberSectionOptions]);

  const busy = saveMut.isPending || deleteMut.isPending || saveSectionMut.isPending;

  useEffect(() => {
    if (editingSectionKey && sectionEditorRef.current) {
      sectionEditorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [editingSectionKey]);

  /** Fixed header (~64–80px) + small gap so the form isn’t hidden under the nav. */
  const scrollMemberFormIntoView = useCallback(() => {
    const el = memberFormRef.current;
    if (!el) return;
    const headerOffsetPx = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffsetPx;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (editingId === null) return;
    const t = window.setTimeout(scrollMemberFormIntoView, 120);
    return () => window.clearTimeout(t);
  }, [editingId, memberFormScrollTick, scrollMemberFormIntoView]);

  return (
    <Layout>
      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-16 bg-primary">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-full min-w-0">
          <SectionTitle
            title="Leadership Admin"
            subtitle="Manage section titles, text, photos, and members in one place."
            light
          />
        </div>
      </section>

      <section className="py-8 sm:py-10 bg-background">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-5xl w-full min-w-0 space-y-6 overflow-x-hidden">
          {!verifiedKey ? (
            <AdminSignInPanel
              title="Leadership admin"
              unlockLabel="Open admin"
              keyInput={auth.keyInput}
              onKeyInputChange={auth.setKeyInput}
              pending={auth.pending}
              error={auth.error}
              onUnlock={() => void auth.verifyWithKey(auth.keyInput)}
            />
          ) : (
            <>
              <AdminSessionBar onLock={() => { auth.lock(); setEditingId(null); setMessage(''); }} />
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span>
                  Preview:{' '}
                  <Link to="/leadership" className="font-medium text-primary inline-flex items-center gap-1 hover:underline">
                    Open Leadership <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </span>
                <span className="text-xs text-muted-foreground">Section order and layout are applied automatically.</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-end border rounded-xl p-4 bg-card">
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <Button variant="outline" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching || busy}>
                    {listQuery.isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId('new');
                      setMemberStoredImage(null);
                      setForm(makeEmptyForm(adminYear));
                      setMemberFormScrollTick((n) => n + 1);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Member
                  </Button>
                </div>
              </div>

              <div className="border rounded-xl p-4 space-y-3">
                <p className="font-medium">1 · Section Title and Intro (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Edit the title, subtitle, and intro text shown on the public page.{' '}
                  <span className="font-medium text-foreground">Our Bishop</span> and{' '}
                  <span className="font-medium text-foreground">Church Committee</span> use this section content and section
                  photo only (no member list). For other sections, add people in step 3.
                </p>
                <div>
                  <Label className="text-xs text-muted-foreground">Section</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-background mt-1"
                    value={editingSectionKey ?? ''}
                    onChange={(e) => {
                      const key = e.target.value;
                      if (!key) {
                        setEditingSectionKey(null);
                        setSectionImageFile(null);
                        return;
                      }
                      const s = sectionsForUi.find((x) => x.section_key === key);
                      if (!s) return;
                      setEditingSectionKey(s.section_key);
                      setSectionImageFile(null);
                      setSectionForm({
                        title: s.title,
                        subtitle: s.subtitle ?? '',
                        description: s.description ?? '',
                        sort_order: s.sort_order,
                        is_active: !!s.is_active,
                      });
                    }}
                  >
                    <option value="">— Choose a section —</option>
                    {sectionsForUi.map((s) => (
                      <option key={s.section_key} value={s.section_key}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {editingSectionKey && (
                  <form
                    ref={sectionEditorRef}
                    className="border rounded-xl p-4 space-y-3 bg-muted/20"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!sectionForm.title.trim()) return setMessage('Section title is required');
                      saveSectionMut.mutate(undefined);
                    }}
                  >
                    <p className="font-medium">Editing section</p>
                    <div>
                      <label className="text-xs text-muted-foreground">Section title</label>
                      <input className="w-full px-3 py-2 border rounded-lg bg-background mt-1" placeholder="Title" value={sectionForm.title} onChange={(e) => setSectionForm((f) => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Section subtitle</label>
                      <input className="w-full px-3 py-2 border rounded-lg bg-background mt-1" placeholder="Subtitle" value={sectionForm.subtitle} onChange={(e) => setSectionForm((f) => ({ ...f, subtitle: e.target.value }))} />
                    </div>

                    {leadershipSectionUsesPhotoUpload(editingSectionKey) ? (
                      <div className="rounded-xl border-2 border-primary/25 bg-primary/5 p-3 sm:p-4 space-y-3 max-w-full min-w-0 overflow-hidden">
                        <p className="text-sm font-semibold text-foreground">Section photo (this is the image on the public page)</p>
                        {editingSectionKey === 'church-committee' ? (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload the committee group picture here. On the website it appears <span className="text-foreground/90">between</span> the first part of the description and the rest (see the note under the description box for text layout).
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload the large portrait for Our Bishop here if you are not using only the bishop member row photo.
                          </p>
                        )}
                        <div>
                          <Label htmlFor="leadership-section-photo" className="text-xs text-muted-foreground">
                            Choose image file
                          </Label>
                          <input
                            id="leadership-section-photo"
                            type="file"
                            accept="image/*"
                            className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm"
                            onChange={(e) => {
                              void handleCompressedImagePick(
                                e,
                                setSectionImageFile,
                                setMessage,
                                { maxBytes: 1_400_000, maxDimension: 2000, quality: 0.84 },
                              );
                            }}
                          />
                        </div>
                        {sectionPhotoPreviewSrc ? (
                          <div className="rounded-lg border border-border/70 bg-background p-2">
                          <p className="text-[11px] text-muted-foreground mb-2">{sectionImageFile ? 'New image preview' : 'Current image'}</p>
                            <img
                              src={sectionPhotoPreviewSrc}
                              alt=""
                              className="max-h-56 w-full object-contain rounded-md bg-muted/40"
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No photo yet. Choose a file, then click Save Section.</p>
                        )}
                        {editingSectionStoredImage ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => saveSectionMut.mutate({ clear_image: true })}
                          >
                            Remove Current Photo
                          </Button>
                        ) : null}
                      </div>
                    ) : null}

                    <div>
                      <label className="text-xs text-muted-foreground">Section description (public page)</label>
                      <textarea
                        className="w-full min-h-[10rem] sm:min-h-[12rem] max-w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm sm:text-base"
                        placeholder="Optional intro or long text (e.g. bishop bio, committee charter). Leave blank for member-only sections."
                        value={sectionForm.description}
                        onChange={(e) => setSectionForm((f) => ({ ...f, description: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Line breaks and multiple spaces are shown on the public page (not collapsed like normal web text).
                      </p>
                      {editingSectionKey === 'church-committee' ? (
                        <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl">
                          Church Committee: the group photo is placed in the middle of this text—after the first blank line, or after the first half of line-broken paragraphs if there is no blank line—or use a line containing only{' '}
                          <code className="text-[11px] bg-muted px-1 rounded font-mono">[[COMMITTEE_PHOTO]]</code> for an exact position.
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Section order on the website is fixed by the app; member photos are set per person below. For{' '}
                      <span className="font-mono text-foreground/80">our-bishop</span> and{' '}
                      <span className="font-mono text-foreground/80">church-committee</span>, use the highlighted Section photo box above to add or replace the image. Other sections do not use a section-wide photo on the public page.
                    </p>
                    {!leadershipSectionUsesPhotoUpload(editingSectionKey) && editingSectionStoredImage ? (
                      <div className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
                        <p className="text-xs text-muted-foreground">A file is still stored for this section from an older upload. Remove it if you do not need it.</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <img
                            src={mediaImageUrl(editingSectionStoredImage, verifiedKey ?? undefined) ?? ''}
                            alt=""
                            className="h-16 w-auto max-w-[200px] object-contain rounded border bg-muted"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => saveSectionMut.mutate({ clear_image: true })}
                          >
                            Remove stored image
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={sectionForm.is_active} onChange={(e) => setSectionForm((f) => ({ ...f, is_active: e.target.checked }))} />
                      Active
                    </label>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={busy}>
                        {saveSectionMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Section'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingSectionKey(null);
                          setSectionImageFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {editingId !== null && (
                <form
                  ref={memberFormRef}
                  id="leadership-admin-member-form"
                  className="border rounded-xl p-4 space-y-3 scroll-mt-28 sm:scroll-mt-32"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!form.name.trim()) return setMessage('Name is required');
                    saveMut.mutate();
                  }}
                >
                  <p className="font-medium">{editingId === 'new' ? '2 · Add Member' : `2 · Edit Member #${editingId}`}</p>
                  <div>
                    <Label className="text-xs text-muted-foreground">Section</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-background mt-1"
                      value={
                        memberSectionOptions.some((s) => s.section_key === form.section_key)
                          ? form.section_key
                          : (memberSectionOptions[0]?.section_key ?? form.section_key)
                      }
                      onChange={(e) => setForm((f) => ({ ...f, section_key: e.target.value }))}
                    >
                      {memberSectionOptions.map((s) => (
                        <option key={s.section_key} value={s.section_key}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  <input className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Role" value={form.role_title} onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))} />
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="Phone (10 digits)"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: sanitizePhoneDigits(e.target.value) }))
                    }
                    autoComplete="tel"
                  />
                  <textarea className="w-full px-3 py-2 border rounded-lg bg-background" placeholder="Bio (optional)" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                  <p className="text-xs text-muted-foreground -mt-1">
                    When filled, bio appears on the public Leadership page under that person (line breaks preserved). List order
                    is set by dragging people in section 3 — no manual sort field.
                  </p>
                  <div>
                    <Label htmlFor="leadership-member-photo" className="text-xs text-muted-foreground">
                      Photo (optional)
                    </Label>
                    <input
                      id="leadership-member-photo"
                      className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        void handleCompressedImagePick(
                          e,
                          (file) => setForm((f) => ({ ...f, image: file })),
                          setMessage,
                          { maxBytes: 1_000_000, maxDimension: 1400, quality: 0.84 },
                        );
                      }}
                    />
                  </div>
                  {memberPhotoPreviewSrc ? (
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-2 max-w-sm">
                      <p className="text-xs text-muted-foreground mb-2">{form.image ? 'New photo preview' : 'Current photo'}</p>
                      <img
                        src={memberPhotoPreviewSrc}
                        alt=""
                        className="max-h-52 w-full object-contain rounded-md bg-background"
                      />
                    </div>
                  ) : null}
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={busy}>
                      {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setMemberStoredImage(null);
                        setForm(makeEmptyForm(adminYear));
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {message && <p className="text-sm rounded-lg border border-border bg-muted/40 px-3 py-2 text-foreground">{message}</p>}

              <div className="space-y-8">
                <p className="font-medium text-base">
                  3 · Members in {adminYear} (drag to reorder). Our Bishop and Church Committee are content-only sections—see their
                  cards below.
                </p>
                {members.length === 0 && !listQuery.isFetching && (
                  <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6">
                    No members for {adminYear}. Use Add Member under each section below, or Add Member at the top (Our
                    Bishop and Church Committee do not use member lists).
                  </p>
                )}
                {adminMemberSectionKeys.map((sectionKey) => {
                  if (sectionKey === 'our-bishop') {
                    const meta = sectionsForUi.find((s) => s.section_key === 'our-bishop');
                    return (
                      <div
                        key="our-bishop"
                        className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-soft"
                      >
                        <div className="px-4 pt-8 pb-6 text-center border-b border-border/60 bg-muted/15">
                          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                            {meta?.title ?? 'Our Bishop'}
                          </h3>
                          {meta?.subtitle ? (
                            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed">{meta.subtitle}</p>
                          ) : null}
                          <p className="text-[11px] text-primary/80 mt-2">Section key: our-bishop</p>
                          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
                            Public page shows the heading, subtitle, biography text, and portrait from{' '}
                            <span className="font-medium text-foreground">1 · Section headings & intro</span> (section
                            description + Section photo). There is no Add member or roster list for Our Bishop.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (sectionKey === 'church-committee') {
                    const meta = sectionsForUi.find((s) => s.section_key === 'church-committee');
                    return (
                      <div
                        key="church-committee"
                        className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-soft"
                      >
                        <div className="px-4 pt-8 pb-6 text-center border-b border-border/60 bg-background">
                          <div className="flex justify-center items-center gap-3 mb-4">
                            <div className="h-px w-10 sm:w-12 bg-border" />
                            <Cross className="w-5 h-5 text-primary shrink-0" aria-hidden />
                            <div className="h-px w-10 sm:w-12 bg-border" />
                          </div>
                          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                            {meta?.title ?? 'Church Committee'}
                          </h3>
                          {meta?.subtitle ? (
                            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed">{meta.subtitle}</p>
                          ) : null}
                          <p className="text-[11px] text-primary/80 mt-2">Section key: church-committee</p>
                          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
                            Public page shows only this heading, intro text, and the wide section photo from{' '}
                            <span className="font-medium text-foreground">1 · Section headings & intro</span>. There is no
                            member grid or Add member for this section.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const group = membersGrouped.find((g) => g.key === sectionKey);
                  if (!group) return null;

                  return (
                  <div key={group.key} className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-soft">
                      <div className="px-4 pt-8 pb-5 text-center border-b border-border/60 bg-background">
                        <div className="flex justify-center items-center gap-3 mb-4">
                          <div className="h-px w-10 sm:w-12 bg-border" />
                          <Cross className="w-5 h-5 text-primary shrink-0" aria-hidden />
                          <div className="h-px w-10 sm:w-12 bg-border" />
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground tracking-tight">{group.title}</h3>
                        {group.subtitle ? (
                          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed">{group.subtitle}</p>
                        ) : null}
                        <p className="text-[11px] font-mono text-primary/80 mt-2">{group.key}</p>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {group.members.length} member{group.members.length === 1 ? '' : 's'}
                          </span>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              const maxSo = group.members.reduce((acc, x) => Math.max(acc, x.sort_order), -1);
                              setEditingId('new');
                              setMemberStoredImage(null);
                              setForm({ ...makeEmptyForm(adminYear), section_key: group.key, sort_order: maxSo + 1 });
                              setMemberFormScrollTick((n) => n + 1);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Member
                          </Button>
                        </div>
                      </div>
                    <LeadershipSectionMemberList
                      sectionKey={group.key}
                      sectionTitle={group.title}
                      members={group.members}
                      year={adminYear}
                      apiKey={verifiedKey}
                      disabled={busy}
                      onEdit={(m) => {
                        setEditingId(m.id);
                        setMemberStoredImage(typeof m.image === 'string' && m.image.trim() ? m.image.trim() : null);
                        setForm({
                          section_key: sectionKeyForMember(m),
                          name: m.name,
                          role_title: m.role_title ?? '',
                          phone: sanitizePhoneDigits(m.phone ?? ''),
                          bio: m.bio ?? '',
                          sort_order: m.sort_order,
                          is_active: !!m.is_active,
                          year: m.year ?? adminYear,
                          image: null,
                        });
                        setMemberFormScrollTick((n) => n + 1);
                      }}
                      onDelete={(m) => confirm(`Delete ${m.name}?`) && deleteMut.mutate(m.id)}
                      onReorderDone={refresh}
                    />
                  </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default LeadershipAdminPage;
