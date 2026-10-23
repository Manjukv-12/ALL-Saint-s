import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SectionTitle from '@/components/common/SectionTitle';
import ScrollReveal from '@/components/common/ScrollReveal';
import { getPublicPastLeaders, mediaImageUrl, type PastLeaderRow } from '@/lib/api';
import stainedGlass from '@/assets/stained-glass.jpg';

function sortRows(rows: PastLeaderRow[]) {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

const PastLeaders = () => {
  const q = useQuery({
    queryKey: ['past-leaders', 'public'],
    queryFn: getPublicPastLeaders,
    staleTime: 60_000,
  });

  const vicars = useMemo(
    () => sortRows((q.data ?? []).filter((r) => r.group_key === 'vicars-assistant-vicar')),
    [q.data],
  );
  const committee = useMemo(
    () => sortRows((q.data ?? []).filter((r) => r.group_key === 'committee')),
    [q.data],
  );
  const vicarSections = useMemo(() => {
    const map = new Map<number, PastLeaderRow[]>();
    for (const row of vicars) {
      const sec = row.display_section && row.display_section > 0 ? row.display_section : 1;
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(row);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [vicars]);
  const committeeSections = useMemo(() => {
    const map = new Map<number, PastLeaderRow[]>();
    for (const row of committee) {
      const sec = row.display_section && row.display_section > 0 ? row.display_section : 1;
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(row);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [committee]);
  const isInitialLoading = q.isLoading;

  return (
    <Layout>
      <section className="relative pt-24 pb-14 sm:pt-30 sm:pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src={stainedGlass} alt="" className="w-full h-full object-cover min-h-[12rem]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionTitle title="Past Leaders" subtitle="Vicars & Asst. Vicar and Committee archives" light />
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[90rem] space-y-10">
          <div className="flex justify-center sm:justify-end">
            <Link
              to="/leadership"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted"
            >
              Back to Leadership
            </Link>
          </div>

          {isInitialLoading ? (
            <div className="space-y-6 animate-pulse" aria-live="polite" aria-busy="true">
              <div className="h-8 w-64 bg-muted rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border/70 bg-card p-4">
                    <div className="w-28 h-36 bg-muted rounded-lg mx-auto" />
                    <div className="h-4 bg-muted rounded mt-3 w-2/3 mx-auto" />
                    <div className="h-3 bg-muted/80 rounded mt-2 w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {q.isError && (
            <p className="text-sm text-destructive">
              {q.error instanceof Error ? q.error.message : 'Failed to load past leaders'}
            </p>
          )}

          {!isInitialLoading && <div className="space-y-5">
            <SectionTitle title="Vicars & Asst. Vicar" subtitle="" />
            {vicars.length === 0 ? (
              <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-5">
                No past vicar entries yet.
              </p>
            ) : (
              <div className="space-y-6">
                {vicarSections.map(([secNo, rows]) => (
                  <div key={`vicar-sec-${secNo}`} className="space-y-3">
                    {secNo > 1 ? (
                      <div className="w-full max-w-2xl mx-auto py-2" aria-hidden>
                        <div className="border-t-2 border-dashed border-primary/45" />
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
                      {rows.map((row, index) => (
                        <ScrollReveal key={row.id} delay={index * 0.05} className="w-full">
                          <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-4 text-center h-full">
                            <div className="w-24 h-28 sm:w-36 sm:h-44 mx-auto rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              {mediaImageUrl(row.image) ? (
                                <img src={mediaImageUrl(row.image)!} alt={row.name ?? ''} className="w-full h-full object-cover object-top" />
                              ) : (
                                <Users size={34} className="text-primary/30" />
                              )}
                            </div>
                            <p className="mt-3 font-serif text-sm sm:text-base font-semibold text-foreground">
                              {row.name || '—'}
                            </p>
                            <p className="text-[11px] sm:text-xs text-foreground/70 mt-1">{row.role_title ?? '—'}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{row.duration}</p>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>}

          {!isInitialLoading && <div className="space-y-5">
            <SectionTitle title="Committee" subtitle="" />
            {committee.length === 0 ? (
              <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-5">
                No past committee entries yet.
              </p>
            ) : (
              <div className="space-y-6">
                {committeeSections.map(([secNo, rows]) => (
                  <div key={`committee-sec-${secNo}`} className="space-y-3">
                    {secNo > 1 ? (
                      <div className="w-full max-w-[min(100%,78rem)] mx-auto py-2" aria-hidden>
                        <div className="border-t-2 border-dashed border-primary/45" />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                      {rows.map((row, index) => (
                        <ScrollReveal key={row.id} delay={index * 0.05} className="w-full max-w-[min(100%,78rem)]">
                          <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-4 text-center h-full">
                            <div className="w-full aspect-[16/9] mx-auto rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              {mediaImageUrl(row.image) ? (
                                <img src={mediaImageUrl(row.image)!} alt="Past committee" className="w-full h-full object-contain object-center" />
                              ) : (
                                <Users size={38} className="text-primary/30" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{row.duration}</p>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>}
        </div>
      </section>
    </Layout>
  );
};

export default PastLeaders;
