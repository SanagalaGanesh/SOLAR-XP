import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const adminToken = localStorage.getItem('ADMIN_TOKEN');

    if (adminToken) {
      return true;
    }

    this.router.navigate(['/admin-login']);
    return false;
  }
}
