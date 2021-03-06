import { Component, OnDestroy } from '@angular/core'
import { Store, select } from '@ngrx/store'
import { AppState } from '../../state'
import { Login, ResetViewState } from '../store/auth.actions'

@Component({
  selector: 'login-page',
  template: `
    <auth-form
      (submitted)="login($event)"
      [pending]="pending$ | async"
      [errorMessage]="error$ | async"
    >
      <h1 class="text-center">Log in</h1>
      <span>Log in</span>
      <p><a routerLink="/">Forgot password?</a></p>
      <p>Don't have an account yet? <a routerLink="/auth/signup">Sign up now!</a></p>
    </auth-form>
  `
})

export class LoginComponent implements OnDestroy {
  pending$ = this.store.pipe(select('auth'), select('view'), select('pending'))
  error$ = this.store.pipe(select('auth'), select('view'), select('error'))

  constructor(private store: Store<AppState>) { }

  ngOnDestroy() {
    this.store.dispatch(new ResetViewState())
  }

  login(formValue) {
    this.store.dispatch(new Login(formValue))
  }
}
