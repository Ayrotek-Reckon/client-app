import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, map, catchError } from 'rxjs/operators';

// Email validator
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  };
}

// Password validator - requires at least 8 chars, 1 uppercase, 1 lowercase, 1 number
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const valid = minLength && hasUpperCase && hasLowerCase && hasNumber;

    if (!valid) {
      return {
        weakPassword: {
          minLength: !minLength,
          hasUpperCase: !hasUpperCase,
          hasLowerCase: !hasLowerCase,
          hasNumber: !hasNumber
        }
      };
    }

    return null;
  };
}

// Match validator - checks if two fields match (e.g., password and confirmPassword)
export function matchValidator(fieldName: string, matchingFieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const field = control.get(fieldName);
    const matchingField = control.get(matchingFieldName);

    if (!field || !matchingField) {
      return null;
    }

    return field.value === matchingField.value ? null : { mismatch: true };
  };
}

// URL validator
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  };
}

// Phone number validator
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(control.value.replace(/\s/g, '')) ? null : { invalidPhone: true };
  };
}

// Min value validator
export function minValueValidator(minValue: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value >= minValue) {
      return null;
    }
    return { minValue: { min: minValue, actual: control.value } };
  };
}

// Max value validator
export function maxValueValidator(maxValue: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value <= maxValue) {
      return null;
    }
    return { maxValue: { max: maxValue, actual: control.value } };
  };
}

// File size validator
export function fileSizeValidator(maxSizeInBytes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (!file) {
      return null;
    }

    if (file.size > maxSizeInBytes) {
      return { fileSize: { max: maxSizeInBytes, actual: file.size } };
    }

    return null;
  };
}

// File type validator
export function fileTypeValidator(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (!file) {
      return null;
    }

    if (!allowedTypes.includes(file.type)) {
      return { fileType: { allowed: allowedTypes, actual: file.type } };
    }

    return null;
  };
}

// No whitespace validator
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  };
}

// Custom async validator example (to be used with actual API service)
export function uniqueEmailValidator(emailService: any): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return emailService.checkEmailExists(control.value).pipe(
      debounceTime(300),
      map(exists => exists ? { emailTaken: true } : null),
      catchError(() => of(null))
    );
  };
}
