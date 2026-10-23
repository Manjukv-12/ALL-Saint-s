import { useEffect, useState } from 'react';
import type { Member } from '@/modules/church-management/api/types';
import { CmDialogShell } from '@/modules/church-management/components/CmDialogShell';

interface ReturnHomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSubmit: (notes: string, spouseName: string) => Promise<void>;
}

export function ReturnHomeModal({ isOpen, onClose, member, onSubmit }: ReturnHomeModalProps) {
  const [notes, setNotes] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && member) {
      setSpouseName(member.spouseName || '');
      setNotes('');
      setError('');
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!spouseName.trim()) {
      setError('Former spouse name is required for divorce history');
      return;
    }
    if (!notes.trim()) {
      setError('Notes are required (major divorce details for history)');
      return;
    }
    try {
      setLoading(true);
      await onSubmit(notes.trim(), spouseName.trim());
      setNotes('');
      setSpouseName('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to return home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CmDialogShell
      title={`Return ${member.fullName} to family`}
      subtitle="She becomes an Active family member again. Divorce details are saved only in her profile history. She can marry again later using the normal married-away flow."
      maxWidthClass="max-w-md"
      onBackdropClick={loading ? undefined : onClose}
      formProps={{ onSubmit: handleSubmit }}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-w-[7rem] flex-1 rounded-md border border-zinc-300 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-w-[7rem] flex-1 rounded-md bg-green-600 px-4 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:flex-none"
          >
            {loading ? 'Saving...' : 'Return home'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Former spouse name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            placeholder={member.spouseName || 'Former spouse name'}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-zinc-500">Stored in history only (not as current spouse).</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Divorce details (history) *
          </label>
          <textarea
            required
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            placeholder="Major details only — e.g. divorced from … date … returned to birth family …"
          />
        </div>
      </div>
    </CmDialogShell>
  );
}
