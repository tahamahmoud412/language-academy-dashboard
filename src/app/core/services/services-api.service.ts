import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServicesApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}admin/services`;

  getServices(): Observable<ApiResponse<Service[]>> {
    return this.http.get<ApiResponse<Service[]>>(this.apiUrl);
  }

  createService(formData: FormData): Observable<ApiResponse<Service>> {
    return this.http.post<ApiResponse<Service>>(this.apiUrl, formData);
  }

  updateService(id: number, formData: FormData): Observable<ApiResponse<Service>> {
    formData.append('_method', 'PUT');
    return this.http.post<ApiResponse<Service>>(`${this.apiUrl}/${id}`, formData);
  }

  destroyService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
