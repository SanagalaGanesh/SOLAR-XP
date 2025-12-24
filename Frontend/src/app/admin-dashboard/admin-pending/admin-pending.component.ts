import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-pending',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">

      <h2>Pending Quote Requests</h2>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Items</th>
              <th>Prices</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let q of pendingQuotes; let i = index">

              <!-- S.NO -->
              <td>
                {{ i + 1 }} <br />
                <small>{{ q.date }}</small>
              </td>

              <!-- CUSTOMER -->
              <td>
                <b>{{ q.customerName }}</b><br />
                <small>{{ q.mobile }}</small>
              </td>

              <!-- ADDRESS -->
              <td>{{ q.address }}</td>

              <!-- ITEMS -->
              <td>
                <div *ngFor="let item of q.items">
                  {{ item.productName }}
                </div>
              </td>

              <!-- PRICES -->
              <td>
                <div *ngFor="let item of q.items" class="amount">
                  ₹ {{ item.price }}
                </div>
              </td>

              <!-- ACTION -->
              <td>
                <button
                  class="approve-btn"
                  (click)="approve(q.headerId)">
                  Approve
                </button>
              </td>
            </tr>

            <tr *ngIf="pendingQuotes.length === 0">
              <td colspan="6" class="empty">
                No pending requests
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
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    .amount {
      font-weight: 600;
      color: #16a34a;
      margin-bottom: 6px;
    }

    .approve-btn {
      background: #10b981;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
    }

    .approve-btn:hover {
      background: #059669;
    }

    .empty {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-style: italic;
    }
  `]
})
export class AdminPendingComponent implements OnInit {

  pendingQuotes: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.adminService.getPendingQuotes().subscribe({
      next: (res: any) => {
        this.pendingQuotes = res.result || [];
      }
    });
  }

  approve(headerId: number): void {
    if (!confirm('Approve this quote?')) return;

    this.adminService.approveQuote(headerId).subscribe({
      next: () => {
        alert('Quote Approved');
        this.loadPending(); // 🔄 refresh table
      }
    });
  }
}
