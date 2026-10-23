import type { PaymentHintLevel } from '@/modules/church-management/lib/dueAmountValidation';
import { paymentHintClass } from '@/modules/church-management/lib/dueAmountValidation';

type Props = {
  level: PaymentHintLevel;
  messages: string[];
  remainingLabel?: string;
};

/** Color-coded payment amount feedback (exact / under / excess). */
export function PaymentAmountHint({ level, messages, remainingLabel }: Props) {
  if (messages.length === 0 && !remainingLabel && level === 'ok') return null;

  return (
    <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${paymentHintClass(level)}`}>
      {remainingLabel ? <p className="font-medium">{remainingLabel}</p> : null}
      {messages.map((msg) => (
        <p key={msg} className={remainingLabel ? 'mt-1' : undefined}>
          {msg}
        </p>
      ))}
      {level === 'exact' && messages.length === 0 ? (
        <p className="font-medium">Exact remaining balance — good to save.</p>
      ) : null}
    </div>
  );
}
