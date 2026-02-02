import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pending.component.html',
  styleUrls: ['./admin-pending.component.scss']
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
