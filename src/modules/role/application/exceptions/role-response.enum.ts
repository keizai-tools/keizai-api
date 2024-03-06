export enum ROLE_RESPONSE {
  USER_NOT_FOUND_BY_USER_AND_ID = 'The user of the role to team and the logged in user do not match',
  USERS_NOT_FOUND_BY_TEAM_ID = 'No user roles found by team ID',
  USERS_NOT_FOUND_BY_USER_ID = 'No user roles found by user ID',
  ROLE_FAILED_SAVED = 'Could not save the role, please try again',
  ROLE_FAILED_UPDATED = 'Could not update the role, please try again',
  ROLE_FAILED_DELETED = 'Could not delete the role, please try again',
}
