import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AdminService } from '../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  sidebarOpen = true;

  // Dashboard stats
  totalCustomers = 0;
  totalOrders = 0;
  approvedOrders = 0;
  pendingOrders = 0;
  revenue = 0;
  energyGenerated = 0; // MWh
  co2Reduction = 0; // tons

  // Chart data
  monthlyOrders = [65, 80, 50, 90, 70, 85, 60, 95, 75, 85, 90, 100];
  monthlyRevenue = [1200, 1800, 1500, 2200, 1900, 2500, 2100, 2800, 2400, 3000, 3200, 3500];
  panelTypes = [
    { name: 'Monocrystalline', value: 45 },
    { name: 'Polycrystalline', value: 35 },
    { name: 'Thin Film', value: 20 }
  ];

  // Energy production data (simulated)
  energyProduction = [
    { month: 'Jan', value: 1200 },
    { month: 'Feb', value: 1400 },
    { month: 'Mar', value: 1800 },
    { month: 'Apr', value: 2200 },
    { month: 'May', value: 2800 },
    { month: 'Jun', value: 3200 }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardCounts();
    this.simulateLiveData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isDashboardRoute(): boolean {
    return this.router.url === '/admin';
  }

  logout(): void {
    localStorage.removeItem('ADMIN_TOKEN');
    localStorage.removeItem('ROLE');
    this.router.navigateByUrl('/admin-login', { replaceUrl: true });
  }

  loadDashboardCounts(): void {
    // Customers
    this.subscriptions.push(
      this.adminService.getCustomers().subscribe((res: any) => {
        this.totalCustomers = res.result?.items?.length || 0;
      })
    );

    // Orders
    this.subscriptions.push(
      this.adminService.getAdminOrders().subscribe((res: any) => {
        const orders = res.result || [];
        this.totalOrders = orders.length;
        this.approvedOrders = orders.filter(
          (o: any) => o.status === 'Ordered'
        ).length;
        
        // Calculate revenue (example: $500 per order)
        this.revenue = orders.length * 500;
      })
    );

    // Pending Quotes
    this.subscriptions.push(
      this.adminService.getPendingQuotes().subscribe((res: any) => {
        this.pendingOrders = res.result?.length || 0;
      })
    );

    this.subscriptions.push(
      this.adminService.getApprovedQuotes().subscribe((res: any) => {
        this.approvedOrders = res.result?.length || 0;
      })
    );
  }

  simulateLiveData(): void {
    // Simulate energy generated (in MWh)
    this.energyGenerated = Math.floor(Math.random() * 5000) + 1000;
    
    // CO2 reduction calculation (approx 0.5 tons per MWh)
    this.co2Reduction = Math.round(this.energyGenerated * 0.5);
    
    // Update every 30 seconds for live feel
    setInterval(() => {
      this.energyGenerated += Math.floor(Math.random() * 100);
      this.co2Reduction = Math.round(this.energyGenerated * 0.5);
    }, 30000);
  }

  // Helper methods for charts
  getMaxValue(arr: number[]): number {
    return Math.max(...arr) * 1.1; // 10% padding
  }

  getBarHeight(value: number, max: number): number {
    return (value / max) * 100;
  }

  getRevenueColor(value: number): string {
    if (value > 2500) return '#10b981'; // green
    if (value > 1500) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }

  formatRevenue(value: number): string {
    return `$${value.toLocaleString()}`;
  }
  // Add this method to your AdminDashboardComponent class
getRevenueLinePoints(): string {
  const points = this.monthlyRevenue.map((value, index) => {
    const x = index * 10; // 0, 10, 20, ... 110
    const y = 100 - this.getBarHeight(value, this.getMaxValue(this.monthlyRevenue));
    return `${x},${y}`;
  }).join(' ');
  
  return points;
}
}