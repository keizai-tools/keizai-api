export enum PRE_INVOCATION_RESPONSE {
  PRE_INVOCATION_NOT_FOUND_BY_COLLECTION_AND_USER = 'The user of the collection and the logged in user do not match',
  PRE_INVOCATION_NOT_FOUND_BY_USER_ID = 'The user id does not match',
  PRE_INVOCATION_INVOCATION_NOT_FOUND = 'The invocation does not exist',
  PRE_INVOCATION_FAILED_SAVE = 'Could not save variable, please try again',
  PRE_INVOCATION_FAILED_DELETED = 'Could not deleted variable, please try again',
  PRE_INVOCATION_FAILED_UPDATED = 'Could not updated variable, please try again',
}
