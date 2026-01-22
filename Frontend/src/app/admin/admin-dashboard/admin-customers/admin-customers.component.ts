import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.scss']
})
export class AdminCustomersComponent implements OnInit {

  customers: any[] = [];
  filteredCustomers: any[] = [];   
  searchText: string = '';         
  showModal: boolean = false;
  selectedCustomer: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.adminService.getCustomers().subscribe({
      next: (res: any) => {
        this.customers = res.result?.items || [];
        this.filteredCustomers = [...this.customers];
      }
    });
  }
  // Filter customers based on search text
applySearch(): void {
  const value = this.searchText.toLowerCase().trim();

  this.filteredCustomers = this.customers.filter(c =>
    `${c.name} ${c.surname}`.toLowerCase().includes(value) ||
    c.emailAddress?.toLowerCase().includes(value) ||
    c.userName?.toLowerCase().includes(value)
  );
}
// Clear the search input and reset the filtered list
clearSearch(): void {
  this.searchText = '';
  this.filteredCustomers = [...this.customers];
}

  openCustomerDetails(customer: any): void {
    this.selectedCustomer = customer;
    this.showModal = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCustomer = null;
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}