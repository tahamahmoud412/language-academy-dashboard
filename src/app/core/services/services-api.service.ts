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
  private apiUrl = `${environment.baseUrl}/services`;

  getServices(): Observable<ApiResponse<Service[]>> {
    return this.http.get<ApiResponse<Service[]>>(this.apiUrl);
  }

  createService(formData: FormData): Observable<ApiResponse<Service>> {
    return this.http.post<ApiResponse<Service>>(this.apiUrl, formData);
  }

  updateService(id: number, formData: FormData): Observable<ApiResponse<Service>> {
    // If our backend is Laravel/PHP, it might not handle FormData on pure PUT/PATCH.
    // Adding _method field and using POST is the standard workaround.
    formData.append('_method', 'PUT');
    return this.http.post<ApiResponse<Service>>(`${this.apiUrl}/${id}`, formData);
  }

  destroyService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
