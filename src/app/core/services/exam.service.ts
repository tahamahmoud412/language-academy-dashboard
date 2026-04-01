import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamsResponse, ExamTypeResponse } from '../models/exams.model';
import { ExamEnrollmentsResponse } from '../models/exam-enrollment.model';
import { ExamCreatePayload } from '../models/exam-create.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl + 'admin/exam';

  getExams(page: number = 1, perPage: number = 10): Observable<ExamsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString())
      .set('_', new Date().getTime().toString());
    return this.http.get<ExamsResponse>(this.apiUrl, { params });
  }

  getExamTypes(): Observable<ExamTypeResponse> {
    return this.http.get<ExamTypeResponse>(`${environment.baseUrl}admin/exam-types`);
  }

  createExam(payload: ExamCreatePayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  uploadAudio(examId: number, audio: File): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audio);
    return this.http.post<any>(`${this.apiUrl}/${examId}/upload-audio`, formData);
  }

  getExamById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateExam(id: number, payload: ExamCreatePayload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteExam(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getExamAudio(examId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${examId}/audio`);
  }

  deleteExamAudio(exam_id: number, audio_id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${exam_id}/audio/${audio_id}`);
  }

  getExamEnrollments(page: number = 1, perPage: number = 10): Observable<ExamEnrollmentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('perPage', perPage.toString())
      .set('_', new Date().getTime().toString());
    return this.http.get<ExamEnrollmentsResponse>(`${environment.baseUrl}admin/exam-enrollments`, { params });
  }

  updateExamEnrollmentStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${environment.baseUrl}admin/exam-enrollments/${id}/status`, { status });
  }

  deleteExamEnrollment(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.baseUrl}admin/course-enrollments/${id}`);
  }
}
