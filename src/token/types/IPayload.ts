export interface IJwtPayload {
  data: IPayload;
  iat: number;
  exp: number;
}

export interface IPayload {
  admin_id: number;
  role: IRole;
}

export type IRole = 'creator' | 'superadmin';
