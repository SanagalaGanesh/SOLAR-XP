import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const role = localStorage.getItem('ROLE'); // optional
  const adminToken = localStorage.getItem('ADMIN_TOKEN');
  const userToken = localStorage.getItem('accessToken');

  let token: string | null = role === 'ADMIN' ? adminToken : userToken;

  // 🔎 check JWT expiry (frontend-safe)
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // ❌ Token exists but expired → logout early
  if (token && isTokenExpired(token)) {
    localStorage.clear();
    router.navigate(['/login'], {
      queryParams: { reason: 'session-expired' }
    });
    return next(req); // stop attaching token
  }

  // ✅ Attach token if valid
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  }

  return next(req);
};
