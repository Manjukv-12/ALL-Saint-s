import { PersonDuesClearanceNotice } from '@/modules/church-management/components/PersonDuesClearanceNotice';

interface SplitFamilyDuesNoticeProps {
  familyId: string;
  personId: string;
  personName: string;
  onHasOutstandingChange?: (hasOutstanding: boolean) => void;
  onGoCompleteDues?: () => void;
}

/** @deprecated Prefer PersonDuesClearanceNotice — kept for split modal compatibility. */
export function SplitFamilyDuesNotice({
  personId,
  personName,
  onHasOutstandingChange,
  onGoCompleteDues,
}: SplitFamilyDuesNoticeProps) {
  return (
    <PersonDuesClearanceNotice
      personId={personId}
      personName={personName}
      action="split"
      onHasOutstandingChange={onHasOutstandingChange}
      onGoCompleteDues={onGoCompleteDues}
    />
  );
}
