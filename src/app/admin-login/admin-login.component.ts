import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="login-container">
    <div class="login-card">

      <h2 class="login-h2">Admin Login</h2>

      <div class="form-group">
        <label>Email / Username</label>
        <input
          type="text"
          [(ngModel)]="username"
          placeholder="admin@example.com">
      </div>

      <div class="form-group">
        <label>Password</label>
        <input
          type="password"
          [(ngModel)]="password"
          placeholder="••••••••">
      </div>

      <button (click)="login()" [disabled]="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <p class="error" *ngIf="errorMessage">
        {{ errorMessage }}
      </p>

    </div>
  </div>
  `,
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {

  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      userNameOrEmailAddress: this.username,
      password: this.password,
      rememberClient: true
    }).subscribe({
      next: (res: any) => {
        this.loading = false;

        const token = res?.result?.accessToken;
        const userId = res?.result?.userId;

        if (!token) {
          this.errorMessage = 'Invalid credentials';
          return;
        }

        // 🔥 CLEAR USER SESSION (IMPORTANT)
        localStorage.removeItem('access_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('USER_TOKEN');
        localStorage.removeItem('userId');

        // ✅ STORE ADMIN SESSION
        localStorage.setItem('ADMIN_TOKEN', token);
        localStorage.setItem('ADMIN_ID', String(userId));
        localStorage.setItem('ROLE', 'ADMIN');

        // 🚀 REDIRECT
        this.router.navigateByUrl('/admin', { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.error?.message || 'Admin login failed';
      }
    });
  }
}
