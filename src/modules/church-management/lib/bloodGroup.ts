/** Standard ABO blood groups for member forms. */
export const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];

export function isKnownBloodGroup(value?: string | null): value is BloodGroup {
  return !!value && (BLOOD_GROUP_OPTIONS as readonly string[]).includes(value);
}

/** Options for a select, keeping any legacy stored value so edits don't wipe it. */
export function bloodGroupSelectOptions(current?: string | null): string[] {
  const options = [...BLOOD_GROUP_OPTIONS];
  const trimmed = current?.trim();
  if (trimmed && !options.includes(trimmed as BloodGroup)) {
    options.unshift(trimmed);
  }
  return options;
}
