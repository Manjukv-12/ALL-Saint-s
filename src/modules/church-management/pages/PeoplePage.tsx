import { UserSearch } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { personsApi } from '@/modules/church-management/api';
import type { Member } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { MembershipStatusBadge } from '@/modules/church-management/components/MembershipStatusBadge';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { SubmitSearchField } from '@/components/SubmitSearchField';

export default function PeoplePage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    setQuery(trimmed);
    if (trimmed.length < 2) {
      setResults([]);
      if (trimmed.length === 1) {
        setError('Type at least 2 characters, then press Enter or Search.');
      } else {
        setError('');
      }
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await personsApi.searchPersons(trimmed);
      if (res.error) {
        setError(res.error);
        setResults([]);
      } else {
        setResults(res.data ?? []);
      }
    } catch {
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  if (authLoading) {
    return (
      <div className={`${ui.container} py-16 text-center text-base text-slate-500`}>Loading…</div>
    );
  }

  return (
    <ChurchMgmtPageShell
      title="People"
      subtitle="Search by name, phone, or family code. Open a profile for hierarchy and life events."
      icon={UserSearch}
    >
      <div className={`${ui.card} p-4`}>
        <label className="block text-sm font-semibold uppercase tracking-wide text-slate-600">
          Search
        </label>
        <SubmitSearchField
          value={query}
          onSearch={runSearch}
          placeholder="Type name, phone, or family code… then press Enter"
          className="mt-2"
          inputClassName={ui.input}
          buttonClassName={ui.btnOutline}
          autoFocus
          aria-label="Search people"
        />
        <p className="mt-2 text-xs text-slate-500">
          Type at least 2 characters, then press Enter or click Search.
        </p>
      </div>

      {error && <div className={ui.alertError}>{error}</div>}

      <div>
        {loading && <p className="text-sm text-slate-500">Searching…</p>}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-sm text-slate-500">No people found.</p>
        )}
        <ul className={`${ui.card} divide-y divide-slate-100 dark:divide-zinc-800`}>
          {results.map((m) => (
            <li key={m.id}>
              <Link
                to={churchMgmtPath('people', m.id)}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-800/50"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{m.fullName}</div>
                  <div className="text-sm text-slate-500">
                    {m.family?.familyCode ?? m.familyId}
                    {m.contactNumber ? ` · ${m.contactNumber}` : ''}
                  </div>
                </div>
                <MembershipStatusBadge member={m} className="max-w-[12rem] shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ChurchMgmtPageShell>
  );
}
