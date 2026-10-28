
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AtendimentoProfissionalApi {
  appointmentId: number;
  customerId: number;
  customerName: string;
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
export class MeusAtendimentosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obterTodos(
    providerId: number
  ): Observable<AtendimentoProfissionalApi[]> {
    return this.http.get<AtendimentoProfissionalApi[]>(
      `${this.apiUrl}/api/providers/${providerId}/appointments`
    );
  }

  obterProximos(
    providerId: number
  ): Observable<AtendimentoProfissionalApi[]> {
    return this.http.get<AtendimentoProfissionalApi[]>(
      `${this.apiUrl}/api/providers/${providerId}/appointments/upcoming`
    );
  }

  obterHistorico(
    providerId: number
  ): Observable<AtendimentoProfissionalApi[]> {
    return this.http.get<AtendimentoProfissionalApi[]>(
      `${this.apiUrl}/api/providers/${providerId}/appointments/history`
    );
  }
}
