import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map, shareReplay } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../auth.service';

export interface SignIn {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  signInForm = new FormGroup({
    username: new FormControl('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  submitting = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private authService: AuthService
  ) {}

  get username() {
    return this.signInForm.get('username');
  }

  get password() {
    return this.signInForm.get('password');
  }

  onSubmit(): void {
    this.submitting = true;

    this.authService
      .signIn(
        this.signInForm.controls.username.value,
        this.signInForm.controls.password.value
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/welcome']);
        },
        error: (error: Error) => {
          console.log('boo');
          this.submitting = false;
          if (error.message === 'expired') {
            this.signInForm.controls.password.setErrors({
              accountExpired: true,
            });
          } else if (error.message === 'locked') {
            this.signInForm.controls.password.setErrors({
              tooManyAttempts: true,
            });
          } else {
            this.signInForm.controls.password.setErrors({
              notAuthorized: true,
            });
          }
        },
      });
  }
}
