import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolarService {

  // ✅ Backend Base URL
  private readonly BASE_URL =
    'http://192.168.168.76:5000/api/services/app/Solar';

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Get logged-in user's quotes
   * 🔥 Backend expects userId as QUERY PARAM
   * Example:
   * GET /GetMyQuotes?userId=4
   */
  getMyQuotes(userId: number): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.get<any>(
      `${this.BASE_URL}/GetMyQuotes`,
      { params }
    );
  }

  /**
   * 🔹 Submit a new solar quote
   */
  submitQuote(payload: {
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    selectedTypes: string[];
    selectedWatts: number[];
  }): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/SubmitQuote`,
      payload
    );
  }

  /**
   * 🔹 Place order for an approved quote item
   */
  placeOrder(payload: { itemId: number }): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/PlaceOrder`,
      payload
    );
  }
}
