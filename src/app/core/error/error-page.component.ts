import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-container">
      <div class="error-content">
        <h1 class="error-code">{{ errorCode }}</h1>
        <h2 class="error-title">{{ errorTitle }}</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <a routerLink="/dashboard" class="error-link">Go to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .error-content {
      text-align: center;
      color: white;
    }

    .error-code {
      font-size: 120px;
      margin: 0;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .error-title {
      font-size: 32px;
      margin: 1rem 0 0.5rem 0;
    }

    .error-message {
      font-size: 18px;
      margin: 1rem 0 2rem 0;
      opacity: 0.9;
    }

    .error-link {
      display: inline-block;
      padding: 0.75rem 2rem;
      background-color: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: transform 0.2s;
    }

    .error-link:hover {
      transform: translateY(-2px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPageComponent implements OnInit {
  errorCode: number = 404;
  errorTitle: string = 'Not Found';
  errorMessage: string = 'The page you are looking for does not exist.';

  private errorDetails: Record<number, { title: string; message: string }> = {
    403: {
      title: 'Forbidden',
      message: 'You do not have permission to access this resource.'
    },
    404: {
      title: 'Not Found',
      message: 'The page you are looking for does not exist.'
    },
    500: {
      title: 'Server Error',
      message: 'An internal server error occurred. Please try again later.'
    }
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const code = this.route.snapshot.data['errorCode'] || 404;
    this.errorCode = code;
    const details = this.errorDetails[code];
    if (details) {
      this.errorTitle = details.title;
      this.errorMessage = details.message;
    }
  }
}
