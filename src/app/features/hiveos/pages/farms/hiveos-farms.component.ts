import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HiveOSService } from '../../services/hiveos.service';
import { HiveOSFarm } from '../../models/hiveos.model';

@Component({
  selector: 'app-hiveos-farms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hiveos-farms.component.html',
  styleUrls: ['./hiveos-farms.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiveOSFarmsComponent implements OnInit {
  farms = signal<HiveOSFarm[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private hiveosService: HiveOSService) { }

  ngOnInit(): void {
    this.loadFarms();
  }

  loadFarms(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.hiveosService.getFarms().subscribe({
      next: (farms) => {
        this.farms.set(farms);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Failed to load HiveOS farms');
        console.error('Farms load error:', err);
      }
    });
  }
}
