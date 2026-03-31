import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamsResponse } from '../models/exams.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private http = inject(HttpClient);
  // Using the absolute URL provided by the user.
  // Should ideally be configurable via environment
  private apiUrl = environment.baseUrl;

  getExams(page: number = 1): Observable<ExamsResponse> {
    let params = new HttpParams().set('page', page.toString());
    return this.http.get<ExamsResponse>(`${this.apiUrl}/exam`, { params });
  }
}
