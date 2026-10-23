import type { InputHTMLAttributes, WheelEvent } from 'react';

/** Hide browser spinner arrows so amounts are typed only. */
export const amountNumberInputClass =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

/** Stop mouse/trackpad scroll from changing a focused number input. */
export function preventNumberInputScroll(e: WheelEvent<HTMLInputElement>) {
  // Blur is reliable across browsers (wheel listeners are often passive).
  e.currentTarget.blur();
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Defaults to decimal for amount fields. */
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
};

/**
 * Number input for rupee amounts: type manually only.
 * Scroll / trackpad over the field will not increase or decrease the value.
 */
export function AmountNumberInput({
  className = '',
  inputMode = 'decimal',
  onWheel,
  ...props
}: Props) {
  return (
    <input
      type="number"
      inputMode={inputMode}
      {...props}
      className={`${amountNumberInputClass} ${className}`.trim()}
      onWheel={(e) => {
        preventNumberInputScroll(e);
        onWheel?.(e);
      }}
    />
  );
}
