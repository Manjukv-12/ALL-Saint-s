const fs = require('fs');
const p =
  'C:/Users/edwin/CSI/ALL-Saint-s/src/modules/church-management/components/AddFamilyWithMembersForm.tsx';
let s = fs.readFileSync(p, 'utf8');

function must(label, from, to) {
  if (!s.includes(from)) {
    console.error('FAIL', label);
    console.error(JSON.stringify(from.slice(0, 180)));
    process.exit(1);
  }
  s = s.replace(from, to);
  console.log('OK', label);
}

must(
  'create validation',
  `    e.preventDefault();
    onError('');

    const formError = validateFamilyCreateForm(familyData.address, hof);
    if (formError) {
      onError(formError);
      return;
    }

    setSubmitting(true);`,
  `    e.preventDefault();
    onError('');

    const errors = getFamilyCreateFieldErrors(familyData.address, hof);
    setFieldErrors(errors);
    const firstMsg = firstFieldErrorMessage(errors, MEMBER_DETAILS_FIELD_ORDER);
    if (firstMsg) {
      onError(firstMsg);
      requestAnimationFrame(() => {
        focusFirstInvalidField([...MEMBER_DETAILS_FIELD_ORDER], formRef.current);
      });
      return;
    }

    setSubmitting(true);`
);

// add member block
const addIdx = s.indexOf('const handleAddMember');
console.log('ADD SNIP', JSON.stringify(s.slice(addIdx, addIdx + 650)));

must(
  'add validation',
  `    e.preventDefault();
    if (!createdFamilyId) return;
    onError('');

    const formError = validateMemberDetails(memberData);
    if (formError) {
      onError(formError);
      return;
    }

    const spouseRoleError = validateUniqueSpouseRole(sessionAdded, memberData.relationship);
    if (spouseRoleError) {
      onError(spouseRoleError);
      return;
    }

    setSubmitting(true);`,
  `    e.preventDefault();
    if (!createdFamilyId) return;
    onError('');

    const errors = getMemberDetailsFieldErrors(memberData);
    const spouseRoleError = validateUniqueSpouseRole(sessionAdded, memberData.relationship);
    if (spouseRoleError) {
      errors.relationship = spouseRoleError;
    }
    setFieldErrors(errors);
    const firstMsg = firstFieldErrorMessage(errors, MEMBER_DETAILS_FIELD_ORDER);
    if (firstMsg) {
      onError(firstMsg);
      requestAnimationFrame(() => {
        focusFirstInvalidField([...MEMBER_DETAILS_FIELD_ORDER], formRef.current);
      });
      return;
    }

    setSubmitting(true);`
);

must(
  'reset errors',
  `    setSessionAdded([]);
    onDone();`,
  `    setSessionAdded([]);
    setFieldErrors({});
    onDone();`
);

must(
  'form tag',
  '<form onSubmit={familyLocked ? handleAddMember : handleCreateFamily} className="space-y-4">',
  '<form ref={formRef} onSubmit={familyLocked ? handleAddMember : handleCreateFamily} className="space-y-4" noValidate>'
);

must(
  'address',
  `            <input
              type="text"
              required
              value={familyData.address}
              onChange={(e) => setFamilyData({ ...familyData, address: e.target.value })}
              className={familyLocked ? lockedClass : inputClass}
            />`,
  `            <input
              type="text"
              required
              data-field="address"
              aria-invalid={!!fieldErrors.address}
              value={familyData.address}
              onChange={(e) => {
                clearFieldError('address');
                setFamilyData({ ...familyData, address: e.target.value });
              }}
              className={fieldErrorClass(familyLocked ? lockedClass : inputClass, !!fieldErrors.address)}
            />
            <FormFieldError message={fieldErrors.address} />`
);

must(
  'hof name',
  `              <input
                type="text"
                required
                value={hof.fullName}
                onChange={(e) =>
                  setFamilyData({ ...familyData, hof: { ...hof, fullName: e.target.value } })
                }
                className={inputClass}
              />`,
  `              <input
                type="text"
                required
                data-field="fullName"
                aria-invalid={!!fieldErrors.fullName}
                value={hof.fullName}
                onChange={(e) => {
                  clearFieldError('fullName');
                  setFamilyData({ ...familyData, hof: { ...hof, fullName: e.target.value } });
                }}
                className={fieldErrorClass(inputClass, !!fieldErrors.fullName)}
              />
              <FormFieldError message={fieldErrors.fullName} />`
);

must(
  'hof gender',
  `              <select
                required
                value={hof.gender}
                onChange={(e) => handleHofGenderChange(e.target.value as 'MALE' | 'FEMALE')}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>`,
  `              <select
                required
                data-field="gender"
                aria-invalid={!!fieldErrors.gender}
                value={hof.gender}
                onChange={(e) => {
                  clearFieldError('gender');
                  handleHofGenderChange(e.target.value as 'MALE' | 'FEMALE');
                }}
                className={fieldErrorClass(inputClass, !!fieldErrors.gender)}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              <FormFieldError message={fieldErrors.gender} />`
);

must(
  'hof details fields',
  `            <MemberDetailsFields
              values={hof}
              onChange={(nextHof) => setFamilyData({ ...familyData, hof: nextHof })}
              inputClass={inputClass}
              hideIdentity
              nameLabel="Full name"
            />`,
  `            <MemberDetailsFields
              values={hof}
              onChange={(nextHof) => setFamilyData({ ...familyData, hof: nextHof })}
              inputClass={inputClass}
              hideIdentity
              nameLabel="Full name"
              fieldErrors={fieldErrors}
              onClearFieldError={clearFieldError}
            />`
);

// additional member - find exact
const memIdx = s.indexOf('Additional member');
console.log('MEM SNIP', JSON.stringify(s.slice(memIdx, memIdx + 450)));

fs.writeFileSync(p, s);
console.log('written through hof');
