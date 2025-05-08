import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class CadastroPageComponent implements OnInit {
  cadastroForm: FormGroup;
  loading = false;
  errorMessage = '';
  submitted = false;
  showPassword = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    this.cadastroForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.cadastroForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    this.cadastroForm.markAllAsTouched(); 

    this.loading = true;
    const formData = this.cadastroForm.value;

    this.http.post<any>('http://localhost:8000/api/account/store', formData).subscribe({
        next: (response) => {
            this.loading = false;
            if (response.success) {
                this.successMessage = 'Cadastro realizado com sucesso!';
                this.cadastroForm.reset();
                this.submitted = false;
                this.cd.markForCheck(); 
            }
        },
      error: (error) => {
        this.loading = false;
        this.cd.markForCheck(); 
        if (error.status === 422) {
          this.handleServerErrors(error.error.errors);
        } else {
          this.errorMessage = 'Erro ao processar seu cadastro. Tente novamente.';
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private handleServerErrors(errors: any) {
    Object.keys(errors).forEach(key => {
      const control = this.cadastroForm.get(key);
      if (control) {
        control.setErrors({ serverError: errors[key][0] });
      }
    });
  }
}