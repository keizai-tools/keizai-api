import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';

import { User } from '@/modules/user/domain/user.domain';

export interface LoginResponse {
  accessToken?: AuthenticationResultType['AccessToken'];
  expiresIn?: AuthenticationResultType['ExpiresIn'];
  tokenType?: AuthenticationResultType['TokenType'];
  refreshToken?: AuthenticationResultType['RefreshToken'];
  idToken?: AuthenticationResultType['IdToken'];
  newDeviceMetadata?: AuthenticationResultType['NewDeviceMetadata'];
  user?: User;
}
