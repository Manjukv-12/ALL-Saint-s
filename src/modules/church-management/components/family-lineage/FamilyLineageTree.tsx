import type { Family } from '@/modules/church-management/api/types';

type TreeNode = {
  id: string;
  familyCode: string;
  role: 'root' | 'ancestor' | 'parent' | 'current' | 'branch';
  subtitle?: string;
  meta?: string;
};

type Props = {
  family: Family;
  onOpenFamily: (id: string) => void;
};

function headName(family: Family): string | undefined {
  const hof =
    family.members?.find((m) => m.isHeadOfFamily) ??
    family.members?.find((m) => m.id === family.headOfFamilyId);
  return hof?.fullName?.trim() || undefined;
}

function buildTreeNodes(family: Family): { ancestors: TreeNode[]; current: TreeNode; branches: TreeNode[] } {
  const path = family.lineageInfo?.lineagePath ?? [];
  const children = family.lineageInfo?.childFamilies ?? [];
  const rootId = family.rootFamilyId ?? family.id;

  const ancestors: TreeNode[] = path.map((a, i) => {
    const isRoot = a.id === rootId || (path.length === 1 && i === 0);
    const isParent = i === path.length - 1;
    let role: TreeNode['role'] = 'ancestor';
    if (isRoot) role = 'root';
    else if (isParent) role = 'parent';
    return { id: a.id, familyCode: a.familyCode, role };
  });

  if (ancestors.length === 0 && family.lineageInfo?.isRootFamily) {
    // Standalone root — no ancestor row above current
  }

  const current: TreeNode = {
    id: family.id,
    familyCode: family.familyCode,
    role: 'current',
    subtitle: headName(family),
  };

  const branches: TreeNode[] = children.map((c) => ({
    id: c.id,
    familyCode: c.familyCode,
    role: 'branch' as const,
    meta: c.createdAt,
  }));

  return { ancestors, current, branches };
}

const roleLabel: Record<TreeNode['role'], string> = {
  root: 'Root family',
  ancestor: 'Ancestor',
  parent: 'Parent family',
  current: 'This family',
  branch: 'Branch',
};

const connectorClass = 'shrink-0 bg-blue-400/80 dark:bg-blue-500/70';

function TreeConnector({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`w-0.5 ${connectorClass} ${tall ? 'h-8' : 'h-6'}`}
      aria-hidden
    />
  );
}

function FamilyTreeNode({
  node,
  onOpen,
}: {
  node: TreeNode;
  onOpen: (id: string) => void;
}) {
  const isCurrent = node.role === 'current';
  const clickable = node.role !== 'current';

  const box = (
    <div
      className={`relative min-w-[9.5rem] max-w-[14rem] rounded-lg border px-4 py-3 text-center shadow-sm ${
        isCurrent
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400/60 dark:border-blue-500 dark:bg-blue-950/40'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:border-blue-600'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        {roleLabel[node.role]}
      </p>
      <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{node.familyCode}</p>
      {node.subtitle ? (
        <p className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-zinc-300">{node.subtitle}</p>
      ) : null}
      {node.meta ? (
        <p className="mt-1 text-[11px] text-slate-400">{formatShortDate(node.meta)}</p>
      ) : null}
    </div>
  );

  if (clickable) {
    return (
      <button type="button" onClick={() => onOpen(node.id)} className="rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        {box}
      </button>
    );
  }
  return box;
}

function formatShortDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

/** Classic top-down tree: root → … → parent → this family → branches. */
export function FamilyLineageTree({ family, onOpenFamily }: Props) {
  const { ancestors, current, branches } = buildTreeNodes(family);
  const empty = ancestors.length === 0 && branches.length === 0 && family.lineageInfo?.isRootFamily;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950">
      <p className="mb-6 text-center text-sm text-slate-600 dark:text-zinc-400">
        Oldest household at the top · branches below from <strong>Move</strong> or linked families
      </p>

      <div className="flex min-w-[16rem] flex-col items-center">
        {ancestors.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            <FamilyTreeNode node={node} onOpen={onOpenFamily} />
            <TreeConnector />
          </div>
        ))}

        <FamilyTreeNode node={current} onOpen={onOpenFamily} />

        {branches.length > 0 && (
          <>
            <TreeConnector tall />
            <div className="relative flex w-full max-w-3xl flex-col items-center">
              <div className={`h-0.5 w-full max-w-[min(100%,24rem)] ${connectorClass}`} aria-hidden />
              <div className="mt-0 flex flex-wrap items-start justify-center gap-6 pt-6">
                {branches.map((node) => (
                  <div key={node.id} className="flex flex-col items-center">
                    <div className={`mb-0 h-6 w-0.5 ${connectorClass}`} aria-hidden />
                    <FamilyTreeNode node={node} onOpen={onOpenFamily} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {empty && (
          <p className="mt-6 max-w-md text-center text-sm text-slate-500 dark:text-zinc-400">
            This is a <strong>root</strong> family with no parent above and no branch families below yet.
          </p>
        )}
      </div>
    </div>
  );
}
