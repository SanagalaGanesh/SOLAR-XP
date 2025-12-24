import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page">

    <h2>Total Customers</h2>

    <div class="table-card">

      <table>
        <thead>
          <tr>
            <th class="center">S.No</th>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Username</th>
            <th class="center">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let c of customers; let i = index">
            <td class="center">{{ i + 1 }}</td>

            <td class="name">
              {{ c.name }} {{ c.surname }}
            </td>

            <td>{{ c.emailAddress }}</td>

            <td>{{ c.userName }}</td>

            <td class="center">
              <span
                class="status"
                [class.active]="c.isActive"
                [class.inactive]="!c.isActive">
                {{ c.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>

          <tr *ngIf="customers.length === 0">
            <td colspan="5" class="empty">
              No customers found
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
  `,
  styles: [`
    /* PAGE */
    .page {
      width: 100%;
    }

    h2 {
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    /* CARD */
    .table-card {
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 14px 30px rgba(0,0,0,0.08);
      overflow-x: auto;
    }

    /* TABLE */
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 700px;
    }

    th {
      padding: 14px;
      background: #f9fafb;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
      text-align: left;
    }

    td {
      padding: 14px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
      color: #374151;
    }

    tbody tr:hover {
      background: #f3f4f6;
    }

    /* ALIGNMENT */
    .center {
      text-align: center;
    }

    .name {
      font-weight: 500;
    }

    /* STATUS */
    .status {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }

    .status.active {
      background: #dcfce7;
      color: #166534;
    }

    .status.inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    /* EMPTY STATE */
    .empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-style: italic;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      table {
        font-size: 13px;
      }

      th, td {
        padding: 10px;
      }
    }
  `]
})
export class AdminCustomersComponent implements OnInit {

  customers: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.adminService.getCustomers().subscribe({
      next: (res: any) => {
        this.customers = res.result?.items || [];
      }
    });
  }
}
