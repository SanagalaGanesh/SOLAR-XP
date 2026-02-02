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
      import('./customer/landing-component/landing-component.component')
        .then(m => m.LandingComponent)
  },

  /* AUTH */
  {
    path: 'login',
    loadComponent: () =>
      import('./customer/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./customer/signup/signup.component')
        .then(m => m.SignupComponent)
  },

  /* SOLAR MODEL DETAILS */
  {
    path: 'solar/:type',
    loadComponent: () =>
      import('./customer/solar-model/solar-model.component')
        .then(m => m.SolarModelComponent)
  },

  /* USER DASHBOARD */
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./customer/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  /* ADMIN LOGIN */
  {
    path: 'admin-login',
    loadComponent: () =>
      import('./admin/admin-login/admin-login.component')
        .then(m => m.AdminLoginComponent)
  },

  /* 🔒 ADMIN DASHBOARD + CHILD ROUTES */
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),

    children: [
      /* ✅ CUSTOMERS */
      {
        path: 'customers',
        loadChildren: () =>
          import('./admin/admin-dashboard/admin-customers/admin-customers.routes')
            .then(m => m.CUSTOMERS_ROUTES)
      },
// ✅ ORDERS
      {
        path: 'orders',
        loadChildren: () =>
          import('./admin/admin-dashboard/admin-orders/admin-orders.routes')
            .then(m => m.ORDERS_ROUTES)
      },
// ✅ APPROVED
      {
        path: 'approved',
        loadChildren: () =>
          import('./admin/admin-dashboard/admin-approved/admin-approved.routes')
            .then(m => m.APPROVED_ROUTES)
      },

/* PENDING */
{
  path: 'pending',
  loadChildren: () =>
    import('./admin/admin-dashboard/admin-pending/admin-pending.routes')
      .then(m => m.PENDING_ROUTES)
},

      /* ✅ PRODUCTS (THIS FIXES THE REDIRECT ISSUE) */
      {
        path: 'products',
        loadChildren: () =>
          import('./admin/admin-dashboard/admin-products/admin-products.routes')
            .then(m => m.PRODUCTS_ROUTES)
      }
    ]
  },

  /* FALLBACK */
  { path: '**', redirectTo: 'landing' }
];