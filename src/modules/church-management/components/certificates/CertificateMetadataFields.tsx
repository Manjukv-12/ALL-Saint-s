import type { CertificateMetadata } from '@/modules/church-management/api/certificates';

const inputClass =
  'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-base dark:border-zinc-600 dark:bg-zinc-800 dark:text-white';

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export function CertificateMetadataFields({
  certificateType,
  metadata,
  onChange,
}: {
  certificateType: string;
  metadata: CertificateMetadata;
  onChange: (next: CertificateMetadata) => void;
}) {
  const set = (key: keyof CertificateMetadata, value: string) =>
    onChange({ ...metadata, [key]: value });

  const common = (
    <>
      <Field
        label="Register number (No.)"
        value={metadata.registerNumber ?? ''}
        onChange={(v) => set('registerNumber', v)}
      />
      <Field label="Place" value={metadata.place ?? ''} onChange={(v) => set('place', v)} />
      <Field
        label="Remarks"
        value={metadata.remarks ?? ''}
        onChange={(v) => set('remarks', v)}
        placeholder="Optional"
      />
    </>
  );

  if (certificateType === 'BAPTISM') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {common}
        <Field
          label="Christian name"
          value={metadata.christianName ?? ''}
          onChange={(v) => set('christianName', v)}
        />
        <Field label="Gender" value={metadata.gender ?? ''} onChange={(v) => set('gender', v)} />
        <Field
          label="Parent surname"
          value={metadata.parentSurname ?? ''}
          onChange={(v) => set('parentSurname', v)}
        />
        <Field
          label="Parent christian name"
          value={metadata.parentChristianName ?? ''}
          onChange={(v) => set('parentChristianName', v)}
        />
        <Field
          label="Parent residence"
          value={metadata.parentResidence ?? ''}
          onChange={(v) => set('parentResidence', v)}
        />
        <Field
          label="Parent occupation"
          value={metadata.parentOccupation ?? ''}
          onChange={(v) => set('parentOccupation', v)}
        />
        <Field
          label="Sponsors"
          value={metadata.sponsors ?? ''}
          onChange={(v) => set('sponsors', v)}
        />
        <Field
          label="Minister signature"
          value={metadata.ministerSignature ?? ''}
          onChange={(v) => set('ministerSignature', v)}
        />
      </div>
    );
  }

  if (certificateType === 'MARRIAGE') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {common}
        <Field label="Surname" value={metadata.surname ?? ''} onChange={(v) => set('surname', v)} />
        <Field
          label="Christian name"
          value={metadata.christianName ?? ''}
          onChange={(v) => set('christianName', v)}
        />
        <Field label="Age" value={metadata.age ?? ''} onChange={(v) => set('age', v)} />
        <Field
          label="Condition"
          value={metadata.condition ?? ''}
          onChange={(v) => set('condition', v)}
          placeholder="e.g. Bachelor, Spinster, Widow"
        />
        <Field
          label="Profession"
          value={metadata.profession ?? ''}
          onChange={(v) => set('profession', v)}
        />
        <Field
          label="Residence"
          value={metadata.residence ?? ''}
          onChange={(v) => set('residence', v)}
        />
        <Field
          label="Father's name"
          value={metadata.fatherName ?? ''}
          onChange={(v) => set('fatherName', v)}
        />
        <Field
          label="By banns or license"
          value={metadata.bannsOrLicense ?? ''}
          onChange={(v) => set('bannsOrLicense', v)}
        />
      </div>
    );
  }

  if (certificateType === 'DEATH') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {common}
        <Field
          label="Christian name"
          value={metadata.christianName ?? ''}
          onChange={(v) => set('christianName', v)}
        />
        <Field label="Age" value={metadata.age ?? ''} onChange={(v) => set('age', v)} />
        <Field
          label="Profession"
          value={metadata.profession ?? ''}
          onChange={(v) => set('profession', v)}
        />
        <Field
          label="Father's name"
          value={metadata.fatherName ?? ''}
          onChange={(v) => set('fatherName', v)}
        />
        <Field
          label="Burial date"
          value={metadata.buriedDate ?? ''}
          onChange={(v) => set('buriedDate', v)}
          placeholder="YYYY-MM-DD (if different from death date)"
        />
        <Field
          label="Cause of death"
          value={metadata.causeOfDeath ?? ''}
          onChange={(v) => set('causeOfDeath', v)}
        />
        <Field
          label="Buried by (name & designation)"
          value={metadata.buriedBy ?? ''}
          onChange={(v) => set('buriedBy', v)}
        />
        <Field
          label="Where buried"
          value={metadata.whereBuried ?? ''}
          onChange={(v) => set('whereBuried', v)}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {common}
      <Field
        label="Extra details"
        value={metadata.remarks ?? ''}
        onChange={(v) => set('remarks', v)}
      />
    </div>
  );
}
