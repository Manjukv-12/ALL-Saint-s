import {
  FAMILY_ROLE_OPTIONS,
  normalizeRoleValue,
} from '@/modules/church-management/lib/familyRoles';

interface FamilyRoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  'data-field'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

export function FamilyRoleSelect({
  value,
  onChange,
  required = false,
  className,
  allowEmpty = true,
  emptyLabel = 'Select role',
  disabled = false,
  'data-field': dataField,
  'aria-invalid': ariaInvalid,
}: FamilyRoleSelectProps) {
  const normalized = normalizeRoleValue(value);

  return (
    <select
      required={required}
      disabled={disabled}
      value={normalized}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      data-field={dataField}
      aria-invalid={ariaInvalid}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {FAMILY_ROLE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      {!!value && !normalized && <option value={value}>{value}</option>}
    </select>
  );
}
