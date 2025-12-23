import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const adminToken = localStorage.getItem('ADMIN_TOKEN');
  const userToken  = localStorage.getItem('access_token');

  const token = adminToken || userToken;

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
