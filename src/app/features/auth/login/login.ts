import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { handleApiError } from '@helpers/error.helper';
import { Auth } from '@services/auth';
import { ErrorMessages } from '@shared/components/error-messages/error-messages';
import { InlineSpinner } from '@shared/components/inline-spinner/inline-spinner';
import { timeout } from 'rxjs/internal/operators/timeout';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ErrorMessages, InlineSpinner],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  protected authService = inject(Auth);
  loading = signal(false);
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      userName: ['jperez', [Validators.required]],
      password: ['password123', [Validators.required]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      Object.values(this.loginForm.controls).forEach(control => {
        control.updateValueAndValidity({ onlySelf: true });
      });

      return;
    }

    const data = this.loginForm.value;

    this.loading.set(true);

    this.authService.login(data).pipe(timeout(10000)).subscribe({
      next: (response) => {
        if (!response.success) {
          this.loading.set(false);
          return;
        }

        this.authService.saveToken(response.data?.accessToken ?? '');

        this.authService.initializeApp().finally(() => {
          this.loading.set(false);
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        this.loading.set(false);
        handleApiError(error);
      }
    });
  }
}
