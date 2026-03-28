import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimelineEvent } from '../models/event.model';
import { ApiResponse } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class EventApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/timeline-events`;

  getEvents(): Observable<ApiResponse<TimelineEvent[]>> {
    return this.http.get<ApiResponse<TimelineEvent[]>>(this.apiUrl);
  }

  createEvent(data: any): Observable<ApiResponse<TimelineEvent>> {
    return this.http.post<ApiResponse<TimelineEvent>>(this.apiUrl, data);
  }

  updateEvent(id: number, data: any): Observable<ApiResponse<TimelineEvent>> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return this.http.post<ApiResponse<TimelineEvent>>(`${this.apiUrl}/${id}`, data);
    }
    return this.http.put<ApiResponse<TimelineEvent>>(`${this.apiUrl}/${id}`, data);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
