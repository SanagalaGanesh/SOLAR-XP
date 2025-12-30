import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="modal-backdrop">
  <div class="auth-card" (click)="$event.stopPropagation()">

    <button class="close-btn" (click)="close.emit()">✕</button>
    <h2>Customer Login</h2>

    <form [formGroup]="form" (ngSubmit)="login()">

      <input
        type="email"
        placeholder="Email"
        formControlName="email"
      />

      <small class="error"
        *ngIf="form.controls['email'].touched &&
               form.controls['email'].errors?.['email']">
        Please enter a valid email address
      </small>

      <input
        type="password"
        placeholder="Password"
        formControlName="password"
      />

      <p class="forgot-text" (click)="openForgotPassword.emit()">
        Forgot password?
      </p>

      <button type="submit" [disabled]="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <small class="error" *ngIf="errorMessage">
      {{ errorMessage }}
    </small>

    <p class="switch-text">
      Don’t have an account?
      <span class="highlight" (click)="switchToSignup()">
        Create Account
      </span>
    </p>

  </div>
</div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  @Output() close = new EventEmitter<void>();
  @Output() openForgotPassword = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      userNameOrEmailAddress: this.form.value.email,
      password: this.form.value.password,
      rememberClient: true
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.success === true && res?.result?.accessToken) {

          // ✅ STORE TOKEN (STANDARD KEY)
          localStorage.setItem('accessToken', res.result.accessToken);
          localStorage.setItem('userId', res.result.userId.toString());

          // ✅ NAVIGATE FIRST
          this.router.navigateByUrl('/dashboard', { replaceUrl: true });

          // ✅ CLOSE MODAL AFTER NAVIGATION
          setTimeout(() => this.close.emit(), 0);

        } else {
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Invalid email or password';
      }
    });
  }

  switchToSignup(): void {
    this.router.navigate(['/signup']);
  }
}