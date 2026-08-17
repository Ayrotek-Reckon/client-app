import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardHomeComponent],
  template: `<app-dashboard-home></app-dashboard-home>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent { }
