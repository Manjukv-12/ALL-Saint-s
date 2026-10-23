import { useState } from 'react';
import { membersApi } from '@/modules/church-management/api';
import type { Member } from '@/modules/church-management/api/types';
import { EditMemberModal } from '@/modules/church-management/components/EditMemberModal';
import { ActionHint } from '@/modules/church-management/components/ActionHint';
import { ui } from '@/modules/church-management/lib/churchManagementTheme';
import type { EditMemberSubmitData } from '@/modules/church-management/lib/editMemberSubmitData';

type Props = {
  person: Member;
  familyMembers: Member[];
  canSetHeadOfFamily: boolean;
  onSaved: () => void | Promise<void>;
  onGoCompleteDues: () => void;
};

/** Edit button + modal so existing members can update details and add/change photos. */
export function PersonProfileEditSection({
  person,
  familyMembers,
  canSetHeadOfFamily,
  onSaved,
  onGoCompleteDues,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: EditMemberSubmitData) => {
    const response = await membersApi.updateMember(person.id, {
      fullName: data.fullName,
      gender: data.gender,
      relationship: data.relationship,
      phone: data.phone,
      occupation: data.occupation,
      qualification: data.qualification,
      bloodGroup: data.bloodGroup,
      dob: data.dateOfBirth,
      dow: data.dateOfWedding,
      status: data.status,
      membershipType: data.membershipType,
      associateJoinDate: data.associateJoinDate,
      associateLeftDate: data.associateLeftDate,
      isHeadOfFamily: data.isHeadOfFamily,
      statusNotes: data.statusNotes,
      maritalStatus: data.maritalStatus,
      spouseName: data.spouseName,
    });
    if (response.error) {
      throw new Error(response.error);
    }
  };

  return (
    <>
      <ActionHint hint="Edit this member’s details and add or change their photo.">
        <button type="button" onClick={() => setOpen(true)} className={ui.btnPrimary}>
          Edit member
        </button>
      </ActionHint>

      <EditMemberModal
        isOpen={open}
        onClose={() => setOpen(false)}
        member={person}
        familyMembers={familyMembers}
        onSubmit={handleSubmit}
        canSetHeadOfFamily={canSetHeadOfFamily}
        onGoCompleteDues={onGoCompleteDues}
        onRefresh={() => void onSaved()}
      />
    </>
  );
}
