import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, concatMap, of } from 'rxjs';
import { AuthService, User } from '../auth.service';
import { LoginPageComponent } from './login-page.component';

class MockAuthService {
  constructor() {}

  user$: Observable<User> = of({
    username: 'katie',
    email: 'katie@example.com',
    firstName: 'Katie',
    lastName: 'Noake',
  });

  signIn(email: string, password: string): Observable<User> {
    return this.user$.pipe(
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

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
      imports: [
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatToolbarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid if no inputs ', () => {
    component.signInForm.setValue({ username: '', password: '' });
    expect(component.signInForm.valid).toBeFalse();
  });

  it('should be valid if inputs', () => {
    component.signInForm.setValue({ username: 'katie', password: 'hello' });
    expect(component.signInForm.valid).toBeTrue();
  });

  it('should have a form with a notAuthorized error if username or password is incorrect', () => {
    const formData = {
      username: 'katie@example.com',
      password: 'hello',
    };
    component.signInForm.setValue(formData);
    component.onSubmit();

    expect(component.signInForm.controls.password.errors).toEqual({
      notAuthorized: true,
    });
  });

  it('should have a form with a locked error if the user is locked', () => {
    const formData = {
      username: 'james@example.com',
      password: 'hello',
    };
    component.signInForm.setValue(formData);
    component.onSubmit();

    expect(component.signInForm.controls.password.errors).toEqual({
      tooManyAttempts: true,
    });
  });

  it('should have a form with an expired error if the user is expired', () => {
    const formData = {
      username: 'anna@example.com',
      password: 'hello',
    };
    component.signInForm.setValue(formData);
    component.onSubmit();

    expect(component.signInForm.controls.password.errors).toEqual({
      accountExpired: true,
    });
  });
});

describe('LoginPageComponent routing', () => {
  let harness: RouterTestingHarness;
  let component: LoginPageComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatToolbarModule,
      ],
      declarations: [LoginPageComponent],
      providers: [
        provideRouter([{ path: '**', component: LoginPageComponent }]),
        { provide: AuthService, useClass: MockAuthService },
      ],
    });

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('', LoginPageComponent);
  });

  it('should navigate when user found', fakeAsync(() => {
    const formData = {
      username: 'katie@example.com',
      password: 'hellomoto',
    };
    component.signInForm.setValue(formData);
    component.onSubmit();

    tick();

    expect(TestBed.inject(Router).url).toEqual('/welcome');
  }));

  it('should not navigate when user not found', fakeAsync(() => {
    const formData = {
      username: 'katie@example.com',
      password: 'hello',
    };
    component.signInForm.setValue(formData);
    component.onSubmit();

    tick();

    expect(TestBed.inject(Router).url).toEqual('/');
  }));
});
