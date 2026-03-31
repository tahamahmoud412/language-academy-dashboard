import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/register.model';
import { environment } from '../../../environments/environment';

/** API payload interface for registration */
export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

/** API response interface for registration */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      full_name: string;
      email: string;
      phone: string;
    };
    token?: string;
  };
}

/** API payload interface for login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** API response interface for login */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      full_name: string;
      email: string;
      phone: string;
      role: string;
    };
    token: string;
  };
}

/** API response interface for profile */
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      full_name: string;
      email: string;
      phone: string;
      created_at: string;
    };
  };
}

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  BASE_URL = 'https://translate.ghosnworld.com/public/api/';
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // Token management using signals
  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _user = signal<AuthUser | null>(this.getStoredUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  private getStoredToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getStoredUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Request a password reset OTP
   * @param payload Email address
   * @returns Observable with forgot password response
   */
  forgotPassword(payload: { email: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.BASE_URL}/forgot-password`,
      payload,
    );
  }

  /**
   * Verify the OTP sent to the user's email
   * @param payload Email and OTP code
   * @returns Observable with verification response
   */
  verifyOtp(payload: {
    email: string;
    otp: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.BASE_URL}/verify-otp`,
      payload,
    );
  }

  /**
   * Reset the user's password using OTP
   * @param payload Email, OTP, new password, and confirmation
   * @returns Observable with reset response
   */
  resetPassword(payload: {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.BASE_URL}/reset-password`,
      payload,
    );
  }

  /**
   * Login user with email and password
   * @param payload Login credentials
   * @returns Observable with login response containing access token
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, payload);
  }

  /**
   * Register a new user
   * @param data Registration data
   * @returns Observable with registration response
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.BASE_URL}/register`, data);
  }

  /**
   * Store authentication token securely
   * @param token JWT access token
   */
  setToken(token: string): void {
    this._token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  setUser(user: AuthUser): void {
    if (isPlatformBrowser(this.platformId)) {
      // Point 6: Different user protection
      const previousUser = this.getStoredUser();
      if (previousUser && previousUser.id !== user.id) {
        // A different user is logging in — clear the previous user's enrollment
        localStorage.removeItem('exam_enrollment_id');
      }
    }

    this._user.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Clear authentication state and logout user
   * Point 4: DO NOT remove exam_enrollment_id on logout
   */
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      // Only remove auth tokens — keep exam_enrollment_id
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Fetch the authenticated student's profile
   * @returns Observable with profile response
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.BASE_URL}/student/profile`);
  }

  /**
   * Check if user is currently authenticated
   * @returns boolean indicating authentication status
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
