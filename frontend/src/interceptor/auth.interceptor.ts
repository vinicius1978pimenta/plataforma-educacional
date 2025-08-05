import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Adiciona o token de acesso às requisições
    const accessToken = this.authService.getAccessToken();
    
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se receber 401 (token expirado), tenta renovar o token
        if (error.status === 401 && this.authService.getRefreshToken()) {
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              // Repete a requisição original com o novo token
              const newAccessToken = this.authService.getAccessToken();
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`
                }
              });
              return next.handle(newReq);
            }),
            catchError((refreshError) => {
              // Se não conseguir renovar o token, faz logout
              this.authService.logout().subscribe();
              return throwError(() => refreshError);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }
}