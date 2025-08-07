export interface UserToken {
  user_name?: string;
  user_email?: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry: Date;
}
