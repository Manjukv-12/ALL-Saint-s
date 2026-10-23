import { FileText, Plus, Printer, Download, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { certificatesApi } from '@/modules/church-management/api';
import type { Certificate } from '@/modules/church-management/api/certificates';
import {
  certificateTypeLabel,
  certificateTypeBadgeClass,
  CERTIFICATE_TYPE_OPTIONS,
} from '@/modules/church-management/lib/certificateTypes';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { RowActionButton, RowActionGroup } from '@/modules/church-management/components/RowActionButton';
import { churchMgmtPath } from '@/modules/church-management/paths';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { ActionHint } from '@/modules/church-management/components/ActionHint';

export default function CertificatesPage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFamily, setFilterFamily] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCertificates();
    }
  }, [isAuthenticated]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificatesApi.getCertificates();
      if (response.data) {
        setCertificates(response.data);
      } else {
        setError(response.error || 'Failed to load certificates');
      }
    } catch {
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (id: string) => {
    try {
      await certificatesApi.openCertificateForPrint(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open certificate for printing');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const format = await certificatesApi.downloadCertificate(id);
      if (format === 'html') {
        setError('');
        alert(
          'Downloaded as HTML (server cannot create PDF yet). Open the file in your browser and use Print → Save as PDF.'
        );
      } else {
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download certificate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const response = await certificatesApi.deleteCertificate(id);
      if (response.error) {
        setError(response.error);
        return;
      }
      loadCertificates();
    } catch {
      setError('Failed to delete certificate');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    if (filterType && cert.certificateType !== filterType) return false;
    if (filterFamily && cert.family?.familyCode !== filterFamily) return false;
    return true;
  });

  const uniqueFamilies = Array.from(
    new Set(certificates.map((c) => c.family?.familyCode).filter(Boolean))
  );

  if (authLoading || loading) {
    return (
      <div className={`${ui.container} py-16 text-center text-sm text-[hsl(var(--muted-foreground))]`}>
        Loading certificates…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ChurchMgmtPageShell
      title="Certificates"
      subtitle="Baptism, marriage, burial and other church certificates."
      icon={FileText}
      actions={
        <ActionHint hint="Create a baptism, marriage, burial, or other church certificate.">
          <Link to={churchMgmtPath('certificates', 'generate')} className={`${ui.btnPrimary} ${ui.btnHeader}`}>
            <Plus className="h-4 w-4" aria-hidden />
            Generate certificate
          </Link>
        </ActionHint>
      }
    >
      {error && <div className={ui.alertError}>{error}</div>}

      <div className={`${ui.card} flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end`}>
        <div className="w-full min-w-0 flex-1 sm:min-w-[11rem]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Certificate type
          </label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${ui.select} w-full`}>
            <option value="">All types</option>
            {CERTIFICATE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full min-w-0 flex-1 sm:min-w-[11rem]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Family
          </label>
          <select value={filterFamily} onChange={(e) => setFilterFamily(e.target.value)} className={`${ui.select} w-full`}>
            <option value="">All families</option>
            {uniqueFamilies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${ui.card} ${ui.tableScroll}`}>
        <table className="min-w-[40rem] w-full">
          <thead className={ui.tableHead}>
            <tr>
              <th className={ui.th}>Certificate number</th>
              <th className={ui.th}>Type</th>
              <th className={ui.th}>Family</th>
              <th className={ui.th}>Person</th>
              <th className={ui.th}>Issued</th>
              <th className={ui.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.map((certificate) => (
              <tr key={certificate.id} className={ui.row}>
                <td className={`${ui.td} font-semibold text-[hsl(var(--primary))]`}>
                  {certificate.certificateNumber || certificate.id.slice(0, 8)}
                </td>
                <td className={ui.td}>
                  <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs ${certificateTypeBadgeClass(certificate.certificateType)}`}
                  >
                    {certificateTypeLabel(certificate.certificateType)}
                  </span>
                </td>
                <td className={ui.td}>{certificate.family?.familyCode || '—'}</td>
                <td className={`${ui.td} capitalize`}>{certificate.person?.fullName || '—'}</td>
                <td className={ui.td}>{formatDate(certificate.createdAt)}</td>
                <td className={ui.td}>
                  <RowActionGroup>
                    <RowActionButton
                      variant="print"
                      icon={Printer}
                      label="Print"
                      onClick={() => handlePrint(certificate.id)}
                    />
                    <RowActionButton
                      variant="download"
                      icon={Download}
                      label="Download"
                      onClick={() => handleDownload(certificate.id)}
                    />
                    <RowActionButton
                      variant="delete"
                      icon={Trash2}
                      label="Delete"
                      onClick={() => handleDelete(certificate.id)}
                    />
                  </RowActionGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCertificates.length === 0 && !loading && (
        <div className={`${ui.card} py-12 text-center`}>
          <FileText className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]/40" aria-hidden />
          <p className="mt-3 text-sm font-medium text-[hsl(var(--primary))]">No certificates yet</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Generate a baptism, marriage, or burial certificate to get started.
          </p>
          <Link to={churchMgmtPath('certificates', 'generate')} className={`${ui.btnPrimary} mt-4 inline-flex`}>
            <Plus className="h-4 w-4" aria-hidden />
            Generate certificate
          </Link>
        </div>
      )}
    </ChurchMgmtPageShell>
  );
}
