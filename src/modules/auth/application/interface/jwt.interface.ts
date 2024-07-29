export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtResponse {
  idUser: string;
  email: string;
}
