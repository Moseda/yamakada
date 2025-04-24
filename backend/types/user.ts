import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  is_verified: number | null;
  verification_token: string | null;
  reset_token: string | null;
  refresh_token: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  isConfirmed: number | null;
  confirmationToken: string | null;
  notifications: number;
  language: string;
  theme: string;
  privacyMode: number;
}
