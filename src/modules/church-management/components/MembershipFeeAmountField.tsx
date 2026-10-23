import { useEffect, useState } from 'react';
import { feesApi } from '@/modules/church-management/api/fees';
import { isEligibleForMembershipFee } from '@/modules/church-management/lib/membershipEligibility';

type Props = {
  dateOfBirth?: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  disabled?: boolean;
  required?: boolean;
};

export function MembershipFeeAmountField({
  dateOfBirth,
  value,
  onChange,
  inputClass,
  disabled = false,
  required = false,
}: Props) {
  const [churchDefault, setChurchDefault] = useState('1000');

  useEffect(() => {
    feesApi.getDueTypes({ auto: true }).then((res) => {
      const sub = res.data?.find((d) => d.code === 'SUBSCRIPTION');
      if (sub) {
        setChurchDefault(String(sub.defaultAmount));
      }
    });
  }, []);

  const eligible = isEligibleForMembershipFee(dateOfBirth);
  const isRequired = required && eligible;
  const showHint = dateOfBirth ? !eligible : true;

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Membership fee amount (₹/year){isRequired ? ' *' : ''}
      </label>
      <input
        type="number"
        min={0}
        step={1}
        required={isRequired}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={churchDefault}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Amount can differ per person. Church default is ₹{churchDefault}/year.
        {showHint && !eligible && dateOfBirth
          ? ' Member is under 18 — fee applies when they turn 18.'
          : ' Required for members aged 18+ with date of birth.'}
      </p>
    </div>
  );
}
