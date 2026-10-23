import { useNavigate } from 'react-router-dom';

import type { Family } from '@/modules/church-management/api/types';
import { ui } from '@/modules/church-management/components/family-detail/familyDetailTheme';
import { FamilyLineageTree } from '@/modules/church-management/components/family-lineage/FamilyLineageTree';
import { FamilyLineageSplitHistory } from '@/modules/church-management/components/family-lineage/FamilyLineageSplitHistory';

interface FamilyLineageSectionProps {
  family: Family;
}

export function FamilyLineageSection({ family }: FamilyLineageSectionProps) {
  const navigate = useNavigate();
  const goFamily = (id: string) => navigate(`/admin/church-management/families/${id}`);
  const goPerson = (personId: string) => navigate(`/admin/church-management/people/${personId}`);

  const generation =
    family.lineageInfo?.generationLevel === 'root'
      ? 'Root family (1st generation in this tree)'
      : `Generation ${family.generation ?? 2} in this tree`;

  return (
    <div className={ui.card}>
      <div className={ui.sectionHead}>
        <h2 className={`${ui.sectionTitle} font-serif text-xl tracking-tight text-slate-900 dark:text-white`}>
          Family tree
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">{generation}</p>
      </div>

      <div className={`${ui.sectionBody} space-y-8`}>
        <FamilyLineageTree family={family} onOpenFamily={goFamily} />
        <FamilyLineageSplitHistory
          family={family}
          onOpenFamily={goFamily}
          onOpenPerson={goPerson}
        />
      </div>
    </div>
  );
}
