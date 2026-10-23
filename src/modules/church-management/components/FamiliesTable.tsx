import { Link } from 'react-router-dom';
import type { Family } from '@/modules/church-management/api/types';
import { churchMgmtPath } from '@/modules/church-management/paths';

interface FamiliesTableProps {
  families: Family[];
  onDelete: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function FamiliesTable({
  families,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: FamiliesTableProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return '-';
    return `₹${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-zinc-200 bg-white shadow [-webkit-overflow-scrolling:touch] dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-[44rem] w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th
              className="cursor-pointer px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 sm:px-6"
              onClick={() => onSort('familyCode')}
            >
              <div className="flex items-center gap-2">
                Family Code / Generation <SortIcon field="familyCode" />
              </div>
            </th>
            <th
              className="cursor-pointer px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 sm:px-6"
              onClick={() => onSort('hofName')}
            >
              <div className="flex items-center gap-2">
                Head of Family <SortIcon field="hofName" />
              </div>
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
              Phone Number
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
              Address
            </th>
            <th
              className="cursor-pointer px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 sm:px-6"
              onClick={() => onSort('members')}
            >
              <div className="flex items-center gap-2">
                Members <SortIcon field="members" />
              </div>
            </th>
            <th
              className="cursor-pointer px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700 sm:px-6"
              onClick={() => onSort('unpaidAmount')}
            >
              <div className="flex items-center gap-2">
                Unpaid Amount <SortIcon field="unpaidAmount" />
              </div>
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:px-6">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {families.map((family) => {
            const headOfFamily = family.members?.find((m) => m.isHeadOfFamily);
            return (
              <tr key={family.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-black dark:text-white sm:px-6 sm:py-4">
                  {family.familyCode}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-900 dark:text-zinc-100 sm:px-6 sm:py-4">
                  {headOfFamily?.fullName || 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400 sm:px-6 sm:py-4">
                  {headOfFamily?.contactNumber ? (
                    <a
                      href={`tel:${headOfFamily.contactNumber}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {headOfFamily.contactNumber}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="max-w-[10rem] truncate px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400 sm:max-w-xs sm:px-6 sm:py-4">
                  {family.address || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400 sm:px-6 sm:py-4">
                  {family._count?.members || family.members?.length || 0}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm sm:px-6 sm:py-4">
                  {family.unpaidAmount && family.unpaidAmount > 0 ? (
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(family.unpaidAmount)}
                    </span>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm sm:px-6 sm:py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={churchMgmtPath('families', family.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(family.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

