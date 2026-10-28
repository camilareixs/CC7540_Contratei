
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Perfil principal do profissional
export interface PerfilProfissional {
  id: number;
  userId: number;
  displayName: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

// Área profissional disponível para seleção
export interface AreaProfissionalApi {
  id: number;
  name: string;
}

// Perfil complementar retornado pelo backend
export interface PerfilComplementarApi {
  id: number;
  providerId: number;
  phone: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  professionalAreaId: number;
  professionalAreaName: string;
  description: string;
  experienceYears: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
}

// Dados enviados para criar ou atualizar o perfil complementar
export interface SalvarPerfilComplementarRequest {
  phone: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  professionalAreaId: number;
  description: string;
  experienceYears: number;
  topics: string[];
}

// Resposta do endpoint PUT
export interface SalvarPerfilComplementarResponse {
  message: string;
  profile: PerfilComplementarApi;
}

// Resposta ao adicionar um tópico
export interface TopicoPerfilApi {
  id: number;
  name: string;
}

// Serviços associados ao profissional
export interface ServicoProfissionalApi {
  id: number;
  providerId: number;
  serviceId: number;
  serviceName: string;
  serviceDescription: string | null;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export interface CriarServicoRequest {
  name: string;
  description: string;
}

export interface ServicoCatalogoApi {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}

export interface AssociarServicoRequest {
  serviceId: number;
  price: number;
  durationMinutes: number;
}

// Disponibilidade e agenda
export interface DisponibilidadeApi {
  id: number;
  providerId: number;
  startsAt: string;
  endsAt: string;
  status: string;
}

export interface CriarHorarioRequest {
  startsAt: string;
  endsAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionalDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Perfil principal do profissional
  getPerfil(providerId: number): Observable<PerfilProfissional> {
    return this.http.get<PerfilProfissional>(
      `${this.apiUrl}/api/providers/${providerId}`
    );
  }

  // Áreas profissionais disponíveis
  getAreasProfissionais(): Observable<AreaProfissionalApi[]> {
    return this.http.get<AreaProfissionalApi[]>(
      `${this.apiUrl}/api/professional-areas`
    );
  }

  // Consulta o perfil complementar
  getPerfilComplementar(
    providerId: number
  ): Observable<PerfilComplementarApi> {
    return this.http.get<PerfilComplementarApi>(
      `${this.apiUrl}/api/providers/${providerId}/profile`
    );
  }

  // Cria ou atualiza o perfil complementar
  salvarPerfilComplementar(
    providerId: number,
    request: SalvarPerfilComplementarRequest
  ): Observable<SalvarPerfilComplementarResponse> {
    return this.http.put<SalvarPerfilComplementarResponse>(
      `${this.apiUrl}/api/providers/${providerId}/profile`,
      request
    );
  }

  // Adiciona um tópico ao perfil
  adicionarTopico(
    providerId: number,
    name: string
  ): Observable<TopicoPerfilApi> {
    return this.http.post<TopicoPerfilApi>(
      `${this.apiUrl}/api/providers/${providerId}/profile/topics`,
      { name }
    );
  }

  // Remove um tópico do perfil
  removerTopico(
    providerId: number,
    topicId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/providers/${providerId}/profile/topics/${topicId}`
    );
  }

  // Serviços associados ao profissional
  getServicos(
    providerId: number
  ): Observable<ServicoProfissionalApi[]> {
    return this.http.get<ServicoProfissionalApi[]>(
      `${this.apiUrl}/api/providers/${providerId}/services`
    );
  }

  // Consulta horários futuros disponíveis
  getDisponibilidade(
    providerId: number
  ): Observable<DisponibilidadeApi[]> {
    return this.http.get<DisponibilidadeApi[]>(
      `${this.apiUrl}/api/providers/${providerId}/availability/available`
    );
  }

  // Consulta todos os horários
  getTodosHorarios(
    providerId: number
  ): Observable<DisponibilidadeApi[]> {
    return this.http.get<DisponibilidadeApi[]>(
      `${this.apiUrl}/api/providers/${providerId}/availability`
    );
  }

  // Cadastra um horário disponível
  criarHorario(
    providerId: number,
    request: CriarHorarioRequest
  ): Observable<DisponibilidadeApi> {
    return this.http.post<DisponibilidadeApi>(
      `${this.apiUrl}/api/providers/${providerId}/availability`,
      request
    );
  }

  // Bloqueia um horário
  bloquearHorario(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/api/availability/${id}/block`,
      {}
    );
  }

  // Cria um serviço no catálogo
  criarServico(
    request: CriarServicoRequest
  ): Observable<ServicoCatalogoApi> {
    return this.http.post<ServicoCatalogoApi>(
      `${this.apiUrl}/api/services`,
      request
    );
  }

  // Consulta o catálogo de serviços
  getCatalogoServicos(): Observable<ServicoCatalogoApi[]> {
    return this.http.get<ServicoCatalogoApi[]>(
      `${this.apiUrl}/api/services`
    );
  }

  // Associa um serviço ao profissional
  associarServico(
    providerId: number,
    request: AssociarServicoRequest
  ): Observable<ServicoProfissionalApi> {
    return this.http.post<ServicoProfissionalApi>(
      `${this.apiUrl}/api/providers/${providerId}/services`,
      request
    );
  }
}
