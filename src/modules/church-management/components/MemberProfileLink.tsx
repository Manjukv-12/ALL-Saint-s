import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { churchMgmtPath } from '@/modules/church-management/paths';
import { MemberAvatar } from '@/modules/church-management/components/MemberAvatar';

const nameLinkClass =
  'font-medium text-blue-700 hover:underline dark:text-blue-400';

type Props = {
  personId: string;
  name: string;
  photo?: string | null;
  showAvatar?: boolean;
  /** Shown after the name (e.g. "· Head") — not part of the link. */
  nameSuffix?: ReactNode;
  belowName?: ReactNode;
  mutedName?: boolean;
};

export function MemberProfileLink({
  personId,
  name,
  photo,
  showAvatar = true,
  nameSuffix,
  belowName,
  mutedName = false,
}: Props) {
  const profileTo = churchMgmtPath('people', personId);
  const nameClass = mutedName
    ? `${nameLinkClass} text-blue-600/90 dark:text-blue-400/90`
    : nameLinkClass;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showAvatar ? (
        <Link
          to={profileTo}
          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`Open profile for ${name}`}
        >
          <MemberAvatar photo={photo} name={name} size="sm" />
        </Link>
      ) : null}
      <div className="min-w-0">
        <Link to={profileTo} className={nameClass}>
          {name}
        </Link>
        {nameSuffix}
        {belowName}
      </div>
    </div>
  );
}
