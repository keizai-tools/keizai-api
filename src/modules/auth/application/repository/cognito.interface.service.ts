export const COGNITO_SERVICE = 'COGNITO_SERVICE';

export interface ICognitoService {
  registerAccount(email: string, password: string): Promise<IRegisterResult>;
  loginAccount(email: string, password: string): Promise<ILoginResult>;
}

export interface IRegisterResult {
  externalId: string;
  username: string;
}

export interface ILoginResult {
  accessToken: string;
  refreshToken: string;
}
