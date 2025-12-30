import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-approved',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Approved Quotes</h2>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Customer</th>
              <th>Solar Model</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let q of approvedQuotes; let i = index">
  <td>{{ i + 1 }}</td>

              <td>
                <b>{{ q.customerName }}</b><br />
                <small>{{ q.mobile }}</small>
              </td>

              <td>
                <div *ngFor="let i of q.items">
                  {{ i.productName }}
                </div>
              </td>

              <td>
                <div *ngFor="let i of q.items" class="amount">
                  ₹ {{ i.price }}
                </div>
              </td>

              <td>
                <span class="status approved">Approved</span>
              </td>
            </tr>

            <tr *ngIf="approvedQuotes.length === 0">
              <td colspan="5" class="empty">
                No approved quotes found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page {
      width: 100%;
    }

    h2 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .table-card {
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
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
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      color: #4b5563;
      vertical-align: top;
    }

    tr:hover {
      background: #f3f4f6;
    }

    .amount {
      font-weight: 600;
      color: #16a34a;
    }

    .status {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }

    .status.approved {
      background: #dcfce7;
      color: #166534;
    }

    .empty {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-style: italic;
    }

    @media (max-width: 768px) {
      table {
        font-size: 14px;
      }

      th, td {
        padding: 10px;
      }
    }
  `]
})
export class AdminApprovedComponent implements OnInit {

  approvedQuotes: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadApprovedQuotes();
  }

  loadApprovedQuotes(): void {
    this.adminService.getApprovedQuotes().subscribe({
      next: (res: any) => {
        this.approvedQuotes = res.result || [];
      }
    });
  }
}