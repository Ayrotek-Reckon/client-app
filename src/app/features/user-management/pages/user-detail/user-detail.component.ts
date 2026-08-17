import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { UserManagementStateService } from '../../services/user-management-state.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  user = signal<User | null>(null);
  isLoading = this.userState.isLoading$;
  error = this.userState.error$;
  isEditing = signal(false);
  isSaving = signal(false);

  editForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    roles: ['', [Validators.required]],
    isActive: [true],
    emailVerified: [false]
  });

  constructor(
    private userState: UserManagementStateService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userState.loadUser(userId);
    }
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.isEditing.set(false);
    } else {
      this.isEditing.set(true);
      const userData = this.user();
      if (userData) {
        this.editForm.patchValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          roles: userData.roles[0],
          isActive: userData.isActive,
          emailVerified: userData.emailVerified
        });
      }
    }
  }

  onSaveChanges(): void {
    if (this.editForm.valid && this.user()) {
      this.isSaving.set(true);
      const userId = this.user()!.id;
      const formValue = this.editForm.value;

      const userData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        roles: [formValue.roles],
        isActive: formValue.isActive,
        emailVerified: formValue.emailVerified
      };

      this.userState.updateUser(userId, userData);
      setTimeout(() => {
        this.isSaving.set(false);
        this.isEditing.set(false);
      }, 1500);
    }
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const userId = this.user()!.id;
      this.userState.deleteUser(userId);
      setTimeout(() => {
        this.router.navigate(['/users']);
      }, 1000);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getInitials(): string {
    const userData = this.user();
    if (userData) {
      return (userData.firstName.charAt(0) + userData.lastName.charAt(0)).toUpperCase();
    }
    return '?';
  }
}
