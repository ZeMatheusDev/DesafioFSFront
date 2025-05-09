import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  getAllClinics() {
    return this.http.get<{ clinicas: any[] }>(`http://localhost:8000/api/clinic/getAllClinics`);
  }
  deleteClinic(id: number) {
    return this.http.post(`http://localhost:8000/api/clinic/delete`, {'id': id});
  }
  updateClinic(id: number, data: any) {
    return this.http.post(`http://localhost:8000/api/clinic/update/${id}`, data);
  }
  createClinic(data: any) {
    return this.http.post(`http://localhost:8000/api/clinic/store`, data);
  }
  getClinicById(id: number): Observable<any> {
    return this.http.get(`http://localhost:8000/api/clinic/edit/${id}`);
  }
}
