import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { AlertsComponent } from '../../components/alerts/alerts.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AlertsComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomeComponent implements OnInit {
  isLoading = this.dashboardState.isLoading$;
  error = this.dashboardState.error$;
  stats = this.dashboardState.stats;
  alerts = this.dashboardState.alerts;
  Math = Math;

  constructor(private dashboardState: DashboardStateService) { }

  ngOnInit(): void {
    this.dashboardState.loadDashboardData();
  }

  onRefresh(): void {
    this.dashboardState.clearError();
    this.dashboardState.loadDashboardData();
  }
}
