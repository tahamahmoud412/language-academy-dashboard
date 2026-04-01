import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthDialogService {
  private readonly _showLogin = signal(false);
  private readonly _showSignup = signal(false);
  private readonly _showForgotPassword = signal(false);

  readonly showLogin = this._showLogin.asReadonly();
  readonly showSignup = this._showSignup.asReadonly();
  readonly showForgotPassword = this._showForgotPassword.asReadonly();

  openLogin(): void {
    this._showLogin.set(true);
  }

  closeLogin(): void {
    this._showLogin.set(false);
  }

  openSignup(): void {
    this._showSignup.set(true);
  }

  closeSignup(): void {
    this._showSignup.set(false);
  }

  openForgotPassword(): void {
    this._showForgotPassword.set(true);
  }

  closeForgotPassword(): void {
    this._showForgotPassword.set(false);
  }
}

