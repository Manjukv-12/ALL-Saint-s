/** Membership subscription: age 18+ with date of birth on file */

export const MEMBERSHIP_MIN_AGE = 18;

export function memberAgeYears(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth.includes('T') ? dateOfBirth : `${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function isEligibleForMembershipFee(dateOfBirth?: string | null): boolean {
  const age = memberAgeYears(dateOfBirth);
  return age !== null && age >= MEMBERSHIP_MIN_AGE;
}
