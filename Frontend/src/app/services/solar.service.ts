import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolarService {

  // ✅ Backend Base URL
  private readonly BASE_URL =
    'http://192.168.168.76:5000/api/services/app';

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
      `${this.BASE_URL}/Solar/GetMyQuotes`,
      { params }
    );
  }

  /**
   * 🔹 Submit a new solar quote
   */

submitQuote(payload: {
  userId: number;
  mobile: string;
  addressLine1: string; 
  addressLine2: string;
  selectedTypes: string[];
  selectedWatts: number[];
}) {
  return this.http.post(
    'http://192.168.168.76:5000/api/services/app/Solar/SubmitQuote',
    payload
  );
}


  /**
   * 🔹 Place order for an approved quote item
   */
  placeOrder(payload: { itemId: number }): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/Solar/PlaceOrder`,
      payload
    );
  }

  /**
   * 🔹 Chat with Solar Bot Assistant
   * Used for interactive chatbot conversations about solar panels
   */
  chatWithSolarBot(payload: {
    currentStep: string;
    userResponse: string;
    savedPurpose: string;
    savedBill: string;
    savedCuts: string;
  }): Observable<any> {
    // Set headers for text/plain response type
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/plain'
    });

    return this.http.post(
      `${this.BASE_URL}/SolarChat/Interact`,
      payload,
      { 
        headers,
        responseType: 'text' 
      }
    );
  }
}