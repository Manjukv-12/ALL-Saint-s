import type { ReactNode } from 'react';
import { Church } from 'lucide-react';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

type Props = {
  children: ReactNode;
  devNote?: ReactNode;
};

export function ChurchMgmtLoginScreen({ children, devNote }: Props) {
  return (
    <div className={ui.loginShell}>
      <div className={ui.loginCard}>
        <header className="mb-8 text-center">
          <div className={ui.loginLogo}>
            <Church className="h-7 w-7" aria-hidden />
          </div>
          <h1 className={ui.loginTitle}>All Saints CSI</h1>
          <p className={ui.loginSubtitle}>Church office — sign in to manage records</p>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-zinc-500">
            Thrissur · Church of South India
          </p>
        </header>

        {devNote}

        {children}
      </div>

      <p className={ui.loginFooter}>
        Authorized staff only. Contact the church office if you need access.
      </p>
    </div>
  );
}
