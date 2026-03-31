import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for authentication forms
 */
export class AuthValidators {
  /**
   * Validates Egyptian phone number format
   * Accepts: 01XXXXXXXXX (11 digits starting with 01)
   * Prefixes: 010, 011, 012, 015
   */
  static egyptianPhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const phoneRegex = /^01[0125][0-9]{8}$/;
      const isValid = phoneRegex.test(control.value);

      return isValid ? null : { egyptianPhone: true };
    };
  }

  /**
   * Validates password strength
   * Must contain: uppercase, lowercase, and number
   */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value;
      const errors: ValidationErrors = {};

      if (!/[A-Z]/.test(value)) {
        errors['noUppercase'] = true;
      }
      if (!/[a-z]/.test(value)) {
        errors['noLowercase'] = true;
      }
      if (!/[0-9]/.test(value)) {
        errors['noNumber'] = true;
      }

      return Object.keys(errors).length ? { weakPassword: errors } : null;
    };
  }

  /**
   * Validates that password confirmation matches password
   * Must be used as a form group validator
   */
  static passwordMatch(
    passwordField: string = 'password',
    confirmField: string = 'password_confirmation'
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      // Clear the error if passwords match
      if (confirmPassword.errors?.['passwordMismatch']) {
        const { passwordMismatch, ...otherErrors } = confirmPassword.errors;
        confirmPassword.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }

      return null;
    };
  }

  /**
   * Validates that a field contains only numbers
   */
  static numbersOnly(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isValid = /^[0-9]+$/.test(control.value);
      return isValid ? null : { numbersOnly: true };
    };
  }
}
