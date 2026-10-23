import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

type SubmitSearchFieldProps = {
  /** Currently applied search (from parent). Draft text updates only on submit. */
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  autoFocus?: boolean;
  /** Optional min length hint shown near the field. */
  minLength?: number;
  'aria-label'?: string;
};

/**
 * Search input that does not fire on every keystroke.
 * User types freely, then presses Enter or clicks Search.
 */
export function SubmitSearchField({
  value,
  onSearch,
  placeholder = 'Type and press Enter…',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  autoFocus = false,
  minLength,
  'aria-label': ariaLabel = 'Search',
}: SubmitSearchFieldProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const submit = () => {
    const next = draft.trim();
    if (minLength != null && next.length > 0 && next.length < minLength) {
      return;
    }
    onSearch(next);
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className={`flex min-w-0 flex-1 items-stretch gap-2 ${className}`}
      role="search"
    >
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`min-w-0 w-full flex-1 ${inputClassName}`}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      <button
        type="submit"
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 ${buttonClassName}`}
        aria-label="Run search"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span>Search</span>
      </button>
    </form>
  );
}
