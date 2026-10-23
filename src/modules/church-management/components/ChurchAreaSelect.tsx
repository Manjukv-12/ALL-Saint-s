import { useId } from 'react';
import { useChurchAreas } from '@/modules/church-management/hooks/useChurchAreas';

type Props = {
  value: string;
  onChange: (area: string) => void;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'data-field'?: string;
};

/** Area picker — choose from the list or type a new area (saved on the family). */
export function ChurchAreaSelect({
  value,
  onChange,
  id,
  className,
  required = false,
  disabled = false,
  allowEmpty = false,
  emptyLabel = 'Select area',
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel = 'Church area',
  'data-field': dataField,
}: Props) {
  const autoId = useId();
  const listId = `${id ?? autoId}-areas`;
  const { areas } = useChurchAreas();
  const trimmed = value?.trim() ?? '';
  const options = trimmed && !areas.some((a) => a.toLowerCase() === trimmed.toLowerCase())
    ? [trimmed, ...areas]
    : areas;

  return (
    <>
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        required={required && !allowEmpty}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        data-field={dataField}
        onChange={(e) => onChange(e.target.value)}
        placeholder={emptyLabel}
        className={className}
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map((area) => (
          <option key={area} value={area} />
        ))}
      </datalist>
    </>
  );
}
