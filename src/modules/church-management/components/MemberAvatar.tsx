import { useState } from 'react';
import { memberPhotoUrl } from '@/modules/church-management/api/memberPhoto';
import { MemberPhotoLightbox } from '@/modules/church-management/components/MemberPhotoLightbox';

type Props = {
  photo?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.trim().slice(0, 2) || '?').toUpperCase();
}

const sizeClass = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-16 w-16 text-lg',
};

export function MemberAvatar({ photo, name, size = 'sm', className = '' }: Props) {
  const url = memberPhotoUrl(photo);
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const box = `${sizeClass[size]} shrink-0 overflow-hidden rounded-full bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-200 ${className}`;

  if (url && !broken) {
    return (
      <>
        <button
          type="button"
          className={`${box} cursor-zoom-in p-0`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label={`View photo of ${name}`}
        >
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        </button>
        {open && (
          <MemberPhotoLightbox
            src={url}
            alt={name}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <span
      className={`${box} inline-flex items-center justify-center font-semibold`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
