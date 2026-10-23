/** Inline validation message under a form control. */
export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {message}
    </p>
  );
}
