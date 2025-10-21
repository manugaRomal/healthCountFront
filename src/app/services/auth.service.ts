import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HealthService } from './health.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://172.210.73.43:8090/api/health';

  constructor(private http: HttpClient, private healthService: HealthService, private router: Router) { }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  }

 
  isAuthenticated(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    try {
      const payload = this.decodeTokenPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp <= currentTime) {
        return of(false);
      }
    } catch (error) {
      return of(false);
    }
    return this.validateTokenViaBearer(token).pipe(
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  getUserEmail(): string | null {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const payload = this.decodeTokenPayload(token);
      return payload.sub || payload.email || null;
    } catch (error) {
      console.error('Error extracting email from token:', error);
      return null;
    }
  }

  private decodeTokenPayload(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  initiateClientaHandshake(key: string, email: string): void {
    const headers = {
      'key': key,
      'email': email
    };

    this.http.get(`${this.apiUrl}/validate-clienta`, { headers }).subscribe({
      next: (response: any) => {
        if (response?.valid && response?.token) {
          this.setToken(response.token);
          console.log('Clienta handshake success for user:', response.user);
        } else {
          this.handleInvalidToken();
        }
      },
      error: (error) => {
        console.error('Clienta handshake failed:', error);
        this.handleInvalidToken();
      }
    });
  }

  ensureValidSession(key?: string, email?: string): void {
    const existing = this.getToken();
    if (existing) {
      this.validateTokenWithBackend(existing);
    } else {
      if (key && email) {
        this.initiateClientaHandshake(key, email);
      } else {
        console.error('Cannot initiate clienta handshake: missing key or email');
        this.handleInvalidToken();
      }
    }
  }

  validateTokenWithBackend(token: string): void {
    const validationMethod = this.validateTokenViaBearer(token);
    
    validationMethod.subscribe({
      next: (response) => {
        if (response.valid) {
          this.setToken(token);
          console.log('Token validated successfully for user:', response.user);
        } else {
          this.handleInvalidToken();
        }
      },
      error: (error) => {
        console.error('Token validation failed:', error);
        this.handleInvalidToken();
      }
    });
  }

  
  validateTokenViaBearer(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-token`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  handleInvalidToken(): void {
    console.error('Invalid or expired token. Please try again.');
    this.router.navigate(['/redirect']);
  }
  authenticateWithClienta(key: string, email: string): void {
    this.initiateClientaHandshake(key, email);
  }
}
