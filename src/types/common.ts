export type User = {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  sid: string;
  auth_time: number;
};

export type LLMProvider = {
  id: string;
  name: string;
  default?: boolean;
};
