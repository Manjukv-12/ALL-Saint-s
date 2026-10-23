import { useEffect, useState } from 'react';
import type { Family } from '@/modules/church-management/api/types';
import { ChurchAreaSelect } from '@/modules/church-management/components/ChurchAreaSelect';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import { FamilyTombBookedFields } from '@/modules/church-management/components/FamilyTombBookedFields';
import { ui } from './familyDetailTheme';

export type FamilyDetailsDraft = {
  houseName: string;
  address: string;
  area: string;
  tombBooked: boolean | null;
};

type Props = {
  family: Family;
  open: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: (draft: FamilyDetailsDraft) => Promise<void>;
};

export function EditFamilyDetailsForm({ family, open, saving, onCancel, onSave }: Props) {
  const [houseName, setHouseName] = useState(family.houseName || '');
  const [address, setAddress] = useState(family.address || '');
  const [area, setArea] = useState(family.area || '');
  const [tombBooked, setTombBooked] = useState<boolean | null>(family.tombBooked ?? null);
  const [addressError, setAddressError] = useState('');
  const [areaError, setAreaError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setHouseName(family.houseName || '');
    setAddress(family.address || '');
    setArea(family.area || '');
    setTombBooked(family.tombBooked ?? null);
    setAddressError('');
    setAreaError('');
    setFormError('');
  }, [open, family.id, family.houseName, family.address, family.area, family.tombBooked]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setAddressError('');
    setAreaError('');

    const trimmedAddress = address.trim();
    const trimmedArea = area.trim();
    if (!trimmedAddress) {
      setAddressError('House address is required');
      return;
    }
    if (!trimmedArea) {
      setAreaError('Church area is required');
      return;
    }

    try {
      await onSave({
        houseName: houseName.trim(),
        address: trimmedAddress,
        area: trimmedArea,
        tombBooked,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save family details');
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`${ui.card} space-y-4 border-[hsl(var(--primary))]/15 p-5 sm:p-6`}
    >
      <div>
        <h2 className="font-serif text-lg font-semibold text-[hsl(var(--primary))] dark:text-white">
          Edit family details
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
          Update house name, address, church area, and tomb booking for {family.familyCode}.
        </p>
      </div>

      {formError ? (
        <div className={ui.alertError} role="alert">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
            Family code
          </label>
          <div className={`${ui.input} bg-slate-50 font-mono text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-400`}>
            {family.familyCode}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
            Area *
          </label>
          <ChurchAreaSelect
            required
            value={area}
            onChange={(next) => {
              setAreaError('');
              setArea(next);
            }}
            disabled={saving}
            emptyLabel="Select church area"
            className={areaError ? `${ui.select} w-full border-red-400` : `${ui.select} w-full`}
            aria-label="Church area"
          />
          <FormFieldError message={areaError} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
            House name
          </label>
          <input
            type="text"
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="e.g. Kallumkal"
            disabled={saving}
            className={ui.input}
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
            House address *
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddressError('');
              setAddress(e.target.value);
            }}
            disabled={saving}
            className={addressError ? `${ui.input} border-red-400` : ui.input}
            autoComplete="street-address"
          />
          <FormFieldError message={addressError} />
        </div>
        <FamilyTombBookedFields
          className="sm:col-span-2"
          value={tombBooked}
          disabled={saving}
          onChange={setTombBooked}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800">
        <button type="button" onClick={onCancel} disabled={saving} className={ui.btnOutline}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={ui.btnPrimary}>
          {saving ? 'Saving…' : 'Save details'}
        </button>
      </div>
    </form>
  );
}
