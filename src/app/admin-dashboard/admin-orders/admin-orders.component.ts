import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">

    <h2>Total Orders</h2>

    <div class="table-card">

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Model</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          <tr *ngFor="let o of orders; let i = index">
            <!-- S.NO -->
            <td>{{ i + 1 }}</td>

            <td>
              <b>{{ o.customerName }}</b><br>
              <small>{{ o.mobile }}</small>
            </td>

            <td>{{ o.address }}</td>

            <td>{{ o.modelName }}</td>

            <td class="amount">₹ {{ o.amount }}</td>

            <td>
              <span class="status ordered">{{ o.status }}</span>
            </td>
          </tr>

          <tr *ngIf="orders.length === 0">
            <td colspan="6" style="text-align:center">
              No orders found
            </td>
          </tr>

        </tbody>
      </table>

    </div>

  </div>
  `,
  styles: [`
    .page { width: 100%; }
    h2 { margin-bottom: 16px; }

    .table-card {
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 12px;
      background: #f9fafb;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .amount {
      font-weight: 600;
      color: #16a34a;
    }

    .status {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .ordered {
      background: #eef2ff;
      color: #4f46e5;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {

  orders: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.getAdminOrders().subscribe({
      next: (res: any) => {
        this.orders = res.result || [];
      },
      error: () => {
        alert('Failed to load orders');
      }
    });
  }
}
