export interface IUserJwtPayload {
  data: {
    user_id: number;
    type: 'user';
  };
}
export interface AuthenticatedUser {
  user_id: number;
  [key: string]: any;
}