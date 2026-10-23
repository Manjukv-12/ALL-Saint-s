const fs = require('fs');

const inputBase =
  'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white';

function patchMarriage() {
  const p =
    'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/MarriageModal.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('fieldErrors')) {
    console.log('Marriage already patched');
    return;
  }
  if (!s.includes("from 'react'")) {
    console.error('marriage react import missing');
    process.exit(1);
  }
  s = s.replace(
    "import { useState } from 'react';",
    `import { useRef, useState } from 'react';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';`
  );
  s = s.replace(
    'const [error, setError] = useState(\'\');\n  const [hasOutstandingDues, setHasOutstandingDues] = useState(false);',
    `const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasOutstandingDues, setHasOutstandingDues] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);`
  );
  s = s.replace(
    `    setError('');
    setHasOutstandingDues(false);
  };`,
    `    setError('');
    setFieldErrors({});
    setHasOutstandingDues(false);
  };`
  );

  const oldVal = `    e.preventDefault();
    setError('');

    if (!spouseName.trim() || !notes.trim()) {
      setError('Husband name and notes are required');
      return;
    }

    if (marriageTarget === 'church') {
      if (!relatedFamilyId) {
        setError('Select the husband\\'s church family');
        return;
      }
    } else if (!externalFamilyName.trim() || !externalFamilyAddress.trim()) {
      setError('Enter husband family name and address');
      return;
    }

    if (!marriageDate.trim()) {
      setError('Marriage date is required');
      return;
    }`;

  // try without escaped quote variations
  const start = s.indexOf("e.preventDefault();\n    setError('');");
  const dues = s.indexOf('const duesCheck');
  if (start < 0 || dues < 0) {
    console.error('marriage validation block not found', start, dues);
    process.exit(1);
  }
  const before = s.slice(0, start);
  const after = s.slice(dues);
  const newVal = `e.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    if (!spouseName.trim()) errors.spouseName = 'Husband name is required';
    if (!notes.trim()) errors.notes = 'Notes are required';
    if (marriageTarget === 'church') {
      if (!relatedFamilyId) errors.relatedFamilyId = "Select the husband's church family";
    } else {
      if (!externalFamilyName.trim()) errors.externalFamilyName = 'Husband family name is required';
      if (!externalFamilyAddress.trim())
        errors.externalFamilyAddress = 'Husband family address is required';
    }
    if (!marriageDate.trim()) errors.marriageDate = 'Marriage date is required';

    setFieldErrors(errors);
    const order = [
      'spouseName',
      'relatedFamilyId',
      'externalFamilyName',
      'externalFamilyAddress',
      'marriageDate',
      'notes',
    ];
    const first = order.find((k) => errors[k]);
    if (first) {
      setError(errors[first]);
      requestAnimationFrame(() => focusFirstInvalidField(order, formRef.current));
      return;
    }

    `;
  s = before + newVal + after;

  s = s.replace(
    '<form onSubmit={handleSubmit} className="p-6">',
    '<form ref={formRef} onSubmit={handleSubmit} className="p-6" noValidate>'
  );

  // spouse name input
  s = s.replace(
    `              <input
                type="text"
                required
                value={spouseName}
                onChange={(e) => setSpouseName(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                placeholder="Enter husband name"
                autoFocus
              />`,
    `              <input
                type="text"
                required
                data-field="spouseName"
                aria-invalid={!!fieldErrors.spouseName}
                value={spouseName}
                onChange={(e) => {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.spouseName;
                    return next;
                  });
                  setSpouseName(e.target.value);
                }}
                className={fieldErrorClass(
                  'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white',
                  !!fieldErrors.spouseName
                )}
                placeholder="Enter husband name"
                autoFocus
              />
              <FormFieldError message={fieldErrors.spouseName} />`
  );

  fs.writeFileSync(p, s);
  console.log('MarriageModal base patched');
}

function patchDeath() {
  const p =
    'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/DeathModal.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('fieldErrors')) {
    console.log('Death already patched');
    return;
  }
  s = s.replace(
    "import { useEffect, useMemo, useState } from 'react';",
    `import { useEffect, useMemo, useRef, useState } from 'react';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';`
  );
  s = s.replace(
    "const [error, setError] = useState('');",
    `const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);`
  );
  s = s.replace(
    `    if (!notes.trim()) {
      setError('Notes are required (date and circumstances of death)');
      return;
    }
    if (isHeadOfFamily && successorMode === 'manual' && !successorId) {
      setError('Choose the new head of family');
      return;
    }`,
    `    const errors: Record<string, string> = {};
    if (!notes.trim()) {
      errors.notes = 'Notes are required (date and circumstances of death)';
    }
    if (isHeadOfFamily && successorMode === 'manual' && !successorId) {
      errors.successorId = 'Choose the new head of family';
    }
    setFieldErrors(errors);
    const order = ['notes', 'successorId'];
    const first = order.find((k) => errors[k]);
    if (first) {
      setError(errors[first]);
      requestAnimationFrame(() => focusFirstInvalidField(order, formRef.current));
      return;
    }`
  );
  s = s.replace(
    '<form onSubmit={handleSubmit} className="p-6">',
    '<form ref={formRef} onSubmit={handleSubmit} className="p-6" noValidate>'
  );
  // notes textarea - find Notes label nearby
  const notesIdx = s.indexOf('Notes *');
  if (notesIdx > 0) {
    const chunk = s.slice(notesIdx, notesIdx + 500);
    console.log('DEATH NOTES', JSON.stringify(chunk.slice(0, 350)));
  }
  fs.writeFileSync(p, s);
  console.log('DeathModal base patched');
}

function patchDueType() {
  const p =
    'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/fees/DueTypeAddForm.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('fieldErrors')) {
    console.log('DueType already patched');
    return;
  }
  s = s.replace(
    "import { useState } from 'react';",
    `import { useRef, useState } from 'react';
import { FormFieldError } from '@/modules/church-management/components/FormFieldError';
import {
  fieldErrorClass,
  focusFirstInvalidField,
} from '@/modules/church-management/lib/formFieldFocus';`
  );
  s = s.replace(
    "const [saving, setSaving] = useState(false);",
    `const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);`
  );
  s = s.replace(
    `  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      onError('');`,
    `  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!code.trim()) errors.code = 'Code is required';
    if (!name.trim()) errors.name = 'Name is required';
    setFieldErrors(errors);
    if (errors.code || errors.name) {
      onError(errors.code || errors.name);
      requestAnimationFrame(() =>
        focusFirstInvalidField(['code', 'name'], formRef.current)
      );
      return;
    }
    try {
      setSaving(true);
      onError('');`
  );
  s = s.replace(
    '<form\n      onSubmit={handleAdd}',
    '<form\n      ref={formRef}\n      onSubmit={handleAdd}\n      noValidate'
  );
  s = s.replace(
    `          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. BUILDING_FUND"
            className={\`\${ui.select} mt-1.5 w-full\`}
          />`,
    `          <input
            required
            data-field="code"
            aria-invalid={!!fieldErrors.code}
            value={code}
            onChange={(e) => {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.code;
                return next;
              });
              setCode(e.target.value);
            }}
            placeholder="e.g. BUILDING_FUND"
            className={fieldErrorClass(\`\${ui.select} mt-1.5 w-full\`, !!fieldErrors.code)}
          />
          <FormFieldError message={fieldErrors.code} />`
  );
  s = s.replace(
    `          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            className={\`\${ui.select} mt-1.5 w-full\`}
          />`,
    `          <input
            required
            data-field="name"
            aria-invalid={!!fieldErrors.name}
            value={name}
            onChange={(e) => {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.name;
                return next;
              });
              setName(e.target.value);
            }}
            placeholder="Display name"
            className={fieldErrorClass(\`\${ui.select} mt-1.5 w-full\`, !!fieldErrors.name)}
          />
          <FormFieldError message={fieldErrors.name} />`
  );
  fs.writeFileSync(p, s);
  console.log('DueTypeAddForm patched');
}

patchMarriage();
patchDeath();
patchDueType();
