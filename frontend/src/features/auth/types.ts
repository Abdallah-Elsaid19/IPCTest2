export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  is_staff: boolean;
  is_superuser: boolean;
  role: "admin" | "user";
}

export interface AuthResponse {
  user: AuthUser;
}
