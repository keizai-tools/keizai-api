export enum ENVIROMENT_RESPONSE {
  ENVIRONMENT_NOT_FOUND = 'Variable not found',
  ENVIROMENT_NOT_FOUND_BY_COLLECTION_AND_USER = 'The user of the collection and the logged in user do not match',
  ENVIROMENT_NOT_FOUND_BY_USER_ID = 'Variable not found by user id',
  ENVIROMENT_NOT_FOUND_BY_TEAM_ID = 'Variable not found team id',
  ENVIROMENT_COLLECTION_NOT_FOUND = 'The collection does not exist',
  ENVIROMENT_FAILED_SAVE = 'Could not save variable, please try again',
  ENVIROMENT_FAILED_DELETED = 'Could not deleted variable, please try again',
  ENVIROMENT_FAILED_UPDATED = 'Could not updated variable, please try again',
  ENVIRONMENT_EXISTS = 'The variable already exists',
  ENVIRONMENTS_NOT_DELETED = 'Could not deleted variables, please try again',
  ENVIRONMENT_NOT_EXISTS_BY_NAME_AND_COLLECTION = 'The variable does not exist',
  ENVIRONMENT_FOUND = 'Variable found',
}
