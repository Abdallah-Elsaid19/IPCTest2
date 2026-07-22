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
  profile_image_url: string | null;
  telephone: string;
  membership_active: boolean;
  membership_grade: string | null;
}

export interface AuthResponse {
  user: AuthUser;
}
