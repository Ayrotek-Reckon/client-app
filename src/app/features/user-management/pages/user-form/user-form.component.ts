import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { UserManagementStateService } from '../../services/user-management-state.service';
import { passwordValidator } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit {
  isEditMode = false;
  isLoading = this.userState.isLoading$;
  error = this.userState.error$;
  isSaving = signal(false);

  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', []],
    roles: ['', [Validators.required]],
    isActive: [true],
    emailVerified: [false]
  });

  constructor(
    private userState: UserManagementStateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.isEditMode = true;
      this.userState.loadUser(userId);
      this.userForm.get('password')?.clearAsyncValidators();
    } else {
      this.userForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(8),
        passwordValidator()
      ]);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSaving.set(true);
      const formValue = this.userForm.value;

      const userData: any = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        roles: [formValue.roles],
        isActive: formValue.isActive,
        emailVerified: formValue.emailVerified
      };

      if (formValue.password) {
        userData.password = formValue.password;
      }

      if (this.isEditMode) {
        const userId = this.route.snapshot.paramMap.get('id');
        this.userState.updateUser(userId || '', userData);
      } else {
        this.userState.createUser(userData);
      }

      setTimeout(() => {
        this.isSaving.set(false);
        this.router.navigate(['/users']);
      }, 1500);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
