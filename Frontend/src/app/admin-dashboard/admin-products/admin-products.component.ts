import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">

    <div class="header">
      <h2>📦 Products</h2>
      <button class="btn" (click)="openForm()">➕ Add Product</button>
    </div>

    <!-- PRODUCTS TABLE -->
    <table class="table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Type</th>
          <th>Watt</th>
          <th>Base Price</th>
          <th>Subsidy</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let p of products; let i = index">
          <td>{{ i + 1 }}</td>
          <td>{{ p.type }}</td>
          <td>{{ p.watt }} W</td>
          <td>₹{{ p.basePrice }}</td>
          <td>₹{{ p.subsidy }}</td>
          <td>
            <button (click)="editProduct(p)">✏️</button>
            <button (click)="deleteProduct(p.id)">🗑️</button>
          </td>
        </tr>

        <tr *ngIf="products.length === 0">
          <td colspan="6">No products found</td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL -->
    <div class="overlay" *ngIf="showForm">
      <div class="card">
        <h3>{{ editing ? 'Edit' : 'Add' }} Product</h3>

        <input placeholder="Type" [(ngModel)]="form.type" />
        <input type="number" placeholder="Watt" [(ngModel)]="form.watt" />
        <input type="number" placeholder="Base Price" [(ngModel)]="form.basePrice" />
        <input type="number" placeholder="Subsidy" [(ngModel)]="form.subsidy" />

        <div class="actions">
          <button (click)="save()">Save</button>
          <button (click)="closeForm()">Cancel</button>
        </div>
      </div>
    </div>

  </div>
  `,
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {

  products: any[] = [];

  showForm = false;
  editing = false;

  form: any = {
    id: 0,
    type: '',
    watt: 0,
    basePrice: 0,
    subsidy: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getAllProducts().subscribe(res => {
      this.products = res.result || [];
    });
  }

  openForm(): void {
    this.editing = false;
    this.form = { id: 0, type: '', watt: 0, basePrice: 0, subsidy: 0 };
    this.showForm = true;
  }

  editProduct(p: any): void {
    this.editing = true;
    this.form = { ...p };
    this.showForm = true;
  }

  save(): void {
    const api = this.editing
      ? this.adminService.updateProduct(this.form)
      : this.adminService.createProduct(this.form);

    api.subscribe(() => {
      alert('Saved successfully');
      this.closeForm();
      this.loadProducts();
    });
  }

  deleteProduct(id: number): void {
    if (!confirm('Delete this product?')) return;

    this.adminService.deleteProduct(id).subscribe(() => {
      alert('Deleted');
      this.loadProducts();
    });
  }

  closeForm(): void {
    this.showForm = false;
  }
}
