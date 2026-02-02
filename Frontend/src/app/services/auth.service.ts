import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // private API_URL = 'http://192.168.168.76:5000';
  private readonly API_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(payload: {
    userNameOrEmailAddress: string;
    password: string;
    rememberClient: boolean;
  }): Observable<any> {
    return this.http.post(
      `${this.API_URL}/api/TokenAuth/Authenticate`,
      payload
    );
  }

  // 📝 REGISTER (ADMIN ONLY)
  register(payload: {
    name: string;
    surname: string;
    userName: string;
    emailAddress: string;
    password: string;
  }): Observable<any> {
    return this.http.post(
      `${this.API_URL}/api/services/app/User/Create`,
      {
        ...payload,
        isActive: true,
        roleNames: []
      }
    );
  }

  // 👤 GET USER
  getUser(id: number): Observable<any> {
    return this.http.get(
      `${this.API_URL}/api/services/app/User/Get?Id=${id}`
    );
  }

  // 🔑 FORGOT PASSWORD - SEND RESET TOKEN
  sendResetToken(email: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/api/PasswordReset/SendResetToken`,
      { email }
    );
  }

  // 🔁 FORGOT PASSWORD - RESET PASSWORD
  resetPassword(payload: {
    email: string;
    token: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post(
      `${this.API_URL}/api/PasswordReset/ResetPassword`,
      payload
    );
  }
}