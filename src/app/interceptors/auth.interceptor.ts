import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    const token = localStorage.getItem('jwt_token');
    
    if (token && this.needsAuth(req.url)) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }

  private needsAuth(url: string): boolean {
    const protectedEndpoints = [
      '/api/health/upload',
      '/api/health/user/current',
      '/api/health/stats'
    ];
    
    return protectedEndpoints.some(endpoint => url.includes(endpoint));
  }
}
