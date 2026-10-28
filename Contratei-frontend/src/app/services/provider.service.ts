
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateProviderRequest {
  name: string;
  email: string;
  password: string;
  displayName: string;
  description?: string | null;
}

export interface CreateProviderResponse {
  id: number;
  userId: number;
  displayName: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/providers`;

  register(
    request: CreateProviderRequest
  ): Observable<CreateProviderResponse> {
    return this.http.post<CreateProviderResponse>(
      this.apiUrl,
      request
    );
  }
}
