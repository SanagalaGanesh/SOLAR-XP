import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  template: `
  <div class="dashboard" [class.sidebar-collapsed]="!sidebarOpen">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="profile">
        <div class="avatar">A</div>
        <h3 *ngIf="sidebarOpen">ADMIN</h3>
      </div>

      <ul>
        <li routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <span>🏠</span>
          <span *ngIf="sidebarOpen">Dashboard</span>
        </li>

        <li routerLink="/admin/customers" routerLinkActive="active">
          <span>👥</span>
          <span *ngIf="sidebarOpen">Total Customers</span>
        </li>

        <li routerLink="/admin/orders" routerLinkActive="active">
          <span>📦</span>
          <span *ngIf="sidebarOpen">Total Orders</span>
        </li>

        <li routerLink="/admin/approved" routerLinkActive="active">
          <span>✅</span>
          <span *ngIf="sidebarOpen">Approved Orders</span>
        </li>

        <li routerLink="/admin/pending" routerLinkActive="active">
          <span>⏳</span>
          <span *ngIf="sidebarOpen">Pending Orders</span>
        </li>
        <li routerLink="/admin/products" routerLinkActive="active">
  <span>📦</span>
  <span *ngIf="sidebarOpen">Products</span>
</li>


        <li (click)="logout()">
          <span>🚪</span>
          <span *ngIf="sidebarOpen">Logout</span>
        </li>
      </ul>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="content">

      <!-- TOP BAR -->
      <header class="topbar">
        <button class="toggle-btn" (click)="toggleSidebar()">☰</button>
        <h2>Admin Dashboard</h2>
      </header>

      <!-- DASHBOARD HOME -->
      <ng-container *ngIf="isDashboardRoute()">

        <div class="cards">
          <div class="card gradient-blue">
            <h4>Total Customers</h4>
            <p>{{ totalCustomers }}</p>
          </div>

          <div class="card gradient-green">
            <h4>Total Orders</h4>
            <p>{{ totalOrders }}</p>
          </div>

          <div class="card gradient-orange">
            <h4>Approved Orders</h4>
            <p>{{ approvedOrders }}</p>
          </div>

          <div class="card gradient-red">
            <h4>Pending Orders</h4>
            <p>{{ pendingOrders }}</p>
          </div>
        </div>

        <div class="charts">
          <div class="chart-box">
            <h4>Monthly Orders</h4>
            <div class="bar-chart">
              <div style="height: 60%"></div>
              <div style="height: 80%"></div>
              <div style="height: 50%"></div>
              <div style="height: 90%"></div>
              <div style="height: 70%"></div>
            </div>
          </div>

          <div class="chart-box">
            <h4>Customer Growth</h4>
            <svg viewBox="0 0 100 50" class="line-chart">
              <polyline
                fill="none"
                stroke="#6366f1"
                stroke-width="3"
                points="0,40 20,30 40,35 60,20 80,25 100,10"
              />
            </svg>
          </div>
        </div>

      </ng-container>

      <router-outlet></router-outlet>
    </main>
  </div>
  `,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  sidebarOpen = true;

  totalCustomers = 0;
  totalOrders = 0;
  approvedOrders = 0;
  pendingOrders = 0;

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardCounts();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isDashboardRoute(): boolean {
    return this.router.url === '/admin';
  }

logout(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('ROLE');
  localStorage.removeItem('userId');

  this.router.navigateByUrl('/admin-login', { replaceUrl: true });
}



  // 🔢 LOAD COUNTS FROM API
  loadDashboardCounts(): void {

    // Customers
    this.adminService.getCustomers().subscribe((res: any) => {
      this.totalCustomers = res.result?.items?.length || 0;
    });

    // Orders
    this.adminService.getAdminOrders().subscribe((res: any) => {
      const orders = res.result || [];
      this.totalOrders = orders.length;
      this.approvedOrders = orders.filter(
        (o: any) => o.status === 'Ordered'
      ).length;
    });

    // Pending Quotes
    this.adminService.getPendingQuotes().subscribe((res: any) => {
      this.pendingOrders = res.result?.length || 0;
    });
  }
}
