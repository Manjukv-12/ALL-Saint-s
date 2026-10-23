const fs = require('fs');
const p =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/AddFamilyWithMembersForm.tsx';
let s = fs.readFileSync(p, 'utf8');

function must(label, from, to) {
  if (!s.includes(from)) {
    console.error('FAIL', label);
    console.error(from.slice(0, 200));
    process.exit(1);
  }
  s = s.replace(from, to);
  console.log('OK', label);
}

// Align validation export name
const valPath =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/lib/memberFormValidation.ts';
let val = fs.readFileSync(valPath, 'utf8');
if (!val.includes('export function getFamilyCreateFieldErrors')) {
  console.error('getFamilyCreateFieldErrors missing in validation lib');
  process.exit(1);
}
// Ensure firstFieldErrorMessage import matches export
val = val.replace(
  /import \{ firstFieldErrorMessage \}/,
  'import { firstFieldErrorMessage }'
);
val = val.replace(
  /firstFieldErrorMessage/g,
  'firstFieldErrorMessage'
);
fs.writeFileSync(valPath, val);

must(
  'react import',
  "import { useState } from 'react';",
  "import { useRef, useState } from 'react';"
);

must(
  'validation import',
  `import {
  validateFamilyCreateForm,
  validateMemberDetails,
} from '@/modules/church-management/lib/memberFormValidation';`,
  `import {
  getFamilyCreateFieldErrors,
  getMemberDetailsFieldErrors,
  MEMBER_DETAILS_FIELD_ORDER,
  type MemberDetailsFieldErrors,
} from '@/modules/church-management/lib/memberFormValidation';
import {
  fieldErrorClass,
  firstFieldErrorMessage,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';`
);

must(
  'state',
  'const [submitting, setSubmitting] = useState(false);',
  `const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<MemberDetailsFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);`
);

// Detect create handler name
const createName = s.includes('const handleCreateFamily')
  ? 'handleCreateFamily'
  : s.includes('const handleHofSubmit')
    ? 'handleHofSubmit'
    : 'handleCreateFamily';
const addName = s.includes('const handleAddMember')
  ? 'handleAddMember'
  : 'handleAddMember';

must(
  'clear helper',
  `const ${createName} = async (e: React.FormEvent) => {`,
  `const clearFieldError = (key: keyof MemberDetailsFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const ${createName} = async (e: React.FormEvent) => {`
);

// Dump create validation for exact match
const createIdx = s.indexOf(`const ${createName}`);
console.log('CREATE SNIP', JSON.stringify(s.slice(createIdx, createIdx + 550)));

fs.writeFileSync(p, s);
console.log('partial write done — inspect create snip above');
