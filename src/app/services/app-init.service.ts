import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(private authService: AuthService) { }

  init(): Promise<any> {
    return new Promise((resolve) => {
      this.authService.isAuthenticated().subscribe(isAuth => {
        if (!isAuth) {
          this.authService.checkClientaHeadersAndAuthenticate().subscribe(hasClientaHeaders => {
            console.log('App initialization complete. Clienta headers found:', hasClientaHeaders);
            resolve(true);
          });
        } else {
          console.log('App initialization complete. User already authenticated.');
          resolve(true);
        }
      });
    });
  }
}
