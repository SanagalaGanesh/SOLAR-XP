import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html', 
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  @Output() close = new EventEmitter<void>();
  @Output() openLogin = new EventEmitter<void>();

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
onClose(event: MouseEvent): void {
  event.stopPropagation();
  this.close.emit();
}
onLoginClick(event: MouseEvent): void {
  event.stopPropagation();
  this.openLogin.emit();
  // this.router.navigate(['/login']);
}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
