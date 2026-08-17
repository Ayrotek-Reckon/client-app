import { Injectable, signal, computed } from '@angular/core';
import { DashboardService, DashboardData } from './dashboard.service';
import { interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private dashboardDataSignal = signal<DashboardData | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  dashboardData$ = this.dashboardDataSignal.asReadonly();
  isLoading$ = this.isLoadingSignal.asReadonly();
  error$ = this.errorSignal.asReadonly();

  stats = computed(() => this.dashboardDataSignal()?.stats || null);
  alerts = computed(() => this.dashboardDataSignal()?.alerts || []);

  constructor(private dashboardService: DashboardService) {
    this.initAutoRefresh();
  }

  loadDashboardData(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardDataSignal.set(data);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set('Failed to load dashboard data');
        this.isLoadingSignal.set(false);
        console.error('Dashboard load error:', err);
      }
    });
  }

  private initAutoRefresh(): void {
    // Auto-refresh every 30 seconds
    interval(30000).pipe(
      switchMap(() => this.dashboardService.getDashboardData()),
      catchError((err) => {
        console.error('Auto-refresh error:', err);
        return of(null);
      })
    ).subscribe((data) => {
      if (data) {
        this.dashboardDataSignal.set(data);
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
