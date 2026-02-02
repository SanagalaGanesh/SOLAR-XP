import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() openForgotPassword = new EventEmitter<void>();
  @Output() openSignup = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session-expired') {
      this.errorMessage = 'Your session has expired. Please login again.';
    }
  }

  login(): void {
    // 🔴 clear old tokens first
    localStorage.removeItem('accessToken');
    localStorage.removeItem('abp.auth.token');
    localStorage.removeItem('userId');

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

        if (res?.success && res?.result?.accessToken) {
          localStorage.setItem('accessToken', res.result.accessToken);
          localStorage.setItem('abp.auth.token', res.result.accessToken);
          localStorage.setItem('userId', res.result.userId.toString());

          this.router.navigateByUrl('/dashboard', { replaceUrl: true });
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  switchToSignup(): void {
    this.openSignup.emit();
  }
}
