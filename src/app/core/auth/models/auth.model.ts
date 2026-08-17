/**
 * User roles supported by auth-service (com.ayrotek.reckon.auth.entity.Role)
 */
export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER';

/**
 * User derived from the decoded JWT access token.
 * auth-service does NOT return a user object on login/register —
 * identity claims are embedded in the JWT itself (see JwtUtil.generateToken).
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

/**
 * POST /api/v1/auth/login
 * Backend field is `identifier` — accepts email, username or phone.
 */
export interface LoginRequest {
  identifier: string;
  password: string;
}

/**
 * POST /api/v1/auth/register
 * Backend has no firstName/lastName — only email, username, password.
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * POST /api/v1/auth/refresh
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Raw response body returned by auth-service for /login, /register and /refresh.
 * Matches com.ayrotek.reckon.auth.dto.response.AuthResponse exactly.
 */
export interface AuthResponse {
  authUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT access token payload (claims set in JwtUtil.generateToken).
 */
export interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  type: 'user' | 'refresh';
  iat: number;
  exp: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}
