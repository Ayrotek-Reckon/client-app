import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HelpCategory {
  icon: string;
  title: string;
  description: string;
}

interface Article {
  title: string;
  category: string;
}

const CATEGORIES: HelpCategory[] = [
  { icon: 'rocket_launch', title: 'Getting Started', description: 'Account setup, onboarding and your first node registration.' },
  { icon: 'bolt', title: 'Energy & Mining', description: 'Buying energy packages and configuring mining strategies.' },
  { icon: 'account_balance_wallet', title: 'Wallets & Withdrawals', description: 'Adding payout wallets and withdrawing funds.' },
  { icon: 'shield', title: 'Security & Access', description: 'Two-factor authentication, sessions and account access.' },
  { icon: 'payments', title: 'Billing & Payments', description: 'Payment methods, invoices and transaction history.' },
  { icon: 'dns', title: 'Nodes & Rigs', description: 'Registering, approving and monitoring your rig fleet.' }
];

const ARTICLES: Article[] = [
  { title: 'How to purchase energy?', category: 'Energy & Mining' },
  { title: 'Setting up 2FA via Authenticator App', category: 'Security & Access' },
  { title: 'Understanding mining strategies', category: 'Energy & Mining' },
  { title: 'Troubleshooting connection errors', category: 'Getting Started' },
  { title: 'Withdrawal limits and holds', category: 'Wallets & Withdrawals' }
];

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpSupportComponent {
  categories = CATEGORIES;
  searchTerm = signal('');

  filteredArticles = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return ARTICLES;
    return ARTICLES.filter(a =>
      a.title.toLowerCase().includes(term) || a.category.toLowerCase().includes(term)
    );
  });
}
