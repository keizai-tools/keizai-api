export enum INVITATION_RESPONSE {
  INVITATION_NOT_FOUND = 'Invitation not found',
  INVITATIONS_NOT_FOUND = 'Invitations not found',
  INVITATION_NOT_FOUND_BY_ID = 'Invitation not found by id',
  INVITATION_NOT_FOUND_BY_USER = 'Invitation not found by user',
  INVITATION_NOT_FOUND_BY_USER_AND_ID = 'The user of the invitation and the logged in user do not match',
  INVITATION_FAILED_SAVE = 'Could not save invitation, please try again',
  INVITATION_FAILED_DELETED = 'Could not deleted invitation, please try again',
  INVITATION_FAILED_UPDATED = 'Could not updated invitation, please try again',
}
