import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PendingItem {
  id: number;
  customerName: string;
  email: string;
  orderType: string;
  amount: number;
  date: string;
  status: 'pending' | 'reviewing' | 'escalated';
}

@Component({
  selector: 'app-pending-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-list.component.html',
  styles: [`
    /* Add your styles here */
  `]
})
export class PendingListComponent implements OnInit {
  items: PendingItem[] = [
    { id: 1, customerName: 'John Doe', email: 'john@email.com', orderType: 'Solar Panel', amount: 5000, date: '2024-01-15', status: 'pending' },
    { id: 2, customerName: 'Jane Smith', email: 'jane@email.com', orderType: 'Inverter', amount: 1500, date: '2024-01-14', status: 'reviewing' },
    // Add more items
  ];
  
  searchText = '';
  selectedStatus = 'all';
  
  get filteredItems() {
    return this.items.filter(item => {
      const matchesSearch = item.customerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
                          item.email.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || item.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }
  
  ngOnInit() {}
  
  refresh() {
    // Refresh logic
    console.log('Refreshing list...');
  }
}