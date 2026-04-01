import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AboutUs } from '../models/about-us.model';
import { ApiResponse } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class AboutUsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}admin/about-us`;

  getAboutUs(): Observable<ApiResponse<AboutUs>> {
    return this.http.get<ApiResponse<AboutUs>>(this.apiUrl);
  }

  saveAboutUs(data: any): Observable<ApiResponse<AboutUs>> {
    return this.http.post<ApiResponse<AboutUs>>(this.apiUrl, data);
  }
}
