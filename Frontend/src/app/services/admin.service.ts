import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL =
    'http://192.168.168.76:5000/api/services/app/Solar';

  constructor(private http: HttpClient) {}

  // =========================
  // 👥 CUSTOMERS
  // =========================
  getCustomers(): Observable<any> {
    return this.http.get(
      'http://192.168.168.76:5000/api/services/app/User/GetAll'
    );
  }

  // =========================
  // 📦 ORDERS
  // =========================
  getAdminOrders(): Observable<any> {
    return this.http.get(`${this.API_URL}/GetAdminOrders`);
  }

  // =========================
  // ⏳ PENDING QUOTES
  // =========================
  getPendingQuotes(): Observable<any> {
    return this.http.get(
      `${this.API_URL}/GetAdminRequests?status=Pending`
    );
  }

  // =========================
  // ✅ APPROVE QUOTE
  // =========================
  approveQuote(headerId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/ApproveQuoteHeader`,
      { id: headerId }
    );
  }
getApprovedQuotes(): Observable<any> {
    return this.http.get(
      `${this.API_URL}/GetAdminRequests?status=Approved`
    );
  }
  // ======================================================
  // 🧩 PRODUCTS (CRUD)  ✅ THIS FIXES YOUR ERROR
  // ======================================================

  // 🔹 GET ALL PRODUCTS
  getAllProducts(): Observable<any> {
    return this.http.get(
      `${this.API_URL}/GetAllProducts`
    );
  }

  // 🔹 CREATE PRODUCT
  createProduct(payload: {
    type: string;
    watt: number;
    basePrice: number;
    subsidy: number;
  }): Observable<any> {
    return this.http.post(
      `${this.API_URL}/CreateProduct`,
      payload
    );
  }

  // 🔹 UPDATE PRODUCT
  updateProduct(payload: {
    id: number;
    type: string;
    watt: number;
    basePrice: number;
    subsidy: number;
  }): Observable<any> {
    return this.http.put(
      `${this.API_URL}/UpdateProduct`,
      payload
    );
  }

  // 🔹 DELETE PRODUCT
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(
      `${this.API_URL}/DeleteProduct?id=${id}`
    );
  }
}
