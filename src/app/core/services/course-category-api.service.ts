import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseCategory } from '../models/category.model';
import { ApiResponse } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class CourseCategoryApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/course-categories`;

  getCategories(): Observable<ApiResponse<CourseCategory[]>> {
    return this.http.get<ApiResponse<CourseCategory[]>>(this.apiUrl);
  }

  createCategory(data: any): Observable<ApiResponse<CourseCategory>> {
    return this.http.post<ApiResponse<CourseCategory>>(this.apiUrl, data);
  }

  updateCategory(id: number, data: any): Observable<ApiResponse<CourseCategory>> {
    // Handling FormData on PUT/PATCH requires _method field and POST request for Laravel
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return this.http.post<ApiResponse<CourseCategory>>(`${this.apiUrl}/${id}`, data);
    }
    return this.http.put<ApiResponse<CourseCategory>>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
