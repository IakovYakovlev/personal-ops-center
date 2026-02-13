export type TokenPayload = RegisterTokenPayload | ResetTokenPayload;

export interface BaseTokenPayload {
  email: string;
  iat: number;
  exp: number;
  sub: string;
}

export interface RegisterTokenPayload extends BaseTokenPayload {
  type: 'register';
}

export interface ResetTokenPayload extends BaseTokenPayload {
  type: 'reset';
}
