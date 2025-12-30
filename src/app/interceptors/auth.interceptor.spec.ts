import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 🚫 DO NOT HANDLE SESSION FOR AUTH API
  if (req.url.includes('/TokenAuth/Authenticate')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      const hasToken =
        localStorage.getItem('access_token') ||
        localStorage.getItem('ADMIN_TOKEN');

      // ✅ Session expired ONLY for logged-in users
      if (error.status === 401 && hasToken) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        router.navigate(['/landing']);
      }

      return throwError(() => error);
    })
  );
};
