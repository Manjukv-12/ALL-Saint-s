/** Base route for church management (families, fees, certificates). Not the public /leadership page. */
export const CHURCH_MGMT_BASE = '/admin/church-management';

export function churchMgmtPath(...segments: string[]): string {
  const parts = [CHURCH_MGMT_BASE, ...segments.filter(Boolean)];
  return parts.join('/').replace(/\/+/g, '/');
}

export function editMemberPath(personId: string | number): string {
  return churchMgmtPath('people', String(personId), 'edit');
}
