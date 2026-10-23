import type { MemberDue } from '@/modules/church-management/api/fees';
import { churchMgmtPath } from '@/modules/church-management/paths';

export function collectPaymentPath(due: MemberDue): string {
  return churchMgmtPath('fees', 'people', due.personId, 'pay', due.id);
}
