import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import type { LeadershipMemberRow, LeadershipSectionRow } from '@/lib/api';
import { getPublicLeadership, getPublicLeadershipSections } from '@/lib/api';
import { resolveLeadershipMemberImage, resolveLeadershipSectionImage } from '@/lib/leadershipLocalPhotos';
import {
  LEADERSHIP_SECTION_ORDER,
  layoutVariantForSectionKey,
  leadershipDefaultSections,
  leadershipSectionAllowsMembers,
} from '@/lib/leadershipPage';

import stainedGlass from '@/assets/stained-glass.jpg';

function formatBulletLine(text: string) {
  const cleaned = text.replace(/^[-*•]\s*/, '').trim();
  const colon = cleaned.indexOf(':');
  if (colon > 0 && colon < 48) {
    const label = cleaned.slice(0, colon + 1).trim();
    const rest = cleaned.slice(colon + 1).trim();
    return (
      <>
        <strong className="text-foreground font-semibold">{label}</strong>
        {rest ? ` ${rest}` : null}
      </>
    );
  }
  return cleaned;
}

/** Line starts a markdown-style bullet list item (bishop bio optional section). */
function isBishopBulletLine(line: string): boolean {
  return /^[-*•]\s+/.test(line.trimStart());
}

function renderBishopBio(bio: string) {
  const normalized = bio.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\s+$/, '');
  const lines = normalized.split('\n');

  let firstBulletIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isBishopBulletLine(lines[i])) {
      firstBulletIdx = i;
      break;
    }
  }

  // No bullet list: keep every newline and space exactly as typed (paragraphs, blank lines).
  if (firstBulletIdx === -1) {
    return (
      <div className="text-muted-foreground leading-relaxed font-sans text-sm sm:text-base break-words whitespace-pre-wrap w-full max-w-none mx-auto lg:mx-0 text-center lg:text-left">
        {normalized}
      </div>
    );
  }

  const introRaw = lines.slice(0, firstBulletIdx).join('\n').replace(/\s+$/, '');
  const bulletLines = lines.slice(firstBulletIdx);
  const bullets: string[] = [];
  let inBullets = false;
  for (const line of bulletLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const bulletText = trimmed.replace(/^[-*•]\s*/, '').trim();
    const looksLikeBullet = isBishopBulletLine(line) || (inBullets && trimmed.includes(':'));
    if (looksLikeBullet) {
      inBullets = true;
      bullets.push(bulletText);
    } else if (inBullets) {
      bullets.push(trimmed);
    }
  }

  return (
    <div className="space-y-4 text-muted-foreground font-sans text-sm sm:text-base break-words text-center lg:text-left">
      {introRaw ? (
        <div className="leading-relaxed w-full max-w-none mx-auto lg:mx-0 whitespace-pre-wrap">{introRaw}</div>
      ) : null}
      {bullets.length > 0 ? (
        <div className="space-y-2 w-full">
          <p className="text-sm font-medium text-foreground w-full max-w-none mx-auto lg:mx-0">
            Some of his notable contributions include:
          </p>
          <ul className="list-disc pl-5 space-y-3 leading-relaxed marker:text-primary/50 text-left inline-block mx-auto lg:mx-0 lg:block w-full max-w-none sm:max-w-none">
            {bullets.map((item) => (
              <li key={item}>{formatBulletLine(item)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function memberBioForCard(bio: string | null | undefined): string | null {
  const t = (bio ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\s+$/, '');
  return /\S/.test(t) ? t : null;
}

function MemberCardBio({ bio, className }: { bio: string | null | undefined; className: string }) {
  const t = memberBioForCard(bio);
  if (!t) return null;
  return <p className={className}>{t}</p>;
}

type SectionBlock = LeadershipSectionRow & { members: LeadershipMemberRow[] };

/** Optional line in Church Committee description: photo is placed here instead of after the first paragraph. */
const COMMITTEE_PHOTO_SPLIT = /\n?\s*\[\[COMMITTEE_PHOTO\]\]\s*\n?/;

/** Blank line between paragraphs (handles Windows `\r\n`). */
const BLANK_LINE_SPLIT = /\r?\n\s*\r?\n+/;

function normalizeLeadershipNewlines(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\s+$/, '');
}

/**
 * Church Committee copy: intro → photo → remainder (matches live site layout).
 * 1. Optional line `[[COMMITTEE_PHOTO]]` marks the insertion point.
 * 2. Else split on first blank line (double newline).
 * 3. Else split by single-newline paragraphs and place the photo after the first half (so the image sits in the middle of the text when there is no blank line).
 *
 * Avoids `.trim()` on body segments so spaces and indents typed in admin are kept.
 */
function splitCommitteeNarrative(raw: string | null | undefined): { before: string; after: string | null } {
  const text = normalizeLeadershipNewlines(raw ?? '');
  if (!/\S/.test(text)) return { before: '', after: null };
  if (COMMITTEE_PHOTO_SPLIT.test(text)) {
    const parts = text.split(COMMITTEE_PHOTO_SPLIT);
    const before = normalizeLeadershipNewlines(parts[0] ?? '');
    const after = parts.length > 1 ? normalizeLeadershipNewlines(parts.slice(1).join('\n\n')) : '';
    return { before, after: after || null };
  }
  const byBlank = text.split(BLANK_LINE_SPLIT);
  if (byBlank.length >= 2) {
    const before = normalizeLeadershipNewlines(byBlank[0] ?? '');
    const after = normalizeLeadershipNewlines(byBlank.slice(1).join('\n\n')) || null;
    return { before, after };
  }
  const paras = text.split(/\r?\n+/).filter((p) => /\S/.test(p));
  if (paras.length >= 2) {
    const mid = Math.ceil(paras.length / 2);
    return {
      before: paras.slice(0, mid).join('\n'),
      after: paras.slice(mid).join('\n') || null,
    };
  }
  return { before: text, after: null };
}

function sortMembers(a: LeadershipMemberRow, b: LeadershipMemberRow) {
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
  return a.id - b.id;
}

/** Wider than default `container` so leadership uses more viewport width while staying centered (`mx-auto`). */
const LEADERSHIP_PAGE_SHELL = 'w-full max-w-[min(100%,90rem)] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12';

const Leadership = () => {
  const [searchParams] = useSearchParams();

  const leadershipQuery = useQuery({
    queryKey: ['leadership', 'public', 'latest'],
    queryFn: () => getPublicLeadership(),
    staleTime: 60_000,
  });
  const sectionsQuery = useQuery({
    queryKey: ['leadership-sections', 'public', 'latest'],
    queryFn: () => getPublicLeadershipSections(),
    staleTime: 60_000,
  });

  const memberRows = leadershipQuery.data?.members ?? [];

  const titleToKey = useMemo(() => {
    const m = new Map<string, string>();
    (sectionsQuery.data ?? []).forEach((s) => m.set(s.title, s.section_key));
    return m;
  }, [sectionsQuery.data]);

  const membersByKey = useMemo(() => {
    const map = new Map<string, LeadershipMemberRow[]>();
    memberRows.forEach((m) => {
      const key = (m.section_key && m.section_key.trim()) || titleToKey.get(m.section_name) || '';
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    for (const arr of map.values()) {
      arr.sort(sortMembers);
    }
    return map;
  }, [memberRows, titleToKey]);

  const sectionBlocks: SectionBlock[] = useMemo(() => {
    const active = (sectionsQuery.data ?? [])
      .filter((s) => s.is_active === 1)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    const base: LeadershipSectionRow[] = active.length > 0 ? active : leadershipDefaultSections();
    const order = [...LEADERSHIP_SECTION_ORDER];
    const sorted = [...base].sort((a, b) => {
      const ia = order.indexOf(a.section_key as (typeof order)[number]);
      const ib = order.indexOf(b.section_key as (typeof order)[number]);
      if (ia === -1 && ib === -1) return a.sort_order - b.sort_order;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return sorted.map((sec) => ({
      ...sec,
      members: membersByKey.get(sec.section_key) ?? [],
    }));
  }, [sectionsQuery.data, membersByKey]);
  const isInitialLoading = leadershipQuery.isLoading || sectionsQuery.isLoading;

  /** Header nav may link with `?section=…`; scroll to that block (all sections stay visible). */
  useEffect(() => {
    const sec = (searchParams.get('section') ?? '').trim();
    if (!sec || sec === 'all') return;
    const id = `leadership-${sec}`;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(t);
  }, [searchParams, sectionBlocks]);

  const memberImg = (sec: SectionBlock, m: LeadershipMemberRow) =>
    resolveLeadershipMemberImage(sec.section_key, m.name, m.image);

  const renderMembersForLayout = (sec: SectionBlock) => {
    const members = sec.members ?? [];
    const layout = layoutVariantForSectionKey(sec.section_key);

    if (layout === 'diocesan') {
      return (
        <div className="mt-8 sm:mt-12 w-full max-w-[min(100%,85rem)] mx-auto min-w-0 px-1">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10">
          {members.map((m, index) => (
            <ScrollReveal key={m.id} delay={index * 0.08} className="w-[calc(50%-0.75rem)] max-w-[11rem] shrink-0 grow-0 sm:w-44 md:w-48 lg:w-52 sm:max-w-none">
              <div className="text-center min-w-0 bg-transparent py-2 mx-auto max-w-full">
                <div className="w-28 h-28 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden bg-muted flex items-center justify-center mb-3 sm:mb-4 ring-2 ring-white shadow-md shrink-0">
                  {memberImg(sec, m) ? (
                    <img src={memberImg(sec, m)!} alt={m.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <Users size={40} className="text-primary/50" />
                  )}
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-primary break-words min-h-[2.5rem]">{m.name}</h3>
                {m.role_title && <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-1">{m.role_title}</p>}
                <MemberCardBio
                  bio={m.bio}
                  className="font-sans text-[11px] sm:text-xs text-muted-foreground/90 mt-2 w-full leading-relaxed whitespace-pre-wrap break-words"
                />
              </div>
            </ScrollReveal>
          ))}
          </div>
        </div>
      );
    }

    if (layout === 'leadership') {
      return (
        <div className="rounded-2xl bg-muted/35 border border-border/50 px-3 py-8 sm:px-6 sm:py-12 mt-8 sm:mt-10">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-[min(100%,85rem)] mx-auto min-w-0">
            {members.map((m, index) => (
              <ScrollReveal key={m.id} delay={index * 0.08} className="w-[calc(50%-0.5rem)] max-w-[12rem] shrink-0 grow-0 sm:w-44 md:w-48 lg:w-52 sm:max-w-none">
                <div className="text-center min-w-0 mx-auto max-w-full">
                  <div className="w-24 h-24 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden bg-muted flex items-center justify-center mb-2 sm:mb-3 ring-[3px] ring-white shadow-sm shrink-0">
                    {memberImg(sec, m) ? (
                      <img src={memberImg(sec, m)!} alt={m.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <Users size={36} className="text-primary/50" />
                    )}
                  </div>
                  <h3 className="font-serif text-sm sm:text-lg font-semibold text-primary break-words leading-snug">{m.name}</h3>
                  {m.role_title && <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-1">{m.role_title}</p>}
                  <MemberCardBio
                    bio={m.bio}
                    className="font-sans text-[11px] sm:text-sm text-muted-foreground/90 mt-2 w-full leading-relaxed whitespace-pre-wrap break-words px-0.5"
                  />
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="font-sans text-xs sm:text-sm text-foreground/80 mt-1.5 tabular-nums inline-block hover:text-primary hover:underline">
                      {m.phone}
                    </a>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      );
    }

    if (layout === 'pastorate') {
      return (
        <div className="mt-8 sm:mt-16 w-full max-w-[min(100%,85rem)] mx-auto min-w-0 px-1">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
          {members.map((m, index) => (
            <ScrollReveal key={m.id} delay={index * 0.05} className="w-[calc(50%-0.375rem)] max-w-[12rem] shrink-0 grow-0 sm:w-40 md:w-44 lg:w-48 sm:max-w-none">
              <div className="group bg-card border border-border/80 rounded-lg sm:rounded-xl shadow-soft p-3 sm:p-4 text-center h-full flex flex-col items-center transition-all duration-300 hover:shadow-medium hover:border-primary/20 min-w-0 w-full">
                <div className="w-full max-w-[95px] sm:max-w-[115px] lg:max-w-[130px] aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden bg-muted/80 flex items-center justify-center mb-2 sm:mb-3 shrink-0 border border-border/50 shadow-inner">
                  {memberImg(sec, m) ? (
                    <img src={memberImg(sec, m)!} alt={m.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <Users size={30} className="text-primary/20" />
                  )}
                </div>
                <span className="inline-block w-8 h-px bg-border mb-1.5 sm:mb-2" aria-hidden />
                <p className="font-sans text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                  {m.role_title?.trim() || 'Committee Member'}
                </p>
                <h3 className="text-xs sm:text-sm font-sans font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 break-words">
                  {m.name}
                </h3>
                <MemberCardBio
                  bio={m.bio}
                  className="font-sans text-[10px] sm:text-xs text-muted-foreground/90 mt-1.5 w-full leading-relaxed whitespace-pre-wrap break-words px-0.5"
                />
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="font-sans text-[10px] sm:text-xs text-muted-foreground mt-1 hover:text-primary hover:underline">
                    {m.phone}
                  </a>
                )}
              </div>
            </ScrollReveal>
          ))}
          </div>
        </div>
      );
    }

    if (layout === 'other') {
      return (
        <div className="mt-8 sm:mt-12 w-full max-w-[min(100%,85rem)] mx-auto min-w-0 px-1">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
          {members.map((m, index) => (
            <ScrollReveal key={m.id} delay={index * 0.05} className="w-[calc(50%-0.375rem)] max-w-[11rem] shrink-0 grow-0 sm:w-44 md:w-48 lg:w-52 sm:max-w-none">
              <div className="group bg-card border border-border/80 rounded-lg sm:rounded-xl shadow-soft p-3 sm:p-5 text-center h-full flex flex-col items-center transition-all duration-300 hover:shadow-medium hover:border-primary/20 min-w-0 w-full">
                <div className="w-full max-w-[90px] sm:max-w-[120px] lg:max-w-[140px] aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden bg-muted/80 flex items-center justify-center mb-2 sm:mb-3 shrink-0 border border-border/50 shadow-inner">
                  {memberImg(sec, m) ? (
                    <img src={memberImg(sec, m)!} alt={m.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <Users size={32} className="text-primary/20" />
                  )}
                </div>
                <span className="inline-block w-10 h-px bg-border mb-1.5 sm:mb-2" aria-hidden />
                {m.role_title && (
                  <p className="font-sans text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                    {m.role_title}
                  </p>
                )}
                <h3 className="text-xs sm:text-sm font-sans font-semibold text-primary leading-snug group-hover:text-primary/90 transition-colors duration-300 break-words">
                  {m.name}
                </h3>
                <MemberCardBio
                  bio={m.bio}
                  className="font-sans text-[10px] sm:text-xs text-muted-foreground/90 mt-1.5 w-full leading-relaxed whitespace-pre-wrap break-words px-0.5"
                />
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="font-sans text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hover:text-primary hover:underline tabular-nums">
                    {m.phone}
                  </a>
                )}
              </div>
            </ScrollReveal>
          ))}
          </div>
        </div>
      );
    }

    if (layout === 'committee') {
      return (
        <div className="mt-8 sm:mt-12 w-full max-w-[min(100%,85rem)] mx-auto min-w-0 px-1">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {members.map((m, index) => (
            <ScrollReveal key={m.id} delay={index * 0.06} className="w-[calc(50%-0.5rem)] max-w-[16rem] shrink-0 grow-0 sm:w-56 md:w-60 lg:w-64 sm:max-w-none">
              <div className="bg-card border border-border/80 rounded-xl p-4 text-center shadow-soft hover:shadow-medium transition-shadow h-full w-full">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-xl overflow-hidden bg-muted mb-3 ring-1 ring-border/40">
                  {memberImg(sec, m) ? (
                    <img src={memberImg(sec, m)!} alt={m.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users size={32} className="text-primary/20" />
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground">{m.name}</h3>
                {m.role_title && <p className="font-sans text-xs text-muted-foreground mt-1">{m.role_title}</p>}
                <MemberCardBio
                  bio={m.bio}
                  className="font-sans text-[11px] sm:text-xs text-muted-foreground/90 mt-2 w-full leading-relaxed whitespace-pre-wrap break-words"
                />
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="font-sans text-xs text-muted-foreground mt-1 tabular-nums inline-block hover:text-primary hover:underline">
                    {m.phone}
                  </a>
                )}
              </div>
            </ScrollReveal>
          ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8 sm:mt-12 w-full max-w-[min(100%,85rem)] mx-auto min-w-0 px-1">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
        {members.map((m, index) => (
          <ScrollReveal key={m.id} delay={index * 0.04} className="w-[calc(50%-0.375rem)] max-w-[12rem] shrink-0 grow-0 sm:w-48 md:w-52 lg:w-56 sm:max-w-none">
            <div className="group bg-card border border-border/80 rounded-lg sm:rounded-xl shadow-soft p-3 sm:p-5 text-center h-full flex flex-col items-center w-full">
              <div className="w-full max-w-[110px] sm:max-w-[130px] aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden bg-muted/80 flex items-center justify-center mb-2 sm:mb-3">
                {memberImg(sec, m) ? (
                  <img src={memberImg(sec, m)!} alt={m.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <Users size={32} className="text-primary/20" />
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-semibold text-foreground leading-snug break-words">{m.name}</h3>
              {m.role_title && <p className="font-sans text-[10px] sm:text-xs text-muted-foreground mt-1">{m.role_title}</p>}
              <MemberCardBio
                bio={m.bio}
                className="font-sans text-[10px] sm:text-xs text-muted-foreground/90 mt-1.5 w-full leading-relaxed whitespace-pre-wrap break-words"
              />
              {m.phone && (
                <a href={`tel:${m.phone}`} className="font-sans text-[10px] sm:text-xs text-muted-foreground hover:text-primary mt-1 inline-block tabular-nums">
                  {m.phone}
                </a>
              )}
            </div>
          </ScrollReveal>
        ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full min-w-0 overflow-x-hidden">
        <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src={stainedGlass} alt="" className="w-full h-full object-cover min-h-[12rem]" />
          </div>
          <div className={`${LEADERSHIP_PAGE_SHELL} relative z-10 min-w-0`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <SectionTitle
                title="Our Leadership Team"
                subtitle="Meet the dedicated individuals who guide our congregation"
                light
              />
            </motion.div>
          </div>
        </section>

        <section className="py-10 sm:py-16 md:py-24 bg-background">
          <div className={`${LEADERSHIP_PAGE_SHELL} max-w-full min-w-0`}>
            <div className="w-full mb-8 sm:mb-10 flex justify-center sm:justify-end">
              <Link
                to="/past-leaders"
                className="text-sm font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted"
              >
                View Past Leaders
              </Link>
            </div>

            {isInitialLoading ? (
              <div className="space-y-8 animate-pulse" aria-live="polite" aria-busy="true">
                <div className="h-8 w-64 mx-auto bg-muted rounded-md" />
                <div className="h-4 w-96 max-w-full mx-auto bg-muted/80 rounded-md" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/60 bg-card p-3 sm:p-4">
                      <div className="aspect-[3/4] rounded-lg bg-muted" />
                      <div className="h-4 bg-muted rounded mt-3 w-3/4 mx-auto" />
                      <div className="h-3 bg-muted/80 rounded mt-2 w-1/2 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {(leadershipQuery.isError || sectionsQuery.isError) && (
              <p className="text-sm text-destructive">
                {leadershipQuery.isError && leadershipQuery.error instanceof Error
                  ? leadershipQuery.error.message
                  : sectionsQuery.isError && sectionsQuery.error instanceof Error
                    ? sectionsQuery.error.message
                    : 'Failed to load leadership'}
              </p>
            )}

            {!isInitialLoading && sectionBlocks.map((sec) => {
              const layout = layoutVariantForSectionKey(sec.section_key);
              const members = sec.members ?? [];
              const bio = sec.description ?? '';
              const bishopPortraitSrc =
                layout === 'bishop' ? resolveLeadershipSectionImage('our-bishop', sec.image) : null;
              // Only Church Committee uses a wide section banner (group photo / upload). Member-only blocks ignore stored section images.
              const sectionBannerSrc =
                layout !== 'bishop' && layout === 'committee'
                  ? resolveLeadershipSectionImage(sec.section_key, sec.image)
                  : null;
              const committeeNarrative = layout === 'committee' ? splitCommitteeNarrative(sec.description) : null;

              return (
                <div
                  key={sec.section_key}
                  id={`leadership-${sec.section_key}`}
                  className="mb-10 sm:mb-14 scroll-mt-20 sm:scroll-mt-28 min-w-0 max-w-full [&_.text-h2]:font-serif"
                >
                  {layout === 'bishop' ? (
                    <ScrollReveal>
                      <div className="text-center mb-6 sm:mb-8 px-1 min-w-0">
                        <h2 className="text-h2 font-serif text-foreground mb-3 px-2 text-balance">{sec.title}</h2>
                        {sec.subtitle ? (
                          <p className="text-body max-w-2xl mx-auto text-muted-foreground leading-relaxed px-2 text-pretty">
                            {sec.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </ScrollReveal>
                  ) : (
                    <ScrollReveal>
                      <SectionTitle title={sec.title} subtitle={sec.subtitle ?? ''} />
                    </ScrollReveal>
                  )}

                  {layout === 'bishop' ? (
                    <div className="mt-2 w-full max-w-[min(100%,85rem)] mx-auto min-w-0">
                      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] gap-6 sm:gap-8 lg:gap-10 items-start bg-card/70 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 border border-border/60 min-w-0">
                      <ScrollReveal direction="left">
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-medium w-full max-w-[20rem] mx-auto lg:max-w-none lg:mx-0 bg-muted ring-1 ring-border/40 min-w-0">
                          {bishopPortraitSrc ? (
                            <img
                              src={bishopPortraitSrc}
                              alt={sec.title}
                              className="w-full h-auto max-w-full object-cover object-top aspect-[3/4]"
                            />
                          ) : (
                            <div className="aspect-[3/4] max-h-[min(70vh,28rem)] flex items-center justify-center">
                              <Users size={48} className="text-primary/30" />
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                      <ScrollReveal direction="right" delay={0.2}>
                        <div className="min-w-0 max-w-full overflow-hidden flex flex-col items-center text-center lg:items-start lg:text-left">
                          <div className="mt-1 sm:mt-2 w-full">
                            {bio.trim() ? (
                              renderBishopBio(bio)
                            ) : (
                              <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-4 max-w-xl mx-auto lg:mx-0">
                                Add the bishop biography in Admin → Leadership → Section headings & intro → Our Bishop
                                (section description). Upload the portrait in the Section photo box there.
                              </p>
                            )}
                          </div>
                        </div>
                      </ScrollReveal>
                      </div>
                    </div>
                  ) : (
                    <>
                      {layout === 'committee' ? (
                        <>
                          {committeeNarrative?.before ? (
                            <div className="w-full max-w-[min(100%,72rem)] mx-auto mt-4 sm:mt-6 text-muted-foreground leading-relaxed font-sans text-sm sm:text-base whitespace-pre-wrap text-center px-3 sm:px-4 break-words">
                              {committeeNarrative.before}
                            </div>
                          ) : null}
                          {sectionBannerSrc ? (
                            <div className="w-full max-w-[min(100%,72rem)] mx-auto min-w-0 my-8 sm:my-10 flex justify-center px-2 sm:px-4">
                              <div className="w-full max-w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-medium border border-border/50 bg-muted/20">
                                <img
                                  src={sectionBannerSrc}
                                  alt={sec.title}
                                  className="w-full h-auto max-h-[min(75vh,48rem)] object-contain object-center"
                                />
                              </div>
                            </div>
                          ) : null}
                          {committeeNarrative?.after ? (
                            <div className="w-full max-w-[min(100%,72rem)] mx-auto mt-6 sm:mt-8 text-muted-foreground leading-relaxed font-sans text-sm sm:text-base whitespace-pre-wrap text-center px-3 sm:px-4 break-words">
                              {committeeNarrative.after}
                            </div>
                          ) : null}
                        </>
                      ) : sec.description?.trim() ? (
                        <p className="text-muted-foreground w-full max-w-[min(100%,72rem)] mx-auto text-center leading-relaxed mt-4 px-3 sm:px-4 text-sm sm:text-base break-words whitespace-pre-wrap">
                          {sec.description}
                        </p>
                      ) : null}

                      {leadershipSectionAllowsMembers(sec.section_key) && renderMembersForLayout(sec)}

                      {leadershipSectionAllowsMembers(sec.section_key) && members.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground border border-dashed rounded-xl p-5 sm:p-8 mt-6 mx-auto max-w-2xl px-3 break-words">
                          No members in this section for this year yet. Add them in Admin → Leadership (Add member under this section).
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Leadership;
