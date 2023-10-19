export enum COGNITO_RESPONSE {
  CODE_DELIVERY_FAILURE = 'The verification code was not delivered correctly',
  FAILED_LOGIN = 'Failed to login',
  FAILED_REGISTER = 'Failed to register, please try again',
  INTERNAL_ERROR = 'Amazon Cognito internal error, please try again',
  INVALID_PARAMETER = 'One of the parameters entered is invalid',
  INVALID_PASSWORD = 'Please enter a valid password',
  NOT_AUTHORIZED = 'Invalid username or password',
  REQUEST_EXPIRED = 'The request has expired, please try again',
  SERVICE_UNAVAILABLE = 'Temporary failure of the server, please try again',
  TOO_MANY_REQUEST = "Please don't submit the request too many times",
  USERNAME_EXIST = 'The email is already registered',
  USER_NOT_CONFIRMED = 'The user is not confirmed',
  USER_NOT_FOUND_OR_EXIST = 'The user is not found or not exist',
}

export enum COGNITO_EXCEPTION {
  CODE_DELIVERY_FAILURE = 'CodeDeliveryFailureException',
  INVALID_PARAMETER = 'InvalidParameterException',
  INVALID_PASSWORD = 'InvalidPasswordException',
  INTERNAL_ERROR = 'InternalErrorException',
  NOT_AUTHORIZED = 'NotAuthorizedException',
  REQUEST_EXPIRED = 'RequestExpired',
  SERVICE_UNAVAILABLE = 'ServiceUnavailable',
  TOO_MANY_REQUEST = 'TooManyRequestsException',
  USERNAME_EXIST = 'UsernameExistsException',
  USER_NOT_CONFIRMED = 'UserNotConfirmedException',
}
