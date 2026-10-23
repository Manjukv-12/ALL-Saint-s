import { bloodGroupSelectOptions } from '@/modules/church-management/lib/bloodGroup';

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
};

export function BloodGroupSelect({
  value,
  onChange,
  className,
  disabled = false,
  id,
  name,
  required = false,
  allowEmpty = true,
  emptyLabel = 'Select blood group',
}: Props) {
  const options = bloodGroupSelectOptions(value);

  return (
    <select
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      aria-label="Blood group"
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {options.map((group) => (
        <option key={group} value={group}>
          {group}
        </option>
      ))}
    </select>
  );
}
