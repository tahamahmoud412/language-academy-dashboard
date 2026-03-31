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
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Confirmation } from '../../../../shared/components/confirmation/confirmation';
import { AuthService } from '../../../../core/services/auth.service';

/** API payload interface for login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Form controls interface for type safety */
interface LoginFormControls {
  email: string;
  password: string;
}

@Component({
  selector: 'app-sigin',
  imports: [Confirmation, ReactiveFormsModule],
  templateUrl: './sigin.html',
  styleUrl: './sigin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sigin {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Outputs for opening modals
  openSignUp = output<void>();
  openForgotPassword = output<void>();

  // Input to control modal from parent
  open = input<boolean>(true);
  closed = output<void>();

  // Internal signal for modal state
  isOpen = signal(false);

  // Form state
  loginForm!: FormGroup;
  isSubmitting = signal(false);
  apiError = signal<string | null>(null);

  // Field-specific API errors (from backend validation)
  fieldErrors = signal<Record<string, string>>({});

  // Success popup state
  showConfirmation = signal(false);
  confirmTitle = signal('مرحبًا بعودتك!');
  confirmMessage = signal('تم تسجيل الدخول بنجاح. يمكنك الآن الاستفادة من جميع خدمات المركز.');
  confirmIcon = signal('pi pi-check-circle text-green-500 text-6xl');

  constructor() {
    this.initForm();

    // Sync input with internal signal and handle body scroll
    effect(() => {
      this.isOpen.set(this.open());

      // Lock/unlock body scroll
      if (isPlatformBrowser(this.platformId)) {
        if (this.open()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  private initForm(): void {
    this.loginForm = this.fb.group<Record<keyof LoginFormControls, unknown>>({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // Form control getters for template
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  /** Check if a control should show error */
  shouldShowError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    const hasFieldError = !!this.fieldErrors()[controlName];
    return !!(control && (control.invalid || hasFieldError) && (control.dirty || control.touched));
  }

  /** Get error message for a control */
  getErrorMessage(controlName: string): string {
    // Check for backend field errors first
    const fieldError = this.fieldErrors()[controlName];
    if (fieldError) return fieldError;

    const control = this.loginForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'هذا الحقل مطلوب';
    if (errors['email']) return 'البريد الإلكتروني غير صالح';
    if (errors['minlength']) {
      return `يجب ألا يقل عن ${errors['minlength'].requiredLength} أحرف`;
    }

    return 'قيمة غير صالحة';
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.isOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.closed.emit();
    if (this.router.url.startsWith('/auth')) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    // Mark all controls as touched to show errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.fieldErrors.set({});

    const payload = this.preparePayload();

    this.authService.login(payload).subscribe({
      next: (response) => {
        // Save token securely
        this.authService.setToken(response.data.token);
        this.authService.setUser(response.data.user);

        // Show success popup
        this.isSubmitting.set(false);
        this.close();
        this.showConfirmation.set(true);

        // Reset form and redirect after delay
        setTimeout(() => {
          this.loginForm.reset();
          this.showConfirmation.set(false);
          // Point 5: Redirect to home — this triggers App.ngOnInit &
          // HeroSection.ngOnInit which will check exam_enrollment_id
          // and restore the enrollment state from localStorage
          window.location.href = '/';
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.handleLoginError(error);
      },
    });
  }

  private preparePayload(): LoginPayload {
    const formValue = this.loginForm.value as LoginFormControls;

    return {
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
    };
  }

  private handleLoginError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.apiError.set('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      return;
    }

    // Handle 401 Unauthorized - wrong credentials
    if (error.status === 401) {
      this.apiError.set('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return;
    }

    // Handle 422 Validation errors from backend
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

    // Handle other error responses
    if (error.error?.message) {
      this.apiError.set(error.error.message);
      return;
    }

    // Generic error message
    this.apiError.set('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
  }

  /** Clear API errors when user starts typing */
  clearErrors(): void {
    if (this.apiError()) {
      this.apiError.set(null);
    }
    if (Object.keys(this.fieldErrors()).length > 0) {
      this.fieldErrors.set({});
    }
  }

  closeSignInAndOpenSignUp(): void {
    this.close();
    this.openSignUp.emit();
  }

  closeSignInAndOpenForgotPassword(): void {
    this.close();
    this.openForgotPassword.emit();
  }
}
