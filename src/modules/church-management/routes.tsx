import { Navigate, Route, Routes } from 'react-router-dom';
import { ChurchMgmtAuthProvider } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { ProtectedChurchMgmtRoute } from '@/modules/church-management/components/ProtectedChurchMgmtRoute';
import ChurchMgmtLayout from '@/modules/church-management/components/ChurchMgmtLayout';
import LoginPage from '@/modules/church-management/pages/LoginPage';
import DashboardPage from '@/modules/church-management/pages/DashboardPage';
import FamiliesPage from '@/modules/church-management/pages/FamiliesPage';
import FamilyDetailPage from '@/modules/church-management/pages/FamilyDetailPage';
import MembersPage from '@/modules/church-management/pages/MembersPage';
import FeesPage from '@/modules/church-management/pages/FeesPage';
import PersonFeesPage from '@/modules/church-management/pages/PersonFeesPage';
import RecordDuePaymentPage from '@/modules/church-management/pages/RecordDuePaymentPage';
import CertificatesPage from '@/modules/church-management/pages/CertificatesPage';
import CertificateGeneratePage from '@/modules/church-management/pages/CertificateGeneratePage';
import PeoplePage from '@/modules/church-management/pages/PeoplePage';
import PersonProfilePage from '@/modules/church-management/pages/PersonProfilePage';
import EditMemberPage from '@/modules/church-management/pages/EditMemberPage';
import ReportsPage from '@/modules/church-management/pages/ReportsPage';
import HealthTrackerPage from '@/modules/church-management/pages/HealthTrackerPage';

/** Nested under App route path `/admin/church-management/*` */
export function ChurchManagementRoutes() {
  return (
    <ChurchMgmtAuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedChurchMgmtRoute />}>
          <Route element={<ChurchMgmtLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="families" element={<FamiliesPage />} />
            <Route path="families/:id" element={<FamilyDetailPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:id" element={<PersonProfilePage />} />
            <Route path="people/:id/edit" element={<EditMemberPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="fees/people/:personId" element={<PersonFeesPage />} />
            <Route
              path="fees/people/:personId/pay/:feeId"
              element={<RecordDuePaymentPage />}
            />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="certificates/generate" element={<CertificateGeneratePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="health-tracker" element={<HealthTrackerPage />} />
          </Route>
        </Route>
      </Routes>
    </ChurchMgmtAuthProvider>
  );
}
