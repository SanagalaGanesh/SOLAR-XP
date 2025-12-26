import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const role = localStorage.getItem('ROLE'); // 'ADMIN' or 'USER'
  const adminToken = localStorage.getItem('ADMIN_TOKEN');
  const userToken  = localStorage.getItem('access_token');

  let token: string | null = null;

  if (role === 'ADMIN') {
    token = adminToken;
  } else {
    token = userToken;
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
