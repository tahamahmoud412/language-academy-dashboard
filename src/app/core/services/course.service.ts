import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CoursesResponse } from '../models/courses.model';
import { CourseRequest } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}admin/courses`;

  getCourses(): Observable<CoursesResponse> {
    return this.http.get<CoursesResponse>(this.apiUrl);
  }

  createCourse(course: CourseRequest): Observable<any> {
    return this.http.post(this.apiUrl, course);
  }

  getCourseCategories(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}admin/course-categories`);
  }

  destroyCourse(id: number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCourseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateCourse(id: number, course: any): Observable<any> {
    // Handling updates via POST with _method=PUT to support Laravel's requirements, 
    // especially useful when dealing with FormData or restrictive server configs.
    if (course instanceof FormData) {
      course.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, course);
    }
    return this.http.put(`${this.apiUrl}/${id}`, course);
  }
}
