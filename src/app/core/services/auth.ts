import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { appReady, currentUser, userAccounts, userInfoLoading } from '@stores/auth.store';
import { categories } from '@stores/information.store';
import { catchError, firstValueFrom, of, take, tap, timeout } from 'rxjs';
import { Information } from './information';
import { handleApiError } from '@helpers/error.helper';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private isBrowser: boolean;
  private token: string | null = null;
  private jwtHelper = new JwtHelperService();
  private baseUrl: string = `${environment.apiUrlBase}auth/`;

  constructor(private httpClient: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private informationService: Information) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(payload: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}login`, payload);
  }

  // LIMPIAR SESIÓN (USO EN COMPONENTE PERFIL)
  clearSession() {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      sessionStorage.clear();

      currentUser.set(null);

      this.router.navigate(['/auth/login']);
    }
  }

   // MANEJO DE TOKEN
  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('auth_token', token);
      this.token = token;
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // VERIFICACIÓN SI ESTA AUTENTICADO
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
      return false;
    }
  }

  getCurrentUser(): Observable<any> {
    userInfoLoading.set(true);
    return this.httpClient.get<any>(`${this.baseUrl}me`).pipe(
      tap({
        next: (response) => {
          if (response.success && response.data) {
            currentUser.set(response.data);
          }
        },
        error: () => {
          currentUser.set(null);
        },
        finalize: () => {
          userInfoLoading.set(false);
        }
      }),
      take(1)
    );
  }

  async initializeApp(): Promise<void> {
    const isBrowser = isPlatformBrowser(this.platformId);

    const token = this.getToken();
    if (!token) {
      appReady.set(true);
      return;
    }

    const isExpired = this.jwtHelper.isTokenExpired(token);

    if (isExpired) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      currentUser.set(null);
      appReady.set(true);
      return;
    }

    try {
      await firstValueFrom(this.getCurrentUser().pipe(catchError(() => of(null))));
    } catch {
      appReady.set(true);
      return;
    }

    const user = currentUser();

    if (user) {
      try {
        await firstValueFrom(
          this.informationService.getAccountInformation().pipe(timeout(15000), take(1), tap((response) => {
              if (response.success && response.data) {
                userAccounts.set(response.data);
              }
            }),
            catchError((error) => {
              handleApiError(error);
              return of(null);
            })
          )
        );
      } catch {}

      try {
        await firstValueFrom(
          this.informationService.getCategories().pipe(timeout(15000), take(1), tap((response) => {
              if (response.success && response.data) {
                categories.set(response.data);
              }
            }),
            catchError((error) => {
              handleApiError(error);
              return of(null);
            })
          )
        );
      } catch {}
    }

    appReady.set(true);
  }
}
