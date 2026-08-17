import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EnergyCartService, ENERGY_TIERS, EnergyTier } from '../../services/energy-cart.service';

@Component({
  selector: 'app-energy-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './energy-marketplace.component.html',
  styleUrls: ['./energy-marketplace.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnergyMarketplaceComponent {
  tiers = ENERGY_TIERS;

  constructor(
    private cart: EnergyCartService,
    private router: Router
  ) { }

  purchase(tier: EnergyTier): void {
    this.cart.selectTier(tier);
    this.router.navigate(['/payments/select']);
  }
}
