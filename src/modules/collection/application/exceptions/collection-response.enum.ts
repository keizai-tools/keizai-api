export enum COLLECTION_RESPONSE {
  COLLECTION_NOT_FOUND = 'Collection not found',
  COLLECTIONS_NOT_FOUND = 'Collections not found',
  COLLECTION_NOT_FOUND_BY_ID = 'Collection not found by id',
  COLLECTION_NOT_FOUND_BY_USER = 'Collection not found by user',
  COLLECTION_NOT_FOUND_BY_USER_AND_ID = 'The user of the collection and the logged in user do not match',
  COLLECTION_NOT_FOUND_BY_TEAM_AND_ID = 'The admin of the team and the logged in user do not match',
  COLLECTION_FAILED_SAVE = 'Could not save collection, please try again',
  COLLECTION_FAILED_DELETED = 'Could not deleted collection, please try again',
  COLLECTION_FAILED_UPDATED = 'Could not updated collection, please try again',
}
