export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
}

export interface UserCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface UserProfile extends User {
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
}

export interface UsersListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}
