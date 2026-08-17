import { Injectable, signal, computed } from '@angular/core';
import { UserManagementService } from './user-management.service';
import { User, UsersListResponse } from '../models/user.model';

/**
 * NOTE: user-service has no controller/entity/repository implemented yet
 * (only a bootstrap Application class). Every call here will fail against
 * real infra with a 404/connection error until that service is built and
 * registered with APISIX — describeError() surfaces that clearly instead
 * of a generic "failed to load" message.
 */
@Injectable({
  providedIn: 'root'
})
export class UserManagementStateService {
  private usersSignal = signal<User[]>([]);
  private selectedUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private totalCountSignal = signal(0);
  private currentPageSignal = signal(1);
  private pageSizeSignal = signal(20);

  users$ = this.usersSignal.asReadonly();
  selectedUser$ = this.selectedUserSignal.asReadonly();
  isLoading$ = this.isLoadingSignal.asReadonly();
  error$ = this.errorSignal.asReadonly();
  totalCount$ = this.totalCountSignal.asReadonly();
  currentPage$ = this.currentPageSignal.asReadonly();
  pageSize$ = this.pageSizeSignal.asReadonly();

  totalPages = computed(() =>
    Math.ceil(this.totalCountSignal() / this.pageSizeSignal())
  );

  constructor(private userService: UserManagementService) { }

  loadUsers(page: number = 1, pageSize: number = 20, search?: string): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    this.currentPageSignal.set(page);
    this.pageSizeSignal.set(pageSize);

    this.userService.getUsers(page, pageSize, search).subscribe({
      next: (response: UsersListResponse) => {
        this.usersSignal.set(response.items);
        this.totalCountSignal.set(response.total);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.describeError(err, 'load users'));
        this.isLoadingSignal.set(false);
      }
    });
  }

  loadUser(id: string): void {
    this.isLoadingSignal.set(true);

    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.selectedUserSignal.set(user);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.describeError(err, 'load user'));
        this.isLoadingSignal.set(false);
      }
    });
  }

  createUser(data: any): void {
    this.isLoadingSignal.set(true);

    this.userService.createUser(data).subscribe({
      next: (user) => {
        const users = this.usersSignal();
        this.usersSignal.set([user, ...users]);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.describeError(err, 'create user'));
        this.isLoadingSignal.set(false);
      }
    });
  }

  updateUser(id: string, data: any): void {
    this.isLoadingSignal.set(true);

    this.userService.updateUser(id, data).subscribe({
      next: (updatedUser) => {
        const users = this.usersSignal();
        const index = users.findIndex(u => u.id === id);
        if (index > -1) {
          users[index] = updatedUser;
          this.usersSignal.set([...users]);
        }
        this.selectedUserSignal.set(updatedUser);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.describeError(err, 'update user'));
        this.isLoadingSignal.set(false);
      }
    });
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        const users = this.usersSignal().filter(u => u.id !== id);
        this.usersSignal.set(users);
      },
      error: (err) => {
        this.errorSignal.set(this.describeError(err, 'delete user'));
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private describeError(err: any, action: string): string {
    if (err?.status === 404 || err?.status === 0) {
      return `Unable to ${action}: the user-management backend is not implemented yet (no route registered for /api/v1/users).`;
    }
    return `Failed to ${action}`;
  }
}
