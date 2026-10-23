import { useEffect, useState } from 'react';

import { familiesApi } from '@/modules/church-management/api/families';
import type { Family } from '@/modules/church-management/api/types';
import { SubmitSearchField } from '@/components/SubmitSearchField';

interface MarriageFamilySelectProps {
  excludeFamilyId?: string;
  value: string;
  onChange: (familyId: string, family?: Family) => void;
}

export function MarriageFamilySelect({
  excludeFamilyId,
  value,
  onChange,
}: MarriageFamilySelectProps) {
  const [appliedSearch, setAppliedSearch] = useState('');
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const res = await familiesApi.getFamilies(appliedSearch.trim() || undefined, 1, 30);
      if (!cancelled && res.data) {
        setFamilies(res.data.families.filter((f) => f.id !== excludeFamilyId));
      }
      if (!cancelled) setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [appliedSearch, excludeFamilyId]);

  const selected = families.find((f) => f.id === value);
  const inputClass =
    'w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white';
  const btnClass =
    'inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600 dark:text-zinc-200';

  return (
    <div className="space-y-2">
      <SubmitSearchField
        value={appliedSearch}
        onSearch={setAppliedSearch}
        placeholder="Search family… then press Enter"
        inputClassName={inputClass}
        buttonClassName={btnClass}
        aria-label="Search family"
      />
      <select
        required
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          onChange(id, families.find((f) => f.id === id));
        }}
        className={inputClass}
      >
        <option value="">Select husband&apos;s church family</option>
        {families.map((family) => (
          <option key={family.id} value={family.id}>
            {family.familyCode}
            {family.address ? ` — ${family.address.slice(0, 40)}` : ''}
          </option>
        ))}
      </select>
      {loading && <p className="text-xs text-zinc-500">Searching families…</p>}
      {selected?.address && (
        <p className="text-xs text-zinc-500">Address: {selected.address}</p>
      )}
    </div>
  );
}
