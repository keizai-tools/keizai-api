import { ISignUpResult } from 'amazon-cognito-identity-js';

import { AuthRequestDto } from '../../interface/dto/auth-request.to.ts';

export const COGNITO_SERVICE = 'COGNITO_SERVICE';

export interface ICognitoService {
  registerUser(dto: AuthRequestDto): Promise<ISignUpResult>;
  loginAccount(dto: AuthRequestDto): Promise<unknown>;
}
