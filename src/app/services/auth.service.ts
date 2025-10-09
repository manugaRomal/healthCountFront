import { Injectable } from '@angular/core';
import { HealthService } from './health.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private healthService: HealthService) { }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  }

 
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeTokenPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
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

  getUserName(): string | null {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const payload = this.decodeTokenPayload(token);
      return payload.name || null;
    } catch (error) {
      console.error('Error extracting name from token:', error);
      return null;
    }
  }

  getUserInfo(): any {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      return this.decodeTokenPayload(token);
    } catch (error) {
      console.error('Error extracting user info from token:', error);
      return null;
    }
  }

  private decodeTokenPayload(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }


  isTokenExpired(): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        return true;
      }

      const payload = this.decodeTokenPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp <= currentTime;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationDate(): Date | null {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const payload = this.decodeTokenPayload(token);
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Token validation from URL (for Clienta integration)
  checkForUrlToken(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      this.validateTokenWithBackend(token);
      this.cleanUrl();
    }
  }

  validateTokenWithBackend(token: string): void {
    this.healthService.validateToken(token).subscribe({
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

  cleanUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
  }

  handleInvalidToken(): void {
    console.error('Invalid or expired token. Please try again.');
    // Could emit an event or show a notification here
  }
}
