import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const adminToken = localStorage.getItem('ADMIN_TOKEN');
  const userToken = localStorage.getItem('accessToken');

  // 👉 Detect ADMIN APIs
  const isAdminApi =
    req.url.includes('/api/services/app/Solar') ||
    req.url.includes('/api/services/app/User');

  let token: string | null = null;

  if (isAdminApi && adminToken) {
    token = adminToken;       // ✅ ADMIN TOKEN FIRST
  } else if (userToken) {
    token = userToken;        // ✅ USER TOKEN
  }

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
