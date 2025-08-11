import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthResponse, LoginData, RegisterData, User } from './interfaces/interface';

@Injectable({providedIn: 'root'} )
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient ) {
    this.loadUserFromStorage();
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data );
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data )
      .pipe(
        tap(response => {
          this.setTokens(response.access_token, response.refresh_token);
          this.currentUserSubject.next(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        })
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post(`${this.apiUrl}/refresh`, { refresh_token: refreshToken } )
      .pipe(
        tap((response: any) => {
          this.setTokens(response.access_token, response.refresh_token);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {} )
      .pipe(
        tap(() => {
          this.clearTokens();
          this.currentUserSubject.next(null);
        })
      );
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(updatedData: { name?: string; email?: string }): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return;
    }

    const newUser = { ...currentUser, ...updatedData };

    localStorage.setItem('user', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);
  }

  getDashboardRoute(role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL'): string {
    const dashboardRoutes = {
      'PROFESSOR': '/dashboard-professor',
      'ALUNO': '/dashboard-aluno',
      'RESPONSAVEL': '/dashboard-responsaveis'
    };

    return dashboardRoutes[role];
  }

  redirectToUserDashboard(): string | null {
    const user = this.getCurrentUser();
    if (user) {
      return this.getDashboardRoute(user.role);
    }
    return null;
  }
}