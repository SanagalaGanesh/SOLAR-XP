import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolarService } from '../services/solar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="dashboard">

    <!-- HEADER -->
    <header class="dashboard-header">
      <div>
        <h2>☀️ SolarQuote</h2>
        <p class="welcome">Welcome back, {{ userName }} 👋</p>
      </div>

      <div class="profile">
        <div class="avatar">
          {{ userName ? userName[0].toUpperCase() : 'U' }}
        </div>
        <button class="logout" (click)="logout()">Logout</button>
      </div>
    </header>

    <!-- STATS -->
    <section class="stats">
      <div class="stat-card purple">
        <span>Total Quotes</span>
        <h3>{{ totalQuotes() }}</h3>
      </div>

      <div class="stat-card blue">
        <span>Processing</span>
        <h3>{{ processingQuotes() }}</h3>
      </div>

      <div class="stat-card yellow">
        <span>Ready Quotes</span>
        <h3>{{ readyQuotes() }}</h3>
      </div>

      <div class="stat-card pink">
        <span>Orders</span>
        <h3>{{ ordersCount() }}</h3>
      </div>
    </section>

    <!-- REQUEST NEW QUOTE -->
    <section class="primary-action">
      <button
        class="primary-btn"
        [disabled]="hasPendingQuote"
        (click)="openForm()">
        {{ hasPendingQuote
          ? 'Request Pending (Wait for Approval)'
          : '➕ Request New Quote'
        }}
      </button>
    </section>

    <!-- QUOTE HISTORY -->
    <section class="table-card">
      <div class="table-header">
        <h3>📄 My Quote History</h3>
      </div>

      <table class="quote-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Items</th>
            <th>Price</th>
            <th>Address</th>
            <th>Status / Action</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let q of myQuotes; let i = index">
            <td class="sno">
              {{ i + 1 }}<br />
              <small class="date">{{ q.date }}</small>
            </td>

            <td>
              <div *ngFor="let item of q.items" class="item-name">
                {{ item.product }}
              </div>
            </td>

            <td>
              <div *ngFor="let item of q.items">
                <span *ngIf="item.status !== 'Pending'" class="price">
                  ₹{{ item.price }}
                </span>
                <span *ngIf="item.status === 'Pending'" class="muted">—</span>
              </div>
            </td>

            <td class="address">{{ q.address }}</td>

            <td>
              <div *ngFor="let item of q.items" class="action-row">
                <button
                  *ngIf="item.canBuy && item.status === 'Approved'"
                  class="buy-btn"
                  (click)="placeOrder(item.itemId)">
                  Buy Now
                </button>

                <span *ngIf="item.status === 'Ordered'" class="status ordered">
                  Ordered
                </span>

                <span *ngIf="item.status === 'Pending'" class="status pending">
                  Pending
                </span>
              </div>
            </td>
          </tr>

          <tr *ngIf="myQuotes.length === 0">
            <td colspan="5" class="empty">No quotes found</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- REQUEST QUOTE MODAL -->
    <div class="overlay" *ngIf="showQuoteForm">
      <div class="quote-form-card">

        <h3 class="form-title">Request Solar Quote</h3>

        <div class="form-group">
          <label>Mobile Number</label>
          <input [(ngModel)]="mobile" />
        </div>

        <div class="form-group">
          <label>Address Line 1</label>
          <input [(ngModel)]="address1" />
        </div>

        <div class="form-group">
          <label>Address Line 2</label>
          <input [(ngModel)]="address2" />
        </div>

        <div class="form-group">
          <label>Panel Types</label>
          <label><input type="checkbox" (change)="toggleType('Solar Poly')"> Solar Poly</label>
          <label><input type="checkbox" (change)="toggleType('Solar Mono')"> Solar Mono</label>
          <label><input type="checkbox" (change)="toggleType('Solar Thin')"> Solar Thin</label>
        </div>

        <div class="form-group">
          <label>Wattage</label>
          <label><input type="checkbox" (change)="toggleWatt(450)"> 450W</label>
          <label><input type="checkbox" (change)="toggleWatt(850)"> 850W</label>
          <label><input type="checkbox" (change)="toggleWatt(1000)"> 1000W</label>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" (click)="closeForm()">Cancel</button>
          <button class="submit-btn" (click)="submitQuote()">Submit</button>
        </div>

      </div>
    </div>

  </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  userName = 'User';
  userId!: number; // ✅ ADD THIS

  totalQuotes = signal(0);
  processingQuotes = signal(0);
  readyQuotes = signal(0);
  ordersCount = signal(0);

  myQuotes: any[] = [];
  hasPendingQuote = false;

  showQuoteForm = false;

  mobile = '';
  address1 = '';
  address2 = '';
  selectedTypes: string[] = [];
  selectedWatts: number[] = [];

  constructor(
    private solarService: SolarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.router.navigateByUrl('/landing', { replaceUrl: true });
      return;
    }

    // ✅ DECODE JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      this.userId = Number(
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      );

      this.userName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
        || 'User';

    } catch {
      this.logout();
      return;
    }

    // ✅ NOW FETCH DATA WITH USER ID
    this.loadMyQuotes();
  }

  loadMyQuotes(): void {
    this.solarService.getMyQuotes(this.userId).subscribe({
      next: (res: any) => {
        this.myQuotes = Array.isArray(res?.result) ? res.result : [];

        this.hasPendingQuote = this.myQuotes.some(q =>
          q.items?.some((i: any) => i.status === 'Pending')
        );

        const allItems = this.myQuotes.flatMap(q => q.items ?? []);

        this.totalQuotes.set(allItems.length);
        this.processingQuotes.set(allItems.filter(i => i.status === 'Pending').length);
        this.readyQuotes.set(allItems.filter(i => i.status === 'Approved').length);
        this.ordersCount.set(allItems.filter(i => i.status === 'Ordered').length);
      },
      error: (err) => {
        if (err.status === 401) {
          alert('Session expired. Please login again.');
          this.logout();
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    this.router.navigateByUrl('/landing', { replaceUrl: true });
  }

  placeOrder(itemId: number): void {
    if (!confirm('Place order for this item?')) return;

    this.solarService.placeOrder({ itemId }).subscribe({
      next: () => {
        alert('Order placed successfully!');
        this.loadMyQuotes();
      }
    });
  }

  openForm(): void {
    this.showQuoteForm = true;
  }

  closeForm(): void {
    this.showQuoteForm = false;
  }

  toggleType(type: string): void {
    this.selectedTypes.includes(type)
      ? this.selectedTypes = this.selectedTypes.filter(t => t !== type)
      : this.selectedTypes.push(type);
  }

  toggleWatt(watt: number): void {
    this.selectedWatts.includes(watt)
      ? this.selectedWatts = this.selectedWatts.filter(w => w !== watt)
      : this.selectedWatts.push(watt);
  }

  submitQuote(): void {
    if (!this.mobile || !this.address1 || !this.selectedTypes.length || !this.selectedWatts.length) {
      alert('Please fill all fields');
      return;
    }

    this.solarService.submitQuote({
      mobile: this.mobile,
      addressLine1: this.address1,
      addressLine2: this.address2,
      selectedTypes: this.selectedTypes,
      selectedWatts: this.selectedWatts
    }).subscribe({
      next: () => {
        alert('Quote submitted successfully!');
        this.closeForm();
        this.resetForm();
        this.loadMyQuotes();
      }
    });
  }

  resetForm(): void {
    this.mobile = '';
    this.address1 = '';
    this.address2 = '';
    this.selectedTypes = [];
    this.selectedWatts = [];
  }
}

