import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserManagementStateService } from '../../services/user-management-state.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  users = this.userState.users$;
  isLoading = this.userState.isLoading$;
  error = this.userState.error$;
  totalPages = this.userState.totalPages;
  currentPage = this.userState.currentPage$;

  constructor(private userState: UserManagementStateService) { }

  ngOnInit(): void {
    this.userState.loadUsers();
  }

  onSearch(event: any): void {
    const search = event.target.value;
    this.userState.loadUsers(1, 20, search);
  }

  onFilterChange(event: any): void {
    this.userState.loadUsers(1, 20);
  }

  onRetry(): void {
    this.userState.clearError();
    this.userState.loadUsers();
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userState.deleteUser(id);
    }
  }

  onNextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.userState.loadUsers(current + 1);
    }
  }

  onPreviousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.userState.loadUsers(current - 1);
    }
  }

  loadPage(page: number): void {
    this.userState.loadUsers(page);
  }

  getPaginationPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
