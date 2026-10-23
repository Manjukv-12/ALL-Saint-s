import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { statsApi } from '@/modules/church-management/api';
import type { DashboardStats } from '@/modules/church-management/api/stats';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { StatCard } from '@/modules/church-management/components/dashboard/StatCard';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';

function formatCurrency(amount: number) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoadingStats(true);
        const response = await statsApi.getDashboardStats();
        if (response.data) setStats(response.data);
        else setError(response.error || 'Could not load dashboard');
      } catch {
        setError('Could not load dashboard');
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [isAuthenticated]);

  if (loading || loadingStats) {
    return (
      <div className={`${ui.container} py-12 text-center text-base text-[hsl(var(--muted-foreground))]`}>
        Loading dashboard…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const year = new Date().getFullYear();
  const paidPct =
    stats && stats.totalFeesAmount > 0
      ? Math.round((stats.totalPaidAmount / stats.totalFeesAmount) * 100)
      : 0;

  const greeting = user?.email ? user.email.split('@')[0] : null;

  return (
    <ChurchMgmtPageShell
      compact
      title="Dashboard"
      subtitle={
        greeting
          ? `Hello, ${greeting} · ${year} overview`
          : `Church office overview · ${year}`
      }
    >
      {error && <div className={ui.alertError}>{error}</div>}

      {stats && (
        <div className="space-y-4">
          <section className={ui.dashboardSection}>
            <h2 className={ui.sectionTitle}>Records</h2>
            <div className={ui.statGrid}>
              <StatCard label="Families" value={String(stats.totalFamilies)} hint="Registered" />
              <StatCard label="Members" value={String(stats.totalMembers)} hint="Active" />
              <StatCard
                label="Unpaid families"
                value={String(stats.familiesWithUnpaidFees)}
                hint="Fees pending"
              />
              <StatCard
                label="Certificates"
                value={String(stats.certificatesThisMonth)}
                hint="This month"
              />
            </div>
          </section>

          <section className={ui.dashboardSection}>
            <div className={ui.sectionRow}>
              <h2 className={ui.sectionTitle}>Membership fees ({year})</h2>
              <Link to={churchMgmtPath('fees')} className={ui.link}>
                View all fees →
              </Link>
            </div>
            <div className={ui.statGrid}>
              <StatCard
                label="Outstanding"
                value={formatCurrency(stats.totalUnpaidAmount)}
                hint={`${stats.familiesWithUnpaidFees} families`}
              />
              <StatCard
                label="Collected"
                value={formatCurrency(stats.totalPaidAmount)}
                hint="This year"
              />
              <StatCard
                label="Total due"
                value={formatCurrency(stats.totalFeesAmount)}
                hint="Paid + unpaid"
              />
              <StatCard label="Progress" value={`${paidPct}%`} hint="Collected share" />
            </div>
          </section>
        </div>
      )}
    </ChurchMgmtPageShell>
  );
}
