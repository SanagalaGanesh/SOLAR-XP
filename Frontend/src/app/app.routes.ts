import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [

  /* DEFAULT */
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  /* LANDING */
  {
    path: 'landing',
    loadComponent: () =>
      import('./landing-component/landing-component.component')
        .then(m => m.LandingComponent)
  },

  /* AUTH */
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component')
        .then(m => m.SignupComponent)
  },

  /* SOLAR MODEL DETAILS */
  {
    path: 'solar/:type',
    loadComponent: () =>
      import('./solar-model/solar-model.component')
        .then(m => m.SolarModelComponent)
  },

  /* USER DASHBOARD */
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  /* ADMIN LOGIN */
  {
    path: 'admin-login',
    loadComponent: () =>
      import('./admin-login/admin-login.component')
        .then(m => m.AdminLoginComponent)
  },

  /* 🔒 ADMIN DASHBOARD + CHILD ROUTES */
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),

    children: [

      /* DEFAULT ADMIN HOME */
      // {
      //   path: '',
      //   pathMatch: 'full',
      //   loadComponent: () =>
      //     import('./admin-dashboard/admin-dashboard.component')
      //       .then(m => m.AdminDashboardComponent)
      // },

      {
        path: 'customers',
        loadComponent: () =>
          import('./admin-dashboard/admin-customers/admin-customers.component')
            .then(m => m.AdminCustomersComponent)
      },

      {
        path: 'orders',
        loadComponent: () =>
          import('./admin-dashboard/admin-orders/admin-orders.component')
            .then(m => m.AdminOrdersComponent)
      },

      {
        path: 'approved',
        loadComponent: () =>
          import('./admin-dashboard/admin-approved/admin-approved.component')
            .then(m => m.AdminApprovedComponent)
      },

      {
        path: 'pending',
        loadComponent: () =>
          import('./admin-dashboard/admin-pending/admin-pending.component')
            .then(m => m.AdminPendingComponent)
      },

      /* ✅ PRODUCTS (THIS FIXES THE REDIRECT ISSUE) */
      {
        path: 'products',
        loadComponent: () =>
          import('./admin-dashboard/admin-products/admin-products.component')
            .then(m => m.AdminProductsComponent)
      }
    ]
  },

  /* FALLBACK */
  { path: '**', redirectTo: 'landing' }
];