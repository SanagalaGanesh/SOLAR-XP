import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {

  orders: any[] = [];
  showModal: boolean = false;
  selectedOrder: any = null;
  statusOptions = [
    { value: 'Placed', label: 'Order Placed', color: 'ordered', icon: '📦' },
    { value: 'Processing', label: 'Processing', color: 'processing', icon: '⚙️' },
    { value: 'Shipped', label: 'Shipped', color: 'shipped', icon: '🚚' },
    { value: 'Delivered', label: 'Delivered', color: 'delivered', icon: '✅' },
    { value: 'Cancelled', label: 'Cancelled', color: 'cancelled', icon: '❌' }
  ];
  showStatusDropdown: boolean = false;

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

  openOrderDetails(order: any): void {
    this.selectedOrder = order;
    this.showModal = true;
    this.showStatusDropdown = false;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrder = null;
    this.showStatusDropdown = false;
    document.body.style.overflow = 'auto';
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  updateOrderStatus(newStatus: string): void {
    if (!this.selectedOrder) return;
    
    // Update the selected order status
    this.selectedOrder.status = newStatus;
    
    // Update the order in the orders array
    const orderIndex = this.orders.findIndex(o => o.orderId === this.selectedOrder.orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus;
    }
    
    // For demonstration, simulate updating user panel by updating localStorage
    this.updateUserPanelStatus(this.selectedOrder.orderId, newStatus);
    
    // Show success message
    this.showStatusUpdateSuccess(newStatus);
    
    // Close dropdown
    this.showStatusDropdown = false;
  }

  // This would typically update a shared service or state that both admin and user panels can access
  private updateUserPanelStatus(orderId: string, newStatus: string): void {
    // For frontend-only demo, we'll use localStorage to simulate shared state
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const orderIndex = userOrders.findIndex((order: any) => order.orderId === orderId);
    
    if (orderIndex !== -1) {
      userOrders[orderIndex].status = newStatus;
      localStorage.setItem('userOrders', JSON.stringify(userOrders));
    } else {
      // If not found, store it for the user panel
      const updatedOrder = { ...this.selectedOrder, status: newStatus };
      userOrders.push(updatedOrder);
      localStorage.setItem('userOrders', JSON.stringify(userOrders));
    }
    
    // You could also emit an event that the user panel component listens to
    this.emitStatusUpdateEvent(orderId, newStatus);
  }

  private emitStatusUpdateEvent(orderId: string, newStatus: string): void {
    // Create a custom event that user panel can listen to
    const statusUpdateEvent = new CustomEvent('orderStatusUpdated', {
      detail: { orderId, status: newStatus }
    });
    window.dispatchEvent(statusUpdateEvent);
  }

  private showStatusUpdateSuccess(status: string): void {
    // Create a toast notification style success message
    const successMessage = `Order status updated to: ${status}`;
    
    // You can use a toast service or simple alert
    const toast = document.createElement('div');
    toast.textContent = successMessage;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  formatPhone(phone: string): string {
    if (!phone) return 'N/A';
    // Format phone number: 9988865645 -> 99888 65645
    if (phone.length === 10) {
      return phone.substring(0, 5) + ' ' + phone.substring(5);
    }
    return phone;
  }

  formatAmount(amount: number): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-IN');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'ordered';
    
    const statusMap: {[key: string]: string} = {
      'Placed': 'ordered',
      'Pending': 'ordered',
      'Processing': 'processing',
      'Shipped': 'shipped',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled'
    };
    
    return statusMap[status] || 'ordered';
  }

  getStatusText(status: string): string {
    if (!status) return 'Placed';
    return status;
  }

  getStatusIcon(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : '📦';
  }

  getNextStatusOptions(currentStatus: string): any[] {
    // Define workflow: Placed -> Processing -> Shipped -> Delivered
    // Cancelled can happen at any stage
    const workflow = ['Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = workflow.indexOf(currentStatus);
    
    if (currentIndex === -1) return [];
    
    const availableStatuses = [];
    
    // Add next statuses in workflow
    for (let i = currentIndex + 1; i < workflow.length; i++) {
      const nextStatus = this.statusOptions.find(opt => opt.value === workflow[i]);
      if (nextStatus) {
        availableStatuses.push(nextStatus);
      }
    }
    
    // Add cancelled option if not already delivered or cancelled
    if (currentStatus !== 'Delivered' && currentStatus !== 'Cancelled') {
      const cancelledOption = this.statusOptions.find(opt => opt.value === 'Cancelled');
      if (cancelledOption) {
        availableStatuses.push(cancelledOption);
      }
    }
    
    return availableStatuses;
  }
}