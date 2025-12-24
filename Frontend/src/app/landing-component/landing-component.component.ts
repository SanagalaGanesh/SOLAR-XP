import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent
  ],
  template: `
  <div class="landing">

    <!-- NAVBAR -->
    <nav class="landing-navbar">
      <div class="logo">☀️ <strong>Esolar</strong></div>

      <div class="menu">
        <!-- LOGGED OUT -->
        <ng-container *ngIf="!isLoggedIn">
          <button class="login-btn" (click)="openLogin()">Login</button>
          <button class="signup-btn" (click)="openSignup()">Sign Up</button>
        </ng-container>

        <!-- LOGGED IN -->
        <ng-container *ngIf="isLoggedIn">
          <button class="login-btn" (click)="goDashboard()">Dashboard</button>
          <button class="signup-btn" (click)="logout()">Logout</button>
        </ng-container>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <h1>Power Your Future With Solar Energy</h1>
        <p>Clean • Renewable • Affordable</p>

        <button
          class="hero-btn"
          *ngIf="!isLoggedIn"
          (click)="openSignup()">
          Get Started
        </button>
      </div>
    </section>

    <!-- SOLAR MODELS -->
    <section class="solar-section">
      <h2 class="section-title">Our Solar Panel Models</h2>

      <div class="solar-cards">

        <div class="solar-card">
          <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276">
          <h3>Monocrystalline Panels</h3>
          <p>High efficiency panels with sleek design.</p>
          <button class="view-btn" (click)="goToModel('mono')">View More</button>
        </div>

        <div class="solar-card">
          <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d">
          <h3>Polycrystalline Panels</h3>
          <p>Cost-effective panels for large installations.</p>
          <button class="view-btn" (click)="goToModel('poly')">View More</button>
        </div>

        <div class="solar-card">
          <img src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d">
          <h3>Thin Film Panels</h3>
          <p>Flexible panels for commercial usage.</p>
          <button class="view-btn" (click)="goToModel('thin')">View More</button>
        </div>

      </div>
    </section>

    <!-- LOGIN MODAL -->
    <app-login
      *ngIf="showLogin"
      (close)="closeAll()"
      (openForgotPassword)="openForgotPassword()">
    </app-login>

    <!-- SIGNUP MODAL -->
    <app-signup
      *ngIf="showSignup"
      (close)="closeAll()">
    </app-signup>

    <!-- FORGOT PASSWORD MODAL -->
    <app-forgot-password
      *ngIf="showForgotPassword"
      (close)="closeAll()"
      (backToLogin)="openLogin()">
    </app-forgot-password>

  </div>
  `,
  styleUrls: ['./landing-component.component.scss']
})
export class LandingComponent implements OnInit {

  showLogin = false;
  showSignup = false;
  showForgotPassword = false;

  isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.refreshAuthState();
  }

  /** 🔐 CHECK AUTH STATE */
  refreshAuthState(): void {
    const token = localStorage.getItem('accessToken'); // ✅ FIXED
    this.isLoggedIn = !!token;
  }

  /** NAVIGATION */
  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    this.isLoggedIn = false;
    this.router.navigateByUrl('/landing', { replaceUrl: true });
  }

  /** MODALS */
  openLogin(): void {
    this.showLogin = true;
    this.showSignup = false;
    this.showForgotPassword = false;
  }

  openSignup(): void {
    this.showSignup = true;
    this.showLogin = false;
    this.showForgotPassword = false;
  }

  openForgotPassword(): void {
    this.showForgotPassword = true;
    this.showLogin = false;
    this.showSignup = false;
  }

  closeAll(): void {
    this.showLogin = false;
    this.showSignup = false;
    this.showForgotPassword = false;
    this.refreshAuthState(); // ✅ IMPORTANT
  }

  goToModel(type: 'mono' | 'poly' | 'thin'): void {
    this.router.navigate(['/solar', type]);
  }
}
