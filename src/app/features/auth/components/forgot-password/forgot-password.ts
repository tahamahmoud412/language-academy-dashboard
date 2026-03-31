import {
  Component,
  ChangeDetectionStrategy,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { Confirmation } from '../../../../shared/components/confirmation/confirmation';

@Component({
  selector: 'app-forgot-password',
  imports: [Confirmation, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Output to request Sign In modal
  openSignIn = output<void>();

  // Input to control modal from parent
  open = input<boolean>(true);
  closed = output<void>();

  // Internal signal for modal state
  isOpen = signal(false);

  // Multi-step flow: 1 = Email, 2 = OTP, 3 = Reset Password
  currentStep = signal<1 | 2 | 3>(1);

  // Store email across steps
  storedEmail = signal('');
  // Store OTP across steps
  storedOtp = signal('');

  // Forms
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;

  // State
  isSubmitting = signal(false);
  apiError = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Resend OTP state
  resendCooldown = signal(0);
  private resendTimer: ReturnType<typeof setInterval> | null = null;

  // Success popup
  showConfirmation = signal(false);
  confirmTitle = signal('تم تغيير كلمة المرور بنجاح!');
  confirmMessage = signal('يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
  confirmIcon = signal('pi pi-check-circle text-green-500 text-6xl');

  constructor() {
    this.initForms();

    effect(() => {
      this.isOpen.set(this.open());

      if (isPlatformBrowser(this.platformId)) {
        if (this.open()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  private initForms(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
    });

    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Form control getters
  get emailControl() {
    return this.emailForm.get('email');
  }
  get otpControl() {
    return this.otpForm.get('otp');
  }
  get passwordControl() {
    return this.resetForm.get('password');
  }
  get confirmPasswordControl() {
    return this.resetForm.get('password_confirmation');
  }

  shouldShowError(controlName: string): boolean {
    const form = this.getCurrentForm();
    const control = form.get(controlName);
    const hasFieldError = !!this.fieldErrors()[controlName];
    return !!(control && (control.invalid || hasFieldError) && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const fieldError = this.fieldErrors()[controlName];
    if (fieldError) return fieldError;

    const form = this.getCurrentForm();
    const control = form.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'هذا الحقل مطلوب';
    if (errors['email']) return 'البريد الإلكتروني غير صالح';
    if (errors['minlength']) {
      return `يجب ألا يقل عن ${errors['minlength'].requiredLength} أحرف`;
    }
    if (errors['maxlength']) {
      return `يجب ألا يزيد عن ${errors['maxlength'].requiredLength} أحرف`;
    }

    return 'قيمة غير صالحة';
  }

  hasPasswordMismatch(): boolean {
    return (
      this.resetForm.hasError('passwordMismatch') &&
      !!this.confirmPasswordControl?.touched
    );
  }

  private getCurrentForm(): FormGroup {
    switch (this.currentStep()) {
      case 1:
        return this.emailForm;
      case 2:
        return this.otpForm;
      case 3:
        return this.resetForm;
    }
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.isOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.resetAll();
    this.closed.emit();
    if (this.router.url.startsWith('/auth')) {
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    this.apiError.set(null);
    this.fieldErrors.set({});
    const step = this.currentStep();
    if (step === 2) {
      this.currentStep.set(1);
    } else if (step === 3) {
      this.currentStep.set(2);
    }
  }

  // ─── Step 1: Send OTP to email ───
  onSubmitEmail(event: Event): void {
    event.preventDefault();
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.fieldErrors.set({});

    const email = this.emailForm.value.email.trim().toLowerCase();
    this.storedEmail.set(email);

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.currentStep.set(2);
        this.startResendCooldown();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.handleError(error);
      },
    });
  }

  // ─── Step 2: Verify OTP ───
  onSubmitOtp(event: Event): void {
    event.preventDefault();
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.fieldErrors.set({});

    const otp = this.otpForm.value.otp.trim();
    this.storedOtp.set(otp);

    this.authService.verifyOtp({ email: this.storedEmail(), otp }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.currentStep.set(3);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.handleError(error);
      },
    });
  }

  // ─── Step 3: Reset Password ───
  onSubmitReset(event: Event): void {
    event.preventDefault();
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.fieldErrors.set({});

    const payload = {
      email: this.storedEmail(),
      otp: this.storedOtp(),
      password: this.resetForm.value.password,
      password_confirmation: this.resetForm.value.password_confirmation,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close();
        this.showConfirmation.set(true);

        setTimeout(() => {
          this.showConfirmation.set(false);
          this.openSignIn.emit();
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.handleError(error);
      },
    });
  }

  // ─── Resend OTP ───
  resendOtp(): void {
    if (this.resendCooldown() > 0 || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.apiError.set(null);

    this.authService.forgotPassword({ email: this.storedEmail() }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.startResendCooldown();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.handleError(error);
      },
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown.set(60);
    if (this.resendTimer) clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      const val = this.resendCooldown();
      if (val <= 1) {
        this.resendCooldown.set(0);
        if (this.resendTimer) {
          clearInterval(this.resendTimer);
          this.resendTimer = null;
        }
      } else {
        this.resendCooldown.set(val - 1);
      }
    }, 1000);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  private handleError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.apiError.set('حدث خطأ. يرجى المحاولة مرة أخرى.');
      return;
    }

    if (error.status === 422 && error.error?.errors) {
      const backendErrors: Record<string, string> = {};
      const errorObj = error.error.errors;

      for (const field in errorObj) {
        if (Object.prototype.hasOwnProperty.call(errorObj, field)) {
          backendErrors[field] = Array.isArray(errorObj[field])
            ? errorObj[field][0]
            : String(errorObj[field]);
        }
      }

      this.fieldErrors.set(backendErrors);
      return;
    }

    if (error.status === 429) {
      this.apiError.set('تم تجاوز عدد المحاولات المسموح. يرجى الانتظار ثم المحاولة مرة أخرى.');
      return;
    }

    if (error.error?.message) {
      this.apiError.set(error.error.message);
      return;
    }

    this.apiError.set('حدث خطأ. يرجى المحاولة مرة أخرى.');
  }

  clearErrors(): void {
    if (this.apiError()) {
      this.apiError.set(null);
    }
    if (Object.keys(this.fieldErrors()).length > 0) {
      this.fieldErrors.set({});
    }
  }

  closeForgotPasswordAndOpenSignIn(): void {
    this.close();
    this.openSignIn.emit();
  }

  private resetAll(): void {
    this.currentStep.set(1);
    this.storedEmail.set('');
    this.storedOtp.set('');
    this.emailForm.reset();
    this.otpForm.reset();
    this.resetForm.reset();
    this.apiError.set(null);
    this.fieldErrors.set({});
    this.resendCooldown.set(0);
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }
}
