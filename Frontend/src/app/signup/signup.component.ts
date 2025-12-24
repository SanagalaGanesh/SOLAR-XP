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
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="auth-card" (click)="$event.stopPropagation()">

        <button class="close-btn" (click)="close.emit()">✕</button>
        <h2>Create Account</h2>

        <form [formGroup]="form" (ngSubmit)="createAccount()">

          <input
            type="text"
            placeholder="Username"
            formControlName="userName"
          />

          <input
            type="text"
            placeholder="First Name"
            formControlName="name"
          />

          <input
            type="text"
            placeholder="Last Name"
            formControlName="surname"
          />

          <input
            type="email"
            placeholder="Email"
            formControlName="emailAddress"
          />

          <input
            type="password"
            placeholder="Password"
            formControlName="password"
          />

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>

        <small class="error" *ngIf="errorMessage">
          {{ errorMessage }}
        </small>

        <p class="success" *ngIf="successMessage">
          {{ successMessage }}
        </p>

        <p class="switch-text">
          Already have an account?
          <span class="highlight" (click)="goToLogin()">Login</span>
        </p>

      </div>
    </div>
  `,
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // ✅ ABP USER CREATE (ADMIN TOKEN REQUIRED)
  createAccount(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;

        // ✅ ABP SUCCESS FLAG
        if (res?.success === true) {
          this.successMessage = 'Account created successfully!';

          setTimeout(() => {
            this.close.emit();
            this.router.navigate(['/login']);
          }, 800);

        } else {
          this.errorMessage =
            res?.error?.message || 'Registration failed';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Registration failed';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
