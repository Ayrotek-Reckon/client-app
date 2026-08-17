import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-hiveos',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './hiveos.component.html',
  styleUrls: ['./hiveos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiveOSComponent { }
