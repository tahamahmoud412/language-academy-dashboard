import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FAQ } from '../models/faq.model';
import { ApiResponse } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class FaqApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/faqs`;

  getFaqs(): Observable<ApiResponse<FAQ[]>> {
    return this.http.get<ApiResponse<FAQ[]>>(this.apiUrl);
  }


  createFaq(data: any): Observable<ApiResponse<FAQ>> {
    return this.http.post<ApiResponse<FAQ>>(this.apiUrl, data);
  }

  updateFaq(id: number, data: any): Observable<ApiResponse<FAQ>> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return this.http.post<ApiResponse<FAQ>>(`${this.apiUrl}/${id}`, data);
    }
    return this.http.put<ApiResponse<FAQ>>(`${this.apiUrl}/${id}`, data);
  }


  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
