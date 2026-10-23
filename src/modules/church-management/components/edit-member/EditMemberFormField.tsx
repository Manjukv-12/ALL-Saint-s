import type { ReactNode } from 'react';

type Props = {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function EditMemberFormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: Props) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[hsl(var(--foreground))] dark:text-zinc-200"
      >
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))] dark:text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function editMemberInputClass(hasError?: boolean) {
  const base =
    'w-full rounded-lg border bg-white px-4 py-2.5 text-base text-[hsl(var(--foreground))] transition focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-zinc-200';
  if (hasError) {
    return `${base} border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700`;
  }
  return `${base} border-[hsl(var(--input))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]/20 dark:border-zinc-600`;
}
