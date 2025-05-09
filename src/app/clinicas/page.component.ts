import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ClinicService } from '../services/clinic.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-clinica-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    RouterModule
  ]
})
export class ClinicaPageComponent implements OnInit {
  clinics: any[] = [];
  isLoading: boolean = true;
  filteredClinics: any[] = [];
  filters: any = {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    regional: '',
    ativa: ''
  };

  currentPage = 1;
  itemsPerPage = 10;

  filterFields = [
    { key: 'razao_social', label: 'Razão Social', type: 'text', col: 3 },
    { key: 'nome_fantasia', label: 'Nome Fantasia', type: 'text', col: 3 },
    { key: 'cnpj', label: 'CNPJ', type: 'text', col: 2 },
    { key: 'regional', label: 'Regional', type: 'text', col: 2 },
    {
      key: 'ativa', label: 'Status', type: 'select', col: 2,
      options: [
        { value: 'true', text: 'Ativas' },
        { value: 'false', text: 'Inativas' }
      ]
    },
  ];

  constructor(
    private clinicService: ClinicService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClinics();
  }

  loadClinics() {
    this.clinicService.getAllClinics().subscribe({
      next: data => {
        this.clinics = data.clinicas ?? data;        
        this.applyFilters();
        this.isLoading = false; 
      },
      error: err => {
        console.error('Erro ao carregar clínicas', err);
        this.isLoading = false; 
      }
    });
  }


  applyFilters() {
    this.filteredClinics = this.clinics.filter(c => {
      return Object.keys(this.filters).every(key => {
        const f = this.filters[key];
        if (f === null || f === '') return true;
        if (key === 'ativa') {
          return c.ativa === (f === 'true');
        }
        return c[key]?.toString().toLowerCase().includes(f.toLowerCase());
      });
    });
    this.currentPage = 1;
  }

  resetFilters() {
    Object.keys(this.filters).forEach(k => this.filters[k] = '');
    this.applyFilters();
  }

  onEdit(clinic: any) {
    this.router.navigate(['/clinicas/editar', clinic.id]);
  }

  onDelete(clinic: any) {    
    if (!confirm(`Excluir clínica "${clinic.razao_social}"?`)) return;
    this.clinicService.deleteClinic(clinic.id).subscribe({
      next: () => this.loadClinics(),
      error: err => console.error('Erro ao excluir', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}