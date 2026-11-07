
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CriarAgendamentoRequest {
  customerId: number;
  providerServiceId: number;
  slotId: number;
}

export interface AgendamentoCriadoApi {
  id: number;
  customerId: number;
  customerName: string;
  providerId: number;
  providerName: string;
  providerServiceId: number;
  serviceName: string;
  slotId: number;
  startsAt: string;
  endsAt: string;
  status: string;
  price: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/appointments`;

  criar(
    request: CriarAgendamentoRequest
  ): Observable<AgendamentoCriadoApi> {
    return this.http.post<AgendamentoCriadoApi>(
      this.apiUrl,
      request
    );
  }
}
