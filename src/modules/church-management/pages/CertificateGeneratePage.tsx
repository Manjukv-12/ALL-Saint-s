import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChurchMgmtAuth } from '@/modules/church-management/contexts/ChurchMgmtAuthContext';
import { certificatesApi, templatesApi, familiesApi } from '@/modules/church-management/api';
import type { CertificateMetadata, CertificateTemplate, Family } from '@/modules/church-management/api';
import type { Member } from '@/modules/church-management/api/types';
import { memberAgeYears } from '@/modules/church-management/lib/membershipEligibility';
import { isActiveMemberStatus } from '@/modules/church-management/lib/membershipType';
import { CERTIFICATE_TYPE_OPTIONS } from '@/modules/church-management/lib/certificateTypes';
import { CertificateMetadataFields } from '@/modules/church-management/components/certificates/CertificateMetadataFields';
import { CertificatePreviewModal } from '@/modules/church-management/components/certificates/CertificatePreviewModal';
import { ChurchMgmtPageShell } from '@/modules/church-management/components/ChurchMgmtPageShell';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import { DatePartsField } from '@/components/DatePartsField';

const fieldClass = `mt-1 block ${ui.input}`;

function personMetadata(member: Member, family?: Family): CertificateMetadata {
  const age = member.dateOfBirth ? String(memberAgeYears(member.dateOfBirth) ?? '') : '';
  const gender =
    member.gender === 'FEMALE' ? 'Female' : member.gender === 'MALE' ? 'Male' : '';
  const hof = family?.members?.find((m) => m.isHeadOfFamily);
  return {
    christianName: member.fullName.split(' ')[0] ?? member.fullName,
    surname: member.fullName.split(' ').slice(-1)[0] ?? '',
    profession: member.occupation ?? '',
    age,
    gender,
    fatherName: hof?.fullName ?? '',
    residence: family?.address ?? '',
    parentChristianName: hof?.fullName ?? '',
    parentResidence: family?.address ?? '',
    parentOccupation: hof?.occupation ?? '',
  };
}

export default function GenerateCertificatePage() {
  const { isAuthenticated, loading: authLoading } = useChurchMgmtAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<CertificateMetadata>({});
  const [formData, setFormData] = useState({
    familyId: '',
    templateId: '',
    certificateType: 'MARRIAGE',
    personId: '',
    eventDate: '',
    priestName: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/church-management/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [templatesRes, familiesRes] = await Promise.all([
        templatesApi.getTemplates(),
        familiesApi.getFamilies(),
      ]);
      if (templatesRes.data) {
        const active = templatesRes.data.filter((t) => t.isActive);
        setTemplates(active);
        if (active.length === 0) setError('No active templates found.');
      } else if (templatesRes.error) {
        setError(templatesRes.error);
      }
      if (familiesRes.data) setFamilies(familiesRes.data.families);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const templatesForType = templates.filter(
    (t) =>
      t.type === formData.certificateType ||
      t.type === 'OTHER' ||
      formData.certificateType === 'OTHER'
  );

  useEffect(() => {
    if (!formData.templateId && templatesForType.length > 0) {
      setFormData((prev) => ({ ...prev, templateId: templatesForType[0].id }));
    }
  }, [formData.certificateType, templates]);

  const selectedFamily = families.find((f) => f.id === formData.familyId);
  const familyMembers = (selectedFamily?.members || []).filter(isActiveMemberStatus);

  useEffect(() => {
    if (!formData.personId) return;
    const member = familyMembers.find((m) => m.id === formData.personId);
    if (member) setMetadata((prev) => ({ ...prev, ...personMetadata(member, selectedFamily) }));
  }, [formData.personId, formData.familyId]);

  const buildPayload = () => ({
    ...formData,
    metadata,
  });

  const handlePreview = async () => {
    if (!formData.familyId || !formData.templateId) {
      setError('Please select family and template');
      return;
    }
    try {
      setError('');
      const response = await certificatesApi.previewCertificate(buildPayload());
      if (response.data) {
        const css = response.data.css || '';
        setPreviewHtml(`<style>${css}</style>${response.data.html}`);
      } else {
        setError(response.error || 'Failed to generate preview');
      }
    } catch {
      setError('Failed to generate preview');
    }
  };

  const handleGenerate = async () => {
    if (!formData.familyId || !formData.templateId) {
      setError('Please select family and template');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const payload: Record<string, unknown> = {
        familyId: formData.familyId,
        templateId: formData.templateId,
        certificateType: formData.certificateType,
        metadata,
      };
      if (formData.personId) payload.personId = formData.personId;
      if (formData.eventDate) payload.eventDate = new Date(formData.eventDate).toISOString();
      if (formData.priestName.trim()) payload.priestName = formData.priestName.trim();

      const createResponse = await certificatesApi.createCertificate(payload as never);
      if (createResponse.error || !createResponse.data) {
        setError(createResponse.error || 'Failed to create certificate');
        setLoading(false);
        return;
      }
      await certificatesApi.generatePDF(createResponse.data.id);
      navigate('/admin/church-management/certificates');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-lg text-zinc-600">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ChurchMgmtPageShell title="Generate certificate" subtitle="Fill the register fields and preview before printing." icon={FileText}>
        {error && <div className={ui.alertError}>{error}</div>}

        <div className={`${ui.card} ${ui.sectionBody}`}>
          <h2 className={`${ui.sectionTitle} mb-6`}>Certificate details</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Certificate type *</span>
              <select
                value={formData.certificateType}
                onChange={(e) =>
                  setFormData({ ...formData, certificateType: e.target.value, templateId: '' })
                }
                className={fieldClass}
              >
                {CERTIFICATE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Family *</span>
              <select
                value={formData.familyId}
                onChange={(e) =>
                  setFormData({ ...formData, familyId: e.target.value, personId: '' })
                }
                className={fieldClass}
              >
                <option value="">Select family</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.familyCode}
                  </option>
                ))}
              </select>
            </label>

            {familyMembers.length > 0 && (
              <label className="block">
                <span className="text-sm font-medium">Person</span>
                <select
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                  className={fieldClass}
                >
                  <option value="">Select person</option>
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium">Template *</span>
              <select
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                className={fieldClass}
              >
                <option value="">Select template</option>
                {templatesForType.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Event date</span>
                <DatePartsField
                  value={formData.eventDate}
                  onChange={(eventDate) => setFormData({ ...formData, eventDate })}
                  className="mt-1"
                  selectClassName={fieldClass}
                  aria-label="Event date"
                  preferYearView
                  defaultYearOffset={0}
                  maxYear={new Date().getFullYear() + 2}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Past or upcoming ceremony dates (up to 2 years ahead).
                </p>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Priest / Reverend name</span>
                <input
                  type="text"
                  value={formData.priestName}
                  onChange={(e) => setFormData({ ...formData, priestName: e.target.value })}
                  className={fieldClass}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={`${ui.card} ${ui.sectionBody}`}>
          <h2 className={`${ui.sectionTitle} mb-4`}>Register fields</h2>
          <p className="mb-4 text-sm text-slate-500">
            Fill the certificate register lines. Selecting a person auto-fills name, age, and family
            details where possible.
          </p>
          <CertificateMetadataFields
            certificateType={formData.certificateType}
            metadata={metadata}
            onChange={setMetadata}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!formData.familyId || !formData.templateId}
            className={ui.btnOutline}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!formData.familyId || !formData.templateId}
            className={ui.btnPrimary}
          >
            Generate &amp; print
          </button>
        </div>

      {previewHtml && (
        <CertificatePreviewModal html={previewHtml} onClose={() => setPreviewHtml(null)} />
      )}
    </ChurchMgmtPageShell>
  );
}
