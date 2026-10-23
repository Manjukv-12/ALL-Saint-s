import { Users, IndianRupee, GitBranch } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

export type FamilyDetailTab = 'members' | 'fees' | 'lineage';

const TABS: {
  id: FamilyDetailTab;
  label: string;
  icon: typeof Users;
}[] = [
  { id: 'members', label: 'Members', icon: Users },
  { id: 'fees', label: 'Fees', icon: IndianRupee },
  { id: 'lineage', label: 'Lineage', icon: GitBranch },
];

interface FamilyDetailTabsProps {
  active: FamilyDetailTab;
  onChange: (tab: FamilyDetailTab) => void;
  memberCount: number;
}

export function FamilyDetailTabs({ active, onChange, memberCount }: FamilyDetailTabsProps) {
  return (
    <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`${ui.containerWide} flex gap-1`}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={isActive ? ui.tabActive : ui.tabIdle}
            >
              <Icon className={`h-4 w-4 ${isActive ? ui.tabIconActive : ui.tabIconIdle}`} aria-hidden />
              {tab.label}
              {tab.id === 'members' && (
                <span className="ml-1 rounded-full bg-[hsl(var(--primary))]/10 px-1.5 py-0.5 text-xs font-normal text-[hsl(var(--primary))] dark:bg-white/10 dark:text-white">
                  {memberCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
