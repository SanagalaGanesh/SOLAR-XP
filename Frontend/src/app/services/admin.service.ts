import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL = 'http://localhost:5000/api/services/app/Solar';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<any> {
    return this.http.get('http://localhost:5000/api/services/app/User/GetAll');
  }

  getAdminOrders(): Observable<any> {
    return this.http.get(`${this.API_URL}/GetAdminOrders`);
  }

  getPendingQuotes(): Observable<any> {
    return this.http.get(`${this.API_URL}/GetAdminRequests?status=Pending`);
  }

  getApprovedQuotes(): Observable<any> {
    return this.http.get(`${this.API_URL}/GetAdminRequests?status=Approved`);
  }

  approveQuote(headerId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/ApproveQuoteHeader`, { id: headerId });
  }

  getAllProducts(): Observable<any> {
    return this.http.get(`${this.API_URL}/GetAllProducts`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/GetProductById?id=${id}`);
  }

  createProduct(product: {
    type: string;
    watt: number;
    basePrice: number;
    subsidy: number;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/CreateProduct`, product);
  }

  updateProduct(product: {
    id: number;
    type: string;
    watt: number;
    basePrice: number;
    subsidy: number;
  }): Observable<any> {
    return this.http.put(`${this.API_URL}/UpdateProduct`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/DeleteProduct?id=${id}`);
  }
}