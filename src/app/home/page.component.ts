import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true, 
  templateUrl: './page.component.html'
})
export class HomePageComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }
  
  ngOnInit() {
    this.authService.auth$.subscribe(state => {
    });
  
 
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
  
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    this.loading = true;
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }
  
  private handleError(error: any) {
    if (error.status === 401) {
      this.errorMessage = 'Credenciais inválidas';
    } else if (error.status === 422) {
      const serverErrors = error.error?.errors;
      if (serverErrors) {
        Object.keys(serverErrors).forEach(field => {
          const control = this.loginForm.get(field);
          if (control) {
            control.setErrors({ serverError: serverErrors[field][0] });
          }
        });
        this.errorMessage = 'Verifique os campos destacados';
      }
    } else {
      this.errorMessage = 'Erro ao realizar login. Tente novamente.';
    }
  }
}