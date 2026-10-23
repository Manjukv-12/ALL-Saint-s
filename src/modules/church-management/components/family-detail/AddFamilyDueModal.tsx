import { useEffect, useState } from 'react';

import type { Member } from '@/modules/church-management/api/types';

import type { DueType } from '@/modules/church-management/api/fees';

import { feesApi } from '@/modules/church-management/api/fees';

import { manualDueTypes } from '@/modules/church-management/lib/dueTypes';

import { ui } from './familyDetailTheme';



export function AddFamilyDueModal({

  open,

  members,

  dueTypes,

  defaultYear,

  onClose,

  onSaved,

}: {

  open: boolean;

  members: Member[];

  dueTypes: DueType[];

  defaultYear: number;

  onClose: () => void;

  onSaved: () => void;

}) {

  const manualTypes = manualDueTypes(dueTypes);



  const [personId, setPersonId] = useState('');

  const [dueTypeId, setDueTypeId] = useState('');

  const [year, setYear] = useState(defaultYear);

  const [month, setMonth] = useState('');

  const [amountDue, setAmountDue] = useState('');

  const [comments, setComments] = useState('');

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');



  const selectedType = manualTypes.find((d) => d.id === dueTypeId);

  const activeMembers = members.filter((m) => m.status !== 'Deceased');



  useEffect(() => {

    if (open) {

      setPersonId(activeMembers[0]?.id || '');

      setDueTypeId(manualTypes[0]?.id || '');

      setYear(defaultYear);

      setMonth('');

      setComments('');

      setError('');

    }

  }, [open, activeMembers, manualTypes, defaultYear]);



  useEffect(() => {

    if (selectedType) {

      setAmountDue(String(selectedType.defaultAmount));

    }

  }, [selectedType?.id]);



  if (!open) return null;



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!personId || !dueTypeId) {

      setError('Select member and due type');

      return;

    }

    if (Number(amountDue) < 0) {

      setError('Enter a valid amount');

      return;

    }

    try {

      setSaving(true);

      setError('');

      const res = await feesApi.createOrUpdateDue({

        personId,

        dueTypeId,

        year,

        amountDue: Number(amountDue),

        month: month ? Number(month) : undefined,

        comments: comments.trim() || undefined,

      });

      if (res.error) {

        setError(res.error);

        return;

      }

      onSaved();

    } catch {

      setError('Could not add due');

    } finally {

      setSaving(false);

    }

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className={`${ui.card} w-full max-w-lg`}>

        <div className={ui.sectionHead}>

          <h2 className={ui.sectionTitle}>Add manual due</h2>

          <p className="mt-1 text-sm text-slate-500">

            Office staff adds harvest, cemetery or other dues per member. Enter the amount for this

            person.

          </p>

        </div>

        <form onSubmit={handleSubmit} className={ui.sectionBody}>

          {error && (

            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">

              {error}

            </div>

          )}



          {manualTypes.length === 0 ? (

            <p className="text-base text-slate-600">

              No manual due types configured. Add types under Fees → Due types.

            </p>

          ) : (

            <>

              <label className="mb-4 block">

                <span className="text-sm font-semibold text-slate-600">Member</span>

                <select

                  value={personId}

                  onChange={(e) => setPersonId(e.target.value)}

                  className={`${ui.select} mt-1 w-full`}

                  required

                >

                  {activeMembers.map((m) => (

                    <option key={m.id} value={m.id}>

                      {m.fullName}

                    </option>

                  ))}

                </select>

              </label>

              <label className="mb-4 block">

                <span className="text-sm font-semibold text-slate-600">Due type</span>

                <select

                  value={dueTypeId}

                  onChange={(e) => setDueTypeId(e.target.value)}

                  className={`${ui.select} mt-1 w-full`}

                  required

                >

                  {manualTypes.map((dt) => (

                    <option key={dt.id} value={dt.id}>

                      {dt.name}

                    </option>

                  ))}

                </select>

              </label>

              <div className="mb-4 grid gap-4 sm:grid-cols-2">

                <label className="block">

                  <span className="text-sm font-semibold text-slate-600">Calendar year</span>

                  <input

                    type="number"

                    min={2000}

                    max={2100}

                    required

                    value={year}

                    onChange={(e) => setYear(Number(e.target.value))}

                    className={`${ui.select} mt-1 w-full`}

                  />

                </label>

                {selectedType?.frequency === 'MONTHLY' && (

                  <label className="block">

                    <span className="text-sm font-semibold text-slate-600">Month</span>

                    <select

                      value={month}

                      onChange={(e) => setMonth(e.target.value)}

                      className={`${ui.select} mt-1 w-full`}

                      required

                    >

                      <option value="">Select month</option>

                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (

                        <option key={m} value={m}>

                          {new Date(2000, m - 1, 1).toLocaleString('en-IN', { month: 'long' })}

                        </option>

                      ))}

                    </select>

                  </label>

                )}

              </div>

              <label className="mb-4 block">

                <span className="text-sm font-semibold text-slate-600">Amount due (₹) — required</span>

                <input

                  type="number"

                  min={0}

                  step={1}

                  required

                  value={amountDue}

                  onChange={(e) => setAmountDue(e.target.value)}

                  className={`${ui.select} mt-1 w-full`}

                  placeholder="Enter amount for this member"

                />

              </label>

              <label className="mb-6 block">

                <span className="text-sm font-semibold text-slate-600">Comments</span>

                <textarea

                  rows={2}

                  value={comments}

                  onChange={(e) => setComments(e.target.value)}

                  className={`${ui.select} mt-1 w-full`}

                  placeholder="Optional notes"

                />

              </label>

            </>

          )}



          <div className="flex justify-end gap-3">

            <button type="button" onClick={onClose} className={ui.btnOutline}>

              Cancel

            </button>

            {manualTypes.length > 0 && (

              <button type="submit" disabled={saving} className={ui.btnPrimary}>

                {saving ? 'Saving…' : 'Add due'}

              </button>

            )}

          </div>

        </form>

      </div>

    </div>

  );

}


