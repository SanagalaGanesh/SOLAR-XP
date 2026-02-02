import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  loading = false;
  searchTerm: string = '';
  filteredProducts: any[] = [];
  
  // New properties for enhanced functionality
  apiStatus: any = null;
  showDebugInfo = false;
  debugInfo: any = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.adminService.getAllProducts().subscribe({
      next: (res) => {
        console.log('Products API response:', res); // Debug log
        console.log('Products data:', res.result); // Debug log
        
        // Handle different API response structures
        if (res && res.result) {
          this.products = Array.isArray(res.result) ? res.result : [];
        } else if (Array.isArray(res)) {
          this.products = res;
        } else if (res && res.data) {
          this.products = Array.isArray(res.data) ? res.data : [];
        } else {
          this.products = [];
        }
        
        this.filteredProducts = [...this.products];
        console.log('Processed products:', this.products); // Debug log
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        console.error('Error details:', error.status, error.message); // Debug log
        this.loading = false;
        this.showError('Failed to load products. Please check console for details.');
      }
    });
  }

  // New method for reloading products
  reloadProducts(): void {
    console.clear();
    console.log('🔁 Reloading products...');
    this.loadProducts();
  }

  searchProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      (product.type && product.type.toLowerCase().includes(term)) ||
      (product.watt && product.watt.toString().includes(term)) ||
      (product.basePrice && product.basePrice.toString().includes(term)) ||
      (product.subsidy && product.subsidy.toString().includes(term))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProducts = [...this.products];
  }

  calculateNetPrice(product: any): number {
    if (!product || !product.basePrice || !product.subsidy) return 0;
    return product.basePrice - product.subsidy;
  }

  getMaxWattage(): number {
    if (this.products.length === 0) return 0;
    const wattages = this.products.map(p => p.watt || 0).filter(w => !isNaN(w));
    return wattages.length > 0 ? Math.max(...wattages) : 0;
  }

  // New method: Get total wattage
  getTotalWattage(): number {
    return this.products.reduce((sum, product) => sum + (product.watt || 0), 0);
  }

  getTotalSubsidy(): number {
    return this.products.reduce((sum, product) => sum + (product.subsidy || 0), 0);
  }

  getTotalNetPrice(): number {
    return this.products.reduce((sum, product) => sum + (this.calculateNetPrice(product) || 0), 0);
  }

  getFilteredNetValue(): number {
    return this.filteredProducts.reduce((sum, product) => sum + (this.calculateNetPrice(product) || 0), 0);
  }

  getProductIcon(type: string): string {
    if (!type) return '📦';
    
    const icons: { [key: string]: string } = {
      'Solar Panel': '☀️',
      'Solar Inverter': '⚡',
      'Solar Battery': '🔋',
      'Charge Controller': '🎛️',
      'Mounting Structure': '🏗️',
      'Solar Cable': '🔌',
      'Solar Pump': '💧',
      'Solar Water Heater': '♨️',
      'default': '📦'
    };
    
    return icons[type] || icons['default'];
  }

  getProductClass(type: string): string {
    if (!type) return 'solar-accessory';
    
    if (type.includes('Panel')) return 'solar-panel';
    if (type.includes('Inverter')) return 'solar-inverter';
    if (type.includes('Battery')) return 'solar-battery';
    return 'solar-accessory';
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this solar product?')) return;

    console.log('Attempting to delete product ID:', id); // Debug log
    
    this.adminService.deleteProduct(id).subscribe({
      next: (res) => {
        console.log('Delete response:', res); // Debug log
        this.showSuccess('Solar product deleted successfully');
        this.loadProducts(); // Refresh the list
      },
      error: (error) => {
        console.error('Delete error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error response:', error.error);
        
        let errorMsg = 'Failed to delete product';
        if (error.status === 404) {
          errorMsg = 'Product not found';
        } else if (error.status === 400) {
          errorMsg = 'Bad request - check product ID';
        } else if (error.status === 500) {
          errorMsg = 'Server error - please try again later';
        } else if (error.status === 0) {
          errorMsg = 'Cannot connect to server. Make sure backend is running.';
        }
        
        this.showError(errorMsg);
      }
    });
  }

  // New method: View product details
  viewProductDetails(id: number): void {
    console.log('Viewing product ID:', id);
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.debugInfo = {
        product: product,
        netPrice: this.calculateNetPrice(product),
        subsidyPercentage: product.basePrice ? ((product.subsidy / product.basePrice) * 100).toFixed(1) + '%' : 'N/A',
        apiResponse: 'Viewing product details...'
      };
      this.showDebugInfo = true;
      
      // Test getting single product
      this.adminService.getProductById(id).subscribe({
        next: (res) => {
          console.log('Product by ID response:', res);
          this.debugInfo.apiResponse = res;
        },
        error: (err) => {
          console.error('Error getting product by ID:', err);
          this.debugInfo.apiResponse = `Error: ${err.message}`;
        }
      });
    }
  }

  // New method: Export products to JSON
  exportProducts(): void {
    const dataStr = JSON.stringify(this.products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `solar-products-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    this.showSuccess(`Exported ${this.products.length} products to ${exportFileDefaultName}`);
  }

  // Updated testAPI method with API status
  testAPI(): void {
    console.log('🔧 Testing API endpoints...');
    
    this.apiStatus = {
      type: 'loading',
      icon: '⏳',
      message: 'Testing API connection...'
    };

    // Test Get All Products
    this.adminService.getAllProducts().subscribe({
      next: (res) => {
        console.log('✅ GetAllProducts success:', res);
        this.apiStatus = {
          type: 'success',
          icon: '✅',
          message: `API Connected! Found ${res.result?.length || 0} products`
        };
        
        // Auto-clear status after 5 seconds
        setTimeout(() => {
          this.apiStatus = null;
        }, 5000);
      },
      error: (err) => {
        console.error('❌ GetAllProducts error:', err);
        this.apiStatus = {
          type: 'error',
          icon: '❌',
          message: `API Error: ${err.status || 'Unknown'} - ${err.message || 'Connection failed'}`
        };
        
        // Auto-clear error after 10 seconds
        setTimeout(() => {
          this.apiStatus = null;
        }, 10000);
      }
    });
    
    // Test Create Product
    const testProduct = {
      type: 'Test Solar Panel',
      watt: 100,
      basePrice: 5000,
      subsidy: 1000
    };
    
    this.adminService.createProduct(testProduct).subscribe({
      next: (res) => console.log('✅ CreateProduct success:', res),
      error: (err) => console.error('❌ CreateProduct error:', err)
    });
  }

  // Updated logProductData method
  logProductData(): void {
    console.log('=== PRODUCTS DEBUG INFO ===');
    console.log('Total products:', this.products.length);
    console.log('Filtered products:', this.filteredProducts.length);
    console.log('Search term:', this.searchTerm);
    console.log('Loading state:', this.loading);
    console.log('API Status:', this.apiStatus);
    console.log('--- Product Details ---');
    this.products.forEach((product, index) => {
      console.log(`[${index + 1}] ID: ${product.id}, Type: ${product.type}, Watt: ${product.watt}, Price: ₹${product.basePrice}, Subsidy: ₹${product.subsidy}`);
    });
    
    // Log API endpoints
    console.log('--- API Endpoints ---');
    console.log('Get All Products: GET /api/services/app/Solar/GetAllProducts');
    console.log('Create Product: POST /api/services/app/Solar/CreateProduct');
    console.log('Update Product: PUT /api/services/app/Solar/UpdateProduct');
    console.log('Delete Product: DELETE /api/services/app/Solar/DeleteProduct?id={id}');
    
    console.log('=== END DEBUG INFO ===');
    
    // Show debug panel
    this.debugInfo = {
      totalProducts: this.products.length,
      filteredProducts: this.filteredProducts.length,
      searchTerm: this.searchTerm,
      loading: this.loading,
      sampleProduct: this.products[0] || 'No products available'
    };
    this.showDebugInfo = true;
  }

  // New method: Toggle debug panel
  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }

  // New method: Add mock data for testing
  addMockData(): void {
    const mockProducts = [
      { id: 1, type: 'Solar Panel 100W', watt: 100, basePrice: 5000, subsidy: 1000, description: 'High efficiency solar panel', efficiency: 21.5, warranty: 25 },
      { id: 2, type: 'Solar Panel 200W', watt: 200, basePrice: 9000, subsidy: 1500, description: 'Medium efficiency solar panel', efficiency: 19.5, warranty: 25 },
      { id: 3, type: 'Solar Inverter 1KW', watt: 1000, basePrice: 15000, subsidy: 3000, description: 'Pure sine wave inverter', efficiency: 97, warranty: 10 },
      { id: 4, type: 'Solar Battery 150AH', watt: 150, basePrice: 12000, subsidy: 2000, description: 'Deep cycle solar battery', efficiency: 95, warranty: 5 },
    ];
    
    this.products = [...mockProducts, ...this.products];
    this.filteredProducts = [...this.products];
    this.showSuccess('Mock data added for testing');
  }

  // New method: Clear all data
  clearAllData(): void {
    if (confirm('Are you sure you want to clear all product data? This is for testing only.')) {
      this.products = [];
      this.filteredProducts = [];
      this.searchTerm = '';
      this.showSuccess('All product data cleared');
    }
  }

  // New method: Check if product exists by ID
  checkProductExists(id: number): boolean {
    return this.products.some(product => product.id === id);
  }

  // New method: Get product by ID
  getProductById(id: number): any {
    return this.products.find(product => product.id === id);
  }

  // New method: Calculate subsidy percentage
  calculateSubsidyPercentage(product: any): string {
    if (!product || !product.basePrice || product.basePrice === 0) return '0%';
    const percentage = ((product.subsidy || 0) / product.basePrice) * 100;
    return percentage.toFixed(1) + '%';
  }

  private showSuccess(message: string): void {
    alert(`✅ ${message}`);
  }

  private showError(message: string): void {
    alert(`❌ ${message}`);
  }
}