import { IAccessTokenPayload } from './access_token_payload.interface';

export interface ICognitoRefreshSessionResponse {
  idToken: {
    jwtToken: string;
    payload: IAccessTokenPayload;
  };
}
