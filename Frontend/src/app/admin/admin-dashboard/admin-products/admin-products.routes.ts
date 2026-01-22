// src/app/admin/admin-products/products.routes.ts
import { Routes } from '@angular/router';
import { AdminProductsComponent } from './admin-products.component';
import { ProductFormComponent } from './product-form/product-form.component';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: AdminProductsComponent
  },
  {
    path: 'new',
    component: ProductFormComponent
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent
  }
];