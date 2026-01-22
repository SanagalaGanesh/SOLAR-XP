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
  templateUrl: './landing-component.component.html',
  styleUrls: ['./landing-component.component.scss']
})
export class LandingComponent implements OnInit {

  showLogin = false;
  showSignup = false;
  showForgotPassword = false;

  isLoggedIn = false;

  /* 🔥 HERO CAROUSEL (ADDED) */
  currentSlide = 0;

  heroImages: string[] = [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1920',
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1920'
  ];

  /* 🔥 SOLAR PANELS DATA (ADDED) */
  solarModels = [
    {
      id: 'mono',
      name: 'Monocrystalline Panels',
      type: 'monocrystalline',
      description: 'High-efficiency panels with sleek black design, perfect for residential rooftops with limited space.',
      efficiency: '22% Efficiency',
      badge: 'premium',
      specs: {
        power: '320-400W',
        size: 'Compact Size',
        warranty: '25 Year Warranty'
      },
      price: 299,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600'
    },
    {
      id: 'poly',
      name: 'Polycrystalline Panels',
      type: 'polycrystalline',
      description: 'Cost-effective blue panels ideal for large-scale commercial installations and spacious residential properties.',
      efficiency: '18% Efficiency',
      badge: 'value',
      specs: {
        power: '280-350W',
        size: 'Commercial Grade',
        warranty: '20 Year Warranty'
      },
      price: 199,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600'
    },
    {
      id: 'thin',
      name: 'Thin Film Panels',
      type: 'thin-film',
      description: 'Ultra-thin, flexible panels for curved surfaces, vehicles, and portable solar applications.',
      efficiency: '15% Efficiency',
      badge: 'flexible',
      specs: {
        power: '100-200W',
        size: 'Versatile Use',
        warranty: '15 Year Warranty'
      },
      price: 149,
      image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600'
    }
  ];

  filteredModels = [...this.solarModels]; // Initialize with all models

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.refreshAuthState();

    /* 🔥 AUTO SLIDE (ADDED) */
    setInterval(() => {
      this.currentSlide =
        (this.currentSlide + 1) % this.heroImages.length;
    }, 4000);
  }

  /** 🔥 FILTER MODELS METHOD (ADDED) */
  filterModels(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredModels = [...this.solarModels];
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    this.filteredModels = this.solarModels.filter(model =>
      model.name.toLowerCase().includes(term) ||
      model.description.toLowerCase().includes(term) ||
      model.type.toLowerCase().includes(term)
    );
  }

  /** 🔐 CHECK AUTH STATE */
  refreshAuthState(): void {
    const token = localStorage.getItem('accessToken');
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
    this.refreshAuthState();
  }

  openSolarAssistant(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.openLogin();
      return;
    }

    this.router.navigateByUrl('/solar-assistant');
  }

  goToModel(type: 'mono' | 'poly' | 'thin'): void {
    this.router.navigate(['/solar', type]);
  }
}