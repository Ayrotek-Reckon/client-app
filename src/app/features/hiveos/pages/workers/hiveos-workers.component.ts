import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HiveOSService } from '../../services/hiveos.service';
import { HiveOSWorker } from '../../models/hiveos.model';

@Component({
  selector: 'app-hiveos-workers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hiveos-workers.component.html',
  styleUrls: ['./hiveos-workers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiveOSWorkersComponent implements OnInit {
  workers = signal<HiveOSWorker[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  private farmId!: number;

  constructor(
    private hiveosService: HiveOSService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.farmId = Number(this.route.snapshot.paramMap.get('farmId'));
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.hiveosService.getWorkers(this.farmId).subscribe({
      next: (workers) => {
        this.workers.set(workers);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Failed to load workers');
        console.error('Workers load error:', err);
      }
    });
  }
}
