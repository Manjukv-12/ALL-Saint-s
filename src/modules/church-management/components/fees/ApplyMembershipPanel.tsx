import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { CheckCircle2, Pencil, Users } from 'lucide-react';
import type { DueType } from '@/modules/church-management/api/fees';
import { feesApi } from '@/modules/church-management/api/fees';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import {
  MembershipStepBadge,
  MembershipYearSelect,
} from '@/modules/church-management/components/fees/MembershipYearSelect';
import {
  clampMembershipYear,
  isValidMembershipYear,
  membershipYearError,
} from '@/modules/church-management/lib/membershipYear';
import { defaultFeesManagementYear } from '@/modules/church-management/lib/feesYearPolicy';
import { FeesYearSplitNotice } from '@/modules/church-management/components/fees/FeesYearSplitNotice';
import { AmountNumberInput } from '@/modules/church-management/components/fees/AmountNumberInput';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  subscription: DueType | undefined;
  onApplied?: () => void;
  onRateSaved?: () => void;
};

/**
 * Church-wide membership: set rate → pick year → apply to all eligible.
 */
export function ApplyMembershipPanel({ subscription, onApplied, onRateSaved }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(() => clampMembershipYear(defaultFeesManagementYear()));
  const [rateInput, setRateInput] = useState('');
  const [editingRate, setEditingRate] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [rateMsg, setRateMsg] = useState('');
  const [lastResult, setLastResult] = useState<{
    created: number;
    updated: number;
    year: number;
    amount: number;
    persons?: number;
  } | null>(null);
  const [lockedYearRates, setLockedYearRates] = useState<Record<number, number>>({});

  const { user } = useChurchMgmtAuth();
  const isSuperAdmin = user?.isSuperAdmin === true;

  const loadLockedYearRates = useCallback(async () => {
    const res = await feesApi.getMembershipYearRates();
    if (res.data?.yearRates) {
      setLockedYearRates(res.data.yearRates);
    }
  }, []);

  useEffect(() => {
    void loadLockedYearRates();
  }, [loadLockedYearRates]);

  const yearRateLocked = (lockedYearRates[year] ?? 0) > 0;
  const canEditRateForYear = isSuperAdmin || !yearRateLocked;

  const amount =
    lockedYearRates[year] ?? subscription?.defaultAmount ?? 0;
  const monthly = amount > 0 ? Math.max(1, Math.round(amount / 12)) : 0;
  const yearValid = isValidMembershipYear(year, currentYear);
  const yearErr = useMemo(() => membershipYearError(year, currentYear), [year, currentYear]);

  useEffect(() => {
    if (!editingRate) {
      setRateInput(amount > 0 ? String(amount) : '');
    }
  }, [amount, editingRate]);

  const startEditRate = () => {
    setRateInput(amount > 0 ? String(amount) : '');
    setEditingRate(true);
    setError('');
    setRateMsg('');
  };

  const cancelEditRate = () => {
    setEditingRate(false);
    setRateInput(amount > 0 ? String(amount) : '');
    setError('');
  };

  const saveRate = async () => {
    if (!subscription) return;
    if (!yearValid) {
      setError(yearErr ?? 'Choose a valid year.');
      return;
    }
    const next = Number(rateInput);
    if (!Number.isFinite(next) || next < 1) {
      setError('Enter a valid annual amount (₹1 or more).');
      return;
    }
    if (!canEditRateForYear) {
      setError('This year’s rate is locked. Log in as super admin to change it.');
      return;
    }
    try {
      setSavingRate(true);
      setError('');
      const res = await feesApi.updateDueType(subscription.id, {
        defaultAmount: next,
        year,
        repriceYear: true,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditingRate(false);
      setRateMsg(
        `₹${formatCurrency(next)} saved for ${year}. Anyone who already paid less will now show a balance due.`
      );
      setLastResult(null);
      await loadLockedYearRates();
      onRateSaved?.();
    } catch {
      setError('Could not save the rate. Try again.');
    } finally {
      setSavingRate(false);
    }
  };

  const handleApply = async () => {
    if (!yearValid) {
      setError(yearErr ?? 'Choose a valid year before applying.');
      return;
    }
    if (editingRate) {
      setError('Save or cancel the rate first.');
      return;
    }
    if (amount < 1) {
      setError('Set the annual rate first.');
      startEditRate();
      return;
    }
    try {
      setGenerating(true);
      setError('');
      setRateMsg('');
      const res = await feesApi.generateAllDues(year);
      if (res.error) {
        setError(res.error);
        setLastResult(null);
        return;
      }
      setLastResult({
        created: res.data?.created ?? 0,
        updated: res.data?.updated ?? 0,
        year,
        amount: res.data?.amount ?? amount,
        persons: res.data?.persons,
      });
      onApplied?.();
    } catch {
      setError('Could not apply membership. Try again.');
      setLastResult(null);
    } finally {
      setGenerating(false);
    }
  };

  if (!subscription) {
    return (
      <div className={`${ui.card} p-8 text-center`}>
        <p className="text-base font-medium text-slate-800">Membership due type is missing</p>
        <p className="mt-2 text-sm text-slate-500">
          Create or enable <strong>Membership Due</strong> under Due types, then return here.
        </p>
      </div>
    );
  }

  const draftMonthly = (() => {
    const n = Number(rateInput);
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.max(1, Math.round(n / 12));
  })();
  const displayMonthly = editingRate ? draftMonthly : monthly;
  const displayAnnual = editingRate ? Number(rateInput) || 0 : amount;
  const needsRate = amount < 1 && !editingRate;
  const canApply = yearValid && !needsRate && !editingRate && amount >= 1;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="px-1">
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Membership for the year
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          One rate for every eligible member (active, 18+, date of birth on file). Set the amount,
          pick the year, then apply.
        </p>
        <FeesYearSplitNotice focus="fees" className="mt-3" />
      </header>

      <section className={`${ui.card} overflow-hidden`}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 dark:border-zinc-800 sm:px-6">
          <MembershipStepBadge step={1} />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Annual rate</p>
            <p className="text-xs text-slate-500">Shared for all members · billed monthly</p>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {editingRate ? (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amount for {yearValid ? year : currentYear} (₹)
                </span>
                <div className="flex max-w-xs items-center gap-2">
                  <span className="text-2xl font-semibold text-slate-400">₹</span>
                  <AmountNumberInput
                    min={1}
                    step={1}
                    value={rateInput}
                    onChange={(e) => {
                      setRateInput(e.target.value);
                      setRateMsg('');
                    }}
                    className={`${ui.input} text-2xl font-semibold tabular-nums`}
                    aria-label="Annual membership rate"
                    autoFocus
                  />
                </div>
              </label>
              {displayMonthly > 0 ? (
                <p className="text-sm text-slate-600">
                  About <strong>₹{formatCurrency(displayMonthly)}</strong> per month
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={ui.btnPrimary}
                  disabled={savingRate || !yearValid}
                  onClick={() => void saveRate()}
                >
                  {savingRate ? 'Saving…' : `Save rate for ${yearValid ? year : currentYear}`}
                </button>
                <button
                  type="button"
                  className={ui.btnOutline}
                  disabled={savingRate}
                  onClick={cancelEditRate}
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                If someone already paid in full at a lower rate, they will owe only the difference.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                  {amount > 0 ? `₹${formatCurrency(amount)}` : 'Not set'}
                </p>
                {monthly > 0 ? (
                  <p className="mt-1 text-sm text-slate-500">
                    ₹{formatCurrency(monthly)} / month · covers all eligible members
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-amber-700">Set an amount before you apply.</p>
                )}
              </div>
              {canEditRateForYear ? (
                <button
                  type="button"
                  className={`${ui.btnOutline} inline-flex items-center gap-2`}
                  onClick={startEditRate}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  {amount > 0 ? 'Change amount' : 'Set amount'}
                </button>
              ) : (
                <p className="max-w-xs text-xs text-amber-800 dark:text-amber-200">
                  Rate for {year} is locked. Super admin login required to change it.
                </p>
              )}
            </div>
          )}

          {rateMsg ? (
            <div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>{rateMsg}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`${ui.card} overflow-hidden`}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 dark:border-zinc-800 sm:px-6">
          <MembershipStepBadge step={2} />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Which year?</p>
            <p className="text-xs text-slate-500">Each year keeps its own membership amount</p>
          </div>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <MembershipYearSelect
            value={year}
            onChange={(y) => {
              setYear(y);
              setLastResult(null);
              setError('');
            }}
          />
        </div>
      </section>

      <section className={`${ui.card} overflow-hidden`}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 dark:border-zinc-800 sm:px-6">
          <MembershipStepBadge step={3} />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Apply to members</p>
            <p className="text-xs text-slate-500">Opens month rows · safe to run again</p>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Apply{' '}
            <strong className="text-slate-900 dark:text-white">
              {displayAnnual > 0 ? `₹${formatCurrency(displayAnnual)}` : 'the rate'}
            </strong>{' '}
            for{' '}
            <strong className="text-slate-900 dark:text-white">
              {yearValid ? year : '—'}
            </strong>{' '}
            to all eligible members.
          </p>

          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={generating || savingRate || !canApply}
            className={`${ui.btnPrimary} w-full justify-center px-6 py-3.5 text-base sm:w-auto`}
          >
            <Users className="h-5 w-5" aria-hidden />
            {generating
              ? 'Applying…'
              : !yearValid
                ? 'Choose a valid year'
                : needsRate || amount < 1
                  ? 'Set the rate first'
                  : editingRate
                    ? 'Save the rate first'
                    : `Apply membership · ${year}`}
          </button>

          <p className="text-xs leading-relaxed text-slate-500">
            Already applied? Running again refreshes unpaid months and top-ups after a rate change.
            Payments already recorded stay on the member’s history.
          </p>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {lastResult && lastResult.year === year ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="flex items-start gap-2 text-sm font-medium text-emerald-950 dark:text-emerald-100">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {lastResult.created + lastResult.updated === 0 ? (
                  <>
                    {lastResult.year} is already up to date
                    {lastResult.persons != null ? ` · checked ${lastResult.persons} members` : ''}.
                  </>
                ) : (
                  <>
                    Done for {lastResult.year}: {lastResult.created + lastResult.updated} member
                    update
                    {lastResult.created + lastResult.updated === 1 ? '' : 's'}
                    {lastResult.persons != null ? ` · ${lastResult.persons} people` : ''} · ₹
                    {formatCurrency(lastResult.amount)}.
                  </>
                )}
              </p>
              <p className="mt-1 pl-6 text-xs text-emerald-800/90 dark:text-emerald-200/80">
                Next: open <strong>All dues</strong> to collect payments from anyone who still owes.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
