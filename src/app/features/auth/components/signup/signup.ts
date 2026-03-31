import {
  Component,
  signal,
  input,
  effect,
  inject,
  PLATFORM_ID,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Confirmation } from '../../../../shared/components/confirmation/confirmation';
import { AuthValidators } from '../../../../shared/validators/auth.validators';
import { AuthService } from '../../../../core/services/auth.service';
/** API payload interface for registration */
export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

/** Form controls interface for type safety */
interface RegisterFormControls {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, Confirmation],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Input to control modal from parent
  open = input<boolean>(false);
  closed = output<void>();
  openSignIn = output<void>();

  // Internal signal for modal state
  isOpen = signal(false);

  // Form state
  registerForm!: FormGroup;
  isSubmitting = signal(false);
  apiError = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  // Confirmation state
  showConfirmation = signal(false);
  confirmTitle = signal('تأكيد إنشاء الحساب');
  confirmMessage = signal('هل أنت متأكد من إنشاء الحساب؟');
  confirmIcon = signal('pi pi-exclamation-triangle text-yellow-500');
  confirmType = signal<'success' | 'danger' | 'warning' | 'info'>('warning');
  confirmShowButtons = signal(true);

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
    this.registerForm = this.fb.group<Record<keyof RegisterFormControls, unknown>>(
      {
        full_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [
          '',
          [Validators.required, AuthValidators.numbersOnly(), AuthValidators.egyptianPhone()],
        ],
        password: [
          '',
          [Validators.required, Validators.minLength(8), AuthValidators.strongPassword()],
        ],
        password_confirmation: ['', [Validators.required]],
      },
      {
        validators: [AuthValidators.passwordMatch('password', 'password_confirmation')],
      },
    );
  }

  // Form control getters for template
  get fullNameControl() {
    return this.registerForm.get('full_name');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get phoneControl() {
    return this.registerForm.get('phone');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get passwordConfirmationControl() {
    return this.registerForm.get('password_confirmation');
  }

  /** Check if a control should show error */
  shouldShowError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    const hasFieldError = !!this.fieldErrors()[controlName];
    return !!(control && (control.invalid || hasFieldError) && (control.dirty || control.touched));
  }

  /** Get first error message for a control */
  getErrorMessage(controlName: string): string {
    const fieldError = this.fieldErrors()[controlName];
    if (fieldError) return fieldError;

    const control = this.registerForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    // Common error messages
    if (errors['required']) return 'هذا الحقل مطلوب';
    if (errors['minlength']) {
      return `يجب ألا يقل عن ${errors['minlength'].requiredLength} أحرف`;
    }
    if (errors['maxlength']) {
      return `يجب ألا يزيد عن ${errors['maxlength'].requiredLength} حرف`;
    }
    if (errors['email']) return 'البريد الإلكتروني غير صالح';

    // Custom error messages
    if (errors['egyptianPhone']) return 'رقم الهاتف غير صالح (01XXXXXXXXX)';
    if (errors['numbersOnly']) return 'يجب إدخال أرقام فقط';
    if (errors['passwordMismatch']) return 'كلمة المرور غير متطابقة';

    // Password strength errors
    if (errors['weakPassword']) {
      const weakErrors = errors['weakPassword'];
      if (weakErrors['noUppercase']) return 'يجب أن تحتوي على حرف كبير';
      if (weakErrors['noLowercase']) return 'يجب أن تحتوي على حرف صغير';
      if (weakErrors['noNumber']) return 'يجب أن تحتوي على رقم';
    }

    return 'قيمة غير صالحة';
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.isOpen.set(false);
    // Restore body scroll
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
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || this.isSubmitting()) {
      return;
    }

    // Reset confirmation state
    this.confirmTitle.set('تأكيد إنشاء الحساب');
    this.confirmMessage.set('هل أنت متأكد من إنشاء الحساب؟');
    this.confirmIcon.set('pi pi-exclamation-triangle text-yellow-500');
    this.confirmType.set('warning');
    this.confirmShowButtons.set(true);

    this.showConfirmation.set(true);
  }

  onConfirmSignup(): void {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.fieldErrors.set({});

    const payload = this.preparePayload();

    this.authService.register(payload).subscribe({
      next: () => {
        // Transition to success state
        this.confirmTitle.set('تم التسجيل بنجاح!');
        this.confirmMessage.set('مرحباً بك في منصة مركز اللغات والترجمة\nجاري التحضير...');
        this.confirmIcon.set('pi pi-check-circle text-green-500 text-6xl');
        this.confirmType.set('success');
        this.confirmShowButtons.set(false);

        // Reset form and close modal, then open sign in
        setTimeout(() => {
          this.registerForm.reset();
          this.close();
          this.showConfirmation.set(false);
          this.isSubmitting.set(false);
          this.openSignIn.emit();
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.showConfirmation.set(false);
        this.handleRegisterError(error);
      },
    });
  }

  private preparePayload(): RegisterPayload {
    const formValue = this.registerForm.value as RegisterFormControls;

    return {
      full_name: formValue.full_name.trim(),
      email: formValue.email.trim().toLowerCase(),
      phone: formValue.phone.trim(),
      password: formValue.password,
      password_confirmation: formValue.password_confirmation,
    };
  }

  onCancelSignup(): void {
    this.showConfirmation.set(false);
  }

  /** Clear API error when user starts typing */
  clearApiError(): void {
    if (this.apiError()) {
      this.apiError.set(null);
    }
    if (Object.keys(this.fieldErrors()).length > 0) {
      this.fieldErrors.set({});
    }
  }

  closeSignUpAndOpenSignIn(event: Event): void {
    event.preventDefault();
    if (this.isSubmitting()) return;
    this.close();
    this.openSignIn.emit();
  }

  private handleRegisterError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.apiError.set('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
      return;
    }

    if (error.status === 422 && error.error?.errors) {
      const backendErrors: Record<string, string> = {};
      const errorObj = error.error.errors as Record<string, unknown>;

      for (const field in errorObj) {
        if (Object.prototype.hasOwnProperty.call(errorObj, field)) {
          const value = errorObj[field];
          backendErrors[field] = Array.isArray(value) ? String(value[0]) : String(value);
        }
      }

      this.fieldErrors.set(backendErrors);
      return;
    }

    if (error.status === 409) {
      this.apiError.set('هذا البريد الإلكتروني مستخدم بالفعل.');
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

    this.apiError.set('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
  }
}
