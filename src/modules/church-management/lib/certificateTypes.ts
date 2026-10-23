export const CERTIFICATE_TYPE_OPTIONS = [
  { value: 'MARRIAGE', label: 'Marriage Certificate' },
  { value: 'DEATH', label: 'Burial Certificate' },
  { value: 'BAPTISM', label: 'Baptism Certificate' },
  { value: 'CONFIRMATION', label: 'Confirmation Certificate' },
  { value: 'OTHER', label: 'Other Certificate' },
] as const;

export function certificateTypeLabel(type: string): string {
  return CERTIFICATE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function certificateTypeBadgeClass(type: string): string {
  switch (type) {
    case 'BAPTISM':
      return 'cm-cert-badge cm-cert-badge--baptism';
    case 'MARRIAGE':
      return 'cm-cert-badge cm-cert-badge--marriage';
    case 'DEATH':
      return 'cm-cert-badge cm-cert-badge--burial';
    default:
      return 'cm-cert-badge cm-cert-badge--burial';
  }
}
