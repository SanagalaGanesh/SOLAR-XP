import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Subscription, filter } from 'rxjs';

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
  purchasesExpanded = true; // Add this property

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
  private liveDataInterval: any;

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardCounts();
    this.simulateLiveData();
    
    // Check current route on init
    this.checkCurrentRoute();
    
    // Subscribe to route changes
    this.subscriptions.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.checkCurrentRoute();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.liveDataInterval) {
      clearInterval(this.liveDataInterval);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    // Close purchases menu when collapsing sidebar
    if (!this.sidebarOpen) {
      this.purchasesExpanded = false;
    } else {
      // Check if current route is a purchase route
      this.checkCurrentRoute();
    }
  }

  togglePurchasesMenu(): void {
    this.purchasesExpanded = !this.purchasesExpanded;
  }

  checkCurrentRoute(): void {
    const currentUrl = this.router.url;
    // Expand purchases menu if we're on any purchase-related route
    if (currentUrl.includes('/admin/orders') || 
        currentUrl.includes('/admin/approved') || 
        currentUrl.includes('/admin/pending')) {
      this.purchasesExpanded = true;
    }
  }

  isDashboardRoute(): boolean {
    return this.router.url === '/admin' || this.router.url === '/admin/';
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
      }, error => {
        console.error('Error loading customers:', error);
        this.totalCustomers = 0;
      })
    );

    // Orders
    this.subscriptions.push(
      this.adminService.getAdminOrders().subscribe((res: any) => {
        const orders = res.result || [];
        this.totalOrders = orders.length;
        
        // Filter approved orders (status = 'Ordered')
        this.approvedOrders = orders.filter(
          (o: any) => o.status === 'Ordered'
        ).length;
        
        // Calculate revenue (example: $500 per order)
        this.revenue = orders.length * 500;
      }, error => {
        console.error('Error loading orders:', error);
        this.totalOrders = 0;
        this.approvedOrders = 0;
        this.revenue = 0;
      })
    );

    // Pending Quotes
    this.subscriptions.push(
      this.adminService.getPendingQuotes().subscribe((res: any) => {
        this.pendingOrders = res.result?.length || 0;
      }, error => {
        console.error('Error loading pending quotes:', error);
        this.pendingOrders = 0;
      })
    );

    // Approved Quotes (if separate endpoint)
    this.subscriptions.push(
      this.adminService.getApprovedQuotes().subscribe((res: any) => {
        const approved = res.result?.length || 0;
        // Use whichever is larger between orders and quotes
        this.approvedOrders = Math.max(this.approvedOrders, approved);
      }, error => {
        console.error('Error loading approved quotes:', error);
      })
    );
  }

  simulateLiveData(): void {
    // Initial values
    this.energyGenerated = Math.floor(Math.random() * 5000) + 1000;
    this.co2Reduction = Math.round(this.energyGenerated * 0.5);
    
    // Update every 30 seconds for live feel
    this.liveDataInterval = setInterval(() => {
      this.energyGenerated += Math.floor(Math.random() * 100);
      this.co2Reduction = Math.round(this.energyGenerated * 0.5);
      
      // Also update some chart data for live feel
      const lastIndex = this.monthlyOrders.length - 1;
      this.monthlyOrders[lastIndex] += Math.floor(Math.random() * 10);
      this.monthlyRevenue[lastIndex] += Math.floor(Math.random() * 50);
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

  getRevenueLinePoints(): string {
    const points = this.monthlyRevenue.map((value, index) => {
      const x = (index / (this.monthlyRevenue.length - 1)) * 100;
      const y = 100 - this.getBarHeight(value, this.getMaxValue(this.monthlyRevenue));
      return `${x},${y}`;
    }).join(' ');
    
    return points;
  }

  // Helper method for pie chart animation
  getPieSliceTransform(index: number): string {
    let rotation = 0;
    for (let i = 0; i < index; i++) {
      rotation += this.panelTypes[i].value * 3.6;
    }
    return `rotate(${rotation}deg)`;
  }
}