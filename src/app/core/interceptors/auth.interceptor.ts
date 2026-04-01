import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthDialogService } from '../services/auth-dialog.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const authDialog = inject(AuthDialogService);
  const token = auth.token();
  const isAuthEndpoint = /\/login$|\/register$|\/forgot-password$/i.test(req.url);

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      // Do not hijack auth form requests; let login/register components handle those errors.
      if (err.status === 401 && !isAuthEndpoint) {
        auth.logout();
        authDialog.openLogin();
      }

      return throwError(() => err);
    }),
  );
};
