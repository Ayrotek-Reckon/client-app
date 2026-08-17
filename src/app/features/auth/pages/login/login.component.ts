import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', Validators.required]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  get identifierError(): string {
    const control = this.loginForm.get('identifier');
    if (control?.hasError('required')) return 'Email or username is required';
    return '';
  }

  get passwordError(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    return '';
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password } = this.loginForm.value;

    this.authService.login({ identifier: identifier!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set('Invalid email/username or password');
        } else if (error.status === 0) {
          this.errorMessage.set('Cannot reach the server. Please try again later');
        } else {
          this.errorMessage.set('Login failed. Please try again');
        }
      }
    });
  }
}
