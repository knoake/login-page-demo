import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  signIn(username: string, password: string): Observable<any> {
    return of();
  }

  forgotPassword(username: string) {}
}
