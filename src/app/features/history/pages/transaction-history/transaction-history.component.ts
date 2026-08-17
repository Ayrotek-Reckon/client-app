import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionActivityService, ActivityEntry, ActivityType } from '../../services/session-activity.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent {
  Math = Math;
  searchTerm = signal('');
  typeFilter = signal<ActivityType | 'all'>('all');
  page = signal(1);

  allEntries = this.activityService.entries;

  filtered = computed<ActivityEntry[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.typeFilter();

    return this.allEntries().filter(entry => {
      const matchesType = type === 'all' || entry.type === type;
      const matchesSearch = !term ||
        entry.reference.toLowerCase().includes(term) ||
        entry.label.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  pagedEntries = computed<ActivityEntry[]>(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor(private activityService: SessionActivityService) { }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  onFilterChange(value: ActivityType | 'all'): void {
    this.typeFilter.set(value);
    this.page.set(1);
  }

  iconFor(type: ActivityType): string {
    if (type === 'mining_payout') return 'memory';
    if (type === 'energy_purchase') return 'bolt';
    return 'account_balance';
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update(p => p + 1);
  }

  prevPage(): void {
    if (this.page() > 1) this.page.update(p => p - 1);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
