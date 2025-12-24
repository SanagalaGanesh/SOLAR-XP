import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('accessToken'); // ✅ FIXED

    if (token) {
      return true;
    }

    // ❌ Not logged in
    return this.router.parseUrl('/landing');
  }
}
