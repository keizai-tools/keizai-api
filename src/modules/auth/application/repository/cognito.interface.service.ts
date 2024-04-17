import { ISignUpResult } from 'amazon-cognito-identity-js';

export const COGNITO_SERVICE = 'COGNITO_SERVICE';

export interface ICognitoService {
  registerAccount(email: string, password: string): Promise<IRegisterResult>;
  loginAccount(email: string, password: string): Promise<ILoginResult>;
  resendVerificationCode(email: string): Promise<unknown>;
  confirmAccount(email: string, signUpResult: ISignUpResult): Promise<void>;
}

export interface IRegisterResult {
  externalId: string;
  username: string;
}

export interface ILoginResult {
  accessToken: string;
  refreshToken: string;
}
