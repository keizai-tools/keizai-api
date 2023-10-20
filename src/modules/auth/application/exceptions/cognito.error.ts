export class CognitoError extends Error {
  code: string;
  constructor() {
    super();
  }
}
