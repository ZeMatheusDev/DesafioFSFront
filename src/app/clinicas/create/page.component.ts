import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClinicService } from '../../services/clinic.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router'; 
import { Component, OnInit } from '@angular/core'; 

@Component({
  selector: 'app-clinica-create',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ClinicaCreateComponent {
  isEditMode = false;
  clinicId?: number;
  clinic: any = {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    regional: '',
    data_inauguracao: '',
    especialidades: '',
    ativo: '',
  };

  submitted = false;

  constructor(
    private clinicService: ClinicService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clinicId = +params['id'];
        this.loadClinicData(this.clinicId);
      }
    });
  }

  loadClinicData(id: number) {
    this.clinicService.getClinicById(id).subscribe({
      next: (data) => {
        this.clinic = {
          ...data.clinica,
          especialidades: data.clinica.especialidades.split(',').map((e: string) => parseInt(e.trim()))
        };
        this.clinic.cnpj = this.formatCnpjString(this.clinic.cnpj);
      },
      error: (err) => console.error('Erro ao carregar clínica', err)
    });
  }

  private formatCnpjString(cnpj: string): string {
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length !== 14) return cnpj;
    
    return nums.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  }

  onSubmit(form: NgForm) {
    const cnpjNumeros = this.clinic.cnpj.replace(/\D/g, '');

    this.clinic.cnpj = cnpjNumeros;
    this.submitted = true;
    
    if (form.invalid) return;

    const payload = {
        ...this.clinic,
        especialidades: this.clinic.especialidades 
    };

    this.clinic.cnpj = this.formatCnpjString(cnpjNumeros);

    if (this.isEditMode) {
        this.clinicService.updateClinic(this.clinicId!, payload).subscribe({
            next: () => this.router.navigate(['/clinicas']),
            error: err => console.error('Erro ao atualizar clínica', err)
        });
    } else {
        this.clinicService.createClinic(payload).subscribe({
            next: () => this.router.navigate(['/clinicas']),
            error: err => console.error('Erro ao criar clínica', err)
        });
    }
}

  regionais = [
    { value: 1, label: 'Alto tietê' },
    { value: 2, label: 'Interior' },
    { value: 3, label: 'ES' },
    { value: 4, label: 'SP Interior' },
    { value: 5, label: 'SP' },
    { value: 6, label: 'SP2' },
    { value: 7, label: 'MG' },
    { value: 8, label: 'Nacional' },
    { value: 9, label: 'SP CAV' },
    { value: 10, label: 'RJ' },
    { value: 11, label: 'SP2' },
    { value: 12, label: 'SP1' },
    { value: 13, label: 'NE1' },
    { value: 14, label: 'NE2' },
    { value: 15, label: 'SUL' },
    { value: 16, label: 'Norte' },
  ];
  
  especialidades = [
    { value: 1, label: 'Cardiologia' },
    { value: 2, label: 'Dermatologia' },
    { value: 3, label: 'Ortopedia' },
    { value: 4, label: 'Pediatria' },
    { value: 5, label: 'Ginecologia' },
    { value: 6, label: 'Neurologia' },
    { value: 7, label: 'Oftalmologia' },
    { value: 8, label: 'Psiquiatria' },
    { value: 9, label: 'Endocrinologia' },
    { value: 10, label: 'Gastroenterologia' }
  ];
  
  validateEspecialidades() {
    return this.clinic.especialidades && this.clinic.especialidades.length >= 5;
  }

  onCnpjInput(event: any) {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length > 14) v = v.slice(0, 14);
    event.target.value = v
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
    this.clinic.cnpj = event.target.value;
  }
  
  formatCnpj() {
    let v = this.clinic.cnpj.replace(/\D/g, '');
    if (v.length === 14) {
      this.clinic.cnpj = v
        .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
  }

  cancel() {
    this.router.navigate(['/clinicas']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}