const fs = require('fs');
const p =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/AddFamilyWithMembersForm.tsx';
let s = fs.readFileSync(p, 'utf8');

const from = `            <MemberDetailsFields
              values={memberData}
              onChange={setMemberData}
              inputClass={inputClass}
              lockedClass={lockedClass}
              associateFamily={associateFamilySession}
              associateLockedMessage={
                associateFamilySession
                  ? 'Head of family is associate — all family members are associate members.'`;

const to = `            <MemberDetailsFields
              values={memberData}
              onChange={setMemberData}
              inputClass={inputClass}
              lockedClass={lockedClass}
              fieldErrors={fieldErrors}
              onClearFieldError={clearFieldError}
              associateFamily={associateFamilySession}
              associateLockedMessage={
                associateFamilySession
                  ? 'Head of family is associate — all family members are associate members.'`;

if (!s.includes(from)) {
  // try alternate dash character
  const i = s.indexOf('values={memberData}');
  console.log(JSON.stringify(s.slice(i - 50, i + 420)));
  process.exit(1);
}
s = s.replace(from, to);
fs.writeFileSync(p, s);
console.log('member fields wired');
