
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface AgendamentoAlunoApi {
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
  providerAddress: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeusAgendamentosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obterTodos(customerId: number): Observable<AgendamentoAlunoApi[]> {
    return this.http.get<AgendamentoAlunoApi[]>(
      `${this.apiUrl}/api/appointments/customer/${customerId}`
    );
  }

  obterProximos(customerId: number): Observable<AgendamentoAlunoApi[]> {
    return this.http.get<AgendamentoAlunoApi[]>(
      `${this.apiUrl}/api/appointments/customer/${customerId}/upcoming`
    );
  }

  obterHistorico(customerId: number): Observable<AgendamentoAlunoApi[]> {
    return this.http.get<AgendamentoAlunoApi[]>(
      `${this.apiUrl}/api/appointments/customer/${customerId}/history`
    );
  }
}
