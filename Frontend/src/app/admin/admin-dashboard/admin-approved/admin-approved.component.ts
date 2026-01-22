import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-approved',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-approved.component.html',
  styleUrls: ['./admin-approved.component.scss']
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