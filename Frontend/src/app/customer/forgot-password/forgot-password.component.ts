import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="auth-card" (click)="$event.stopPropagation()">

        <h2>Reset Password</h2>
        <p class="subtitle">No worries! We'll help you get back in.</p>

        <!-- STEP 1 -->
        <form *ngIf="step === 1"
              [formGroup]="emailForm"
              (ngSubmit)="sendResetCode()">

          <label>Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            formControlName="email"
          />

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Sending...' : 'Get Reset Code' }}
          </button>
        </form>

        <!-- STEP 2 -->
        <form *ngIf="step === 2"
              [formGroup]="resetForm"
              (ngSubmit)="changePassword()">

          <label>Reset Code</label>
          <input
            type="text"
            placeholder="Enter code from email"
            formControlName="token"
          />

          <label>New Password</label>
          <input
            type="password"
            placeholder="New strong password"
            formControlName="newPassword"
          />

          <button class="success-btn" [disabled]="loading">
            {{ loading ? 'Updating...' : 'Change Password' }}
          </button>
        </form>

        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <p class="success" *ngIf="successMessage">{{ successMessage }}</p>

        <p class="back-text">
          Remember your password?
          <span (click)="backToLogin.emit()">Back to Login</span>
        </p>

      </div>
    </div>
  `,
  styleUrls:['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  @Output() close = new EventEmitter<void>();
  @Output() backToLogin = new EventEmitter<void>();

  step: 1 | 2 = 1;
  loading = false;
  errorMessage = '';
  successMessage = '';
  emailValue = '';

  emailForm!: FormGroup;
  resetForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // STEP 1 → SEND EMAIL
  sendResetCode() {
    if (this.emailForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.emailValue = this.emailForm.value.email;

    this.authService.sendResetToken(this.emailValue).subscribe({
      next: () => {
        this.loading = false;
        this.step = 2;
      },
      error: err => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Failed to send reset code';
      }
    });
  }

  // STEP 2 → RESET PASSWORD
  changePassword() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      email: this.emailValue,
      token: this.resetForm.value.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password changed successfully';

        setTimeout(() => {
          this.backToLogin.emit();
        }, 1200);
      },
      error: err => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Password reset failed';
      }
    });
  }
}
