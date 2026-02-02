import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsDataService {
  private productsKey = 'solar_products_data';
  private productsSubject = new BehaviorSubject<any[]>(this.getStoredProducts());

  // Sample initial data
  private initialProducts = [
    { id: 1, type: 'Solar Panel 100W', watt: 100, basePrice: 5000, subsidy: 1000 },
    { id: 2, type: 'Solar Panel 200W', watt: 200, basePrice: 9000, subsidy: 1500 },
    { id: 3, type: 'Solar Inverter 1KW', watt: 1000, basePrice: 15000, subsidy: 3000 },
    { id: 4, type: 'Solar Battery 150AH', watt: 150, basePrice: 12000, subsidy: 2000 }
  ];

  constructor() {
    // Initialize with sample data if localStorage is empty
    if (this.getStoredProducts().length === 0) {
      this.saveProducts(this.initialProducts);
    }
  }

  private getStoredProducts(): any[] {
    try {
      const data = localStorage.getItem(this.productsKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveProducts(products: any[]): void {
    localStorage.setItem(this.productsKey, JSON.stringify(products));
    this.productsSubject.next(products);
  }

  getAllProducts(): Observable<any> {
    const products = this.getStoredProducts();
    return of({ success: true, result: products }).pipe(delay(300));
  }

  getProductById(id: number): Observable<any> {
    const products = this.getStoredProducts();
    const product = products.find(p => p.id === id);
    return of({ success: true, result: product || null }).pipe(delay(300));
  }

  createProduct(product: any): Observable<any> {
    const products = this.getStoredProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { ...product, id: newId };
    products.push(newProduct);
    this.saveProducts(products);
    return of({ success: true, result: newProduct }).pipe(delay(300));
  }

  updateProduct(product: any): Observable<any> {
    const products = this.getStoredProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
      this.saveProducts(products);
      return of({ success: true, result: product }).pipe(delay(300));
    }
    return of({ success: false, error: 'Product not found' }).pipe(delay(300));
  }

  deleteProduct(id: number): Observable<any> {
    let products = this.getStoredProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
    return of({ success: true }).pipe(delay(300));
  }
}