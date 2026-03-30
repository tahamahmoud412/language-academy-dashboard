import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enrollment } from '../models/enrollment.model';
import { ApiResponse } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/course-enrollments`;

  getEnrollments(): Observable<ApiResponse<Enrollment[]>> {
    return this.http.get<ApiResponse<Enrollment[]>>(this.apiUrl);
  }

  updateEnrollment(id: number, data: any): Observable<ApiResponse<Enrollment>> {
    // If it's FormData, use the _method=PUT workaround
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return this.http.post<ApiResponse<Enrollment>>(`${this.apiUrl}/${id}`, data);
    }
    // Otherwise, a standard PUT request
    return this.http.put<ApiResponse<Enrollment>>(`${this.apiUrl}/${id}`, data);
  }

  deleteEnrollment(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
