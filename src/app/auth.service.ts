import { Injectable } from '@angular/core';
import { Observable, concatMap, delay, of } from 'rxjs';

interface User {
  /**
   * The username of the user.
   */
  username: string;

  /**
   * The email address of the user.
   */
  email: string;

  /**
   * The first name of the user.
   */
  firstName: string;

  /**
   * The last name of the user.
   */
  lastName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  user$: Observable<User> = of({
    username: 'katie',
    email: 'katie@pojo.uk',
    firstName: 'Katie',
    lastName: 'Noake',
  });

  signIn(email: string, password: string): Observable<User> {
    return this.user$.pipe(
      delay(2000),

      concatMap((user) => {
        if (email == 'katie@example.com' && password == 'hellomoto') {
          return of(user);
        } else {
          if (email == 'anna@example.com') {
            throw new Error('expired');
          } else if (email == 'james@example.com') {
            throw new Error('locked');
          } else {
            throw new Error('unauthorized');
          }
        }
      })
    );
  }
}
