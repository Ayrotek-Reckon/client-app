import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EnergyCartService } from '../../../energy/services/energy-cart.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentSuccessComponent {
  order = this.cart.lastOrder;

  constructor(
    private cart: EnergyCartService,
    private router: Router
  ) { }

  goToDashboard(): void {
    this.cart.reset();
    this.router.navigate(['/dashboard']);
  }

  viewReceipt(): void {
    this.cart.reset();
    this.router.navigate(['/history']);
  }
}
