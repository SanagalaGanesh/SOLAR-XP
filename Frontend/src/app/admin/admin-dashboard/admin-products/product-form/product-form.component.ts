import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  isEditing = false;
  productId?: number;
  
  form: any = {
    id: 0,
    type: '',
    watt: 0,
    basePrice: 0,
    subsidy: 0,
    description: '',
    efficiency: 21.5,
    warranty: 25
  };

  loading = false;
  apiStatus: any = null;
  showDebugInfo = false;
  debugInfo: any = {};
  
  productTypes = [
    'Solar Panel',
    'Solar Inverter',
    'Solar Battery',
    'Charge Controller',
    'Mounting Structure',
    'Solar Cable',
    'Solar Pump',
    'Solar Water Heater',
    'Solar Street Light',
    'Solar Home System'
  ];
  
  wattageOptions = [100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 5000, 10000];
  
  warrantyOptions = [
    { value: 1, label: '1 Year' },
    { value: 2, label: '2 Years' },
    { value: 3, label: '3 Years' },
    { value: 5, label: '5 Years' },
    { value: 10, label: '10 Years' },
    { value: 15, label: '15 Years' },
    { value: 20, label: '20 Years' },
    { value: 25, label: '25 Years' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.productId = +params['id'];
        console.log('Editing product ID:', this.productId); // Debug
        this.loadProduct();
      } else {
        this.isEditing = false;
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.form = {
      id: 0,
      type: '',
      watt: 0,
      basePrice: 0,
      subsidy: 0,
      description: '',
      efficiency: 21.5,
      warranty: 25
    };
  }

  loadProduct(): void {
    this.loading = true;
    this.apiStatus = {
      type: 'loading',
      icon: '⏳',
      message: 'Loading product details...'
    };
    
    if (this.productId) {
      console.log('Loading product with ID:', this.productId); // Debug
      
      this.adminService.getProductById(this.productId).subscribe({
        next: (res) => {
          console.log('Product API response:', res); // Debug
          
          if (res && res.result) {
            this.form = { 
              id: res.result.id || 0,
              type: res.result.type || '',
              watt: res.result.watt || 0,
              basePrice: res.result.basePrice || 0,
              subsidy: res.result.subsidy || 0,
              description: res.result.description || '',
              efficiency: res.result.efficiency || 21.5,
              warranty: res.result.warranty || 25
            };
            
            console.log('Loaded form data:', this.form); // Debug
            
            this.apiStatus = {
              type: 'success',
              icon: '✅',
              message: 'Product loaded successfully'
            };
            
            setTimeout(() => {
              this.apiStatus = null;
            }, 3000);
          } else {
            console.warn('Product not found in response:', res);
            this.showError('Product not found in the database');
            this.router.navigate(['../'], { relativeTo: this.route });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          console.error('Error details:', error.status, error.message); // Debug
          
          this.apiStatus = {
            type: 'error',
            icon: '❌',
            message: `Failed to load product: ${error.status || 'Unknown error'}`
          };
          
          this.loading = false;
          
          // Don't redirect immediately, show error and let user decide
          setTimeout(() => {
            this.apiStatus = null;
          }, 5000);
        }
      });
    }
  }

  validateForm(): boolean {
    const errors: string[] = [];

    if (!this.form.type.trim()) {
      errors.push('Please select product type');
    }
    
    if (!this.form.watt || this.form.watt <= 0) {
      errors.push('Wattage must be greater than 0');
    }
    
    if (!this.form.basePrice || this.form.basePrice <= 0) {
      errors.push('Base price must be greater than 0');
    }
    
    if (this.form.subsidy < 0) {
      errors.push('Subsidy cannot be negative');
    }
    
    if (this.form.subsidy > this.form.basePrice) {
      errors.push('Subsidy cannot exceed base price');
    }
    
    if (this.form.efficiency && (this.form.efficiency < 0 || this.form.efficiency > 100)) {
      errors.push('Efficiency must be between 0% and 100%');
    }
    
    if (this.form.warranty && this.form.warranty < 0) {
      errors.push('Warranty cannot be negative');
    }

    if (errors.length > 0) {
      this.showError(errors.join('\n'));
      return false;
    }
    
    return true;
  }

  calculateNetPrice(): number {
    return (this.form.basePrice || 0) - (this.form.subsidy || 0);
  }

  calculateSubsidyPercentage(): number {
    if (!this.form.basePrice || this.form.basePrice === 0) return 0;
    return ((this.form.subsidy || 0) / this.form.basePrice) * 100;
  }

  updateCalculations(): void {
    // Force recalculation of derived values
    const netPrice = this.calculateNetPrice();
    const subsidyPercentage = this.calculateSubsidyPercentage();
    
    // Update debug info
    this.debugInfo = {
      ...this.debugInfo,
      netPrice,
      subsidyPercentage: subsidyPercentage.toFixed(1) + '%',
      isValid: this.validateForm()
    };
  }

  onTypeChange(): void {
    // Set default values based on product type
    if (this.form.type.includes('Panel')) {
      this.form.efficiency = 21.5;
      this.form.warranty = 25;
    } else if (this.form.type.includes('Battery')) {
      this.form.efficiency = 95;
      this.form.warranty = 5;
    } else if (this.form.type.includes('Inverter')) {
      this.form.efficiency = 97;
      this.form.warranty = 10;
    } else if (this.form.type.includes('Controller')) {
      this.form.efficiency = 98;
      this.form.warranty = 3;
    }
    
    this.updateCalculations();
  }

  save(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.apiStatus = {
      type: 'loading',
      icon: '⏳',
      message: this.isEditing ? 'Updating product...' : 'Creating product...'
    };

    // Prepare product data - include only fields that your API supports
    const productData: any = {
      id: this.form.id,
      type: this.form.type,
      watt: this.form.watt,
      basePrice: this.form.basePrice,
      subsidy: this.form.subsidy
    };

    // Optional fields - only include if they have values
    if (this.form.description?.trim()) {
      productData.description = this.form.description;
    }
    
    if (this.form.efficiency) {
      productData.efficiency = this.form.efficiency;
    }
    
    if (this.form.warranty) {
      productData.warranty = this.form.warranty;
    }

    console.log('Saving product data:', productData); // Debug

    if (this.isEditing) {
      this.adminService.updateProduct(productData).subscribe({
        next: (res) => {
          console.log('Update response:', res); // Debug
          
          this.apiStatus = {
            type: 'success',
            icon: '✅',
            message: 'Solar product updated successfully'
          };
          
          setTimeout(() => {
            this.apiStatus = null;
            this.showSuccess('Solar product updated successfully');
            this.router.navigate(['../'], { relativeTo: this.route });
          }, 1500);
        },
        error: (error) => {
          console.error('Update error:', error);
          console.error('Error details:', error.status, error.message, error.error);
          
          this.apiStatus = {
            type: 'error',
            icon: '❌',
            message: `Update failed: ${error.status || 'Unknown error'}`
          };
          
          this.loading = false;
          
          let errorMsg = 'Failed to update product';
          if (error.status === 404) {
            errorMsg = 'Product not found';
          } else if (error.status === 400) {
            errorMsg = 'Invalid data - please check your inputs';
          } else if (error.status === 500) {
            errorMsg = 'Server error - please try again later';
          } else if (error.status === 0) {
            errorMsg = 'Cannot connect to server. Make sure backend is running.';
          }
          
          setTimeout(() => {
            this.apiStatus = null;
            this.showError(errorMsg);
          }, 2000);
        }
      });
    } else {
      // Remove id for create operations
      delete productData.id;
      
      this.adminService.createProduct(productData).subscribe({
        next: (res) => {
          console.log('Create response:', res); // Debug
          
          this.apiStatus = {
            type: 'success',
            icon: '✅',
            message: 'Solar product created successfully'
          };
          
          setTimeout(() => {
            this.apiStatus = null;
            this.showSuccess('Solar product created successfully');
            this.router.navigate(['../'], { relativeTo: this.route });
          }, 1500);
        },
        error: (error) => {
          console.error('Create error:', error);
          console.error('Error details:', error.status, error.message, error.error);
          
          this.apiStatus = {
            type: 'error',
            icon: '❌',
            message: `Creation failed: ${error.status || 'Unknown error'}`
          };
          
          this.loading = false;
          
          let errorMsg = 'Failed to create product';
          if (error.status === 400) {
            errorMsg = 'Invalid data - please check your inputs';
          } else if (error.status === 500) {
            errorMsg = 'Server error - please try again later';
          } else if (error.status === 0) {
            errorMsg = 'Cannot connect to server. Make sure backend is running.';
          }
          
          setTimeout(() => {
            this.apiStatus = null;
            this.showError(errorMsg);
          }, 2000);
        }
      });
    }
  }

  cancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  // New method: Check for unsaved changes
  hasUnsavedChanges(): boolean {
    // For new products, check if any field is filled
    if (!this.isEditing) {
      return Object.values(this.form).some(value => 
        value !== 0 && value !== '' && value !== 21.5 && value !== 25
      );
    }
    return false;
  }

  // New method: Test current form data
  testFormData(): void {
    console.log('=== FORM DEBUG INFO ===');
    console.log('Form data:', this.form);
    console.log('Is editing:', this.isEditing);
    console.log('Product ID:', this.productId);
    console.log('Net price:', this.calculateNetPrice());
    console.log('Subsidy %:', this.calculateSubsidyPercentage() + '%');
    console.log('Validation:', this.validateForm() ? 'Valid' : 'Invalid');
    console.log('=== END DEBUG INFO ===');
    
    this.debugInfo = {
      formData: this.form,
      netPrice: this.calculateNetPrice(),
      subsidyPercentage: this.calculateSubsidyPercentage().toFixed(1) + '%',
      isValid: this.validateForm(),
      isEditing: this.isEditing,
      productId: this.productId
    };
    this.showDebugInfo = true;
  }

  // New method: Toggle debug info
  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }

  // New method: Fill with sample data for testing
  fillSampleData(): void {
    if (confirm('Fill form with sample data for testing?')) {
      this.form = {
        id: this.isEditing ? this.form.id : 0,
        type: 'Solar Panel',
        watt: 500,
        basePrice: 25000,
        subsidy: 5000,
        description: 'High efficiency monocrystalline solar panel with 25-year warranty',
        efficiency: 21.5,
        warranty: 25
      };
      this.updateCalculations();
      this.showSuccess('Sample data loaded for testing');
    }
  }

  // New method: Calculate price per watt
  calculatePricePerWatt(): number {
    if (!this.form.watt || this.form.watt === 0) return 0;
    return this.calculateNetPrice() / this.form.watt;
  }

  // New method: Validate subsidy percentage
  validateSubsidyPercentage(): boolean {
    const percentage = this.calculateSubsidyPercentage();
    return percentage >= 0 && percentage <= 100;
  }

  private showSuccess(message: string): void {
    // You could replace this with a toast notification
    alert(`✅ ${message}`);
  }

  private showError(message: string): void {
    // You could replace this with a toast notification
    alert(`❌ ${message}`);
  }
}