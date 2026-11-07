import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface ProfissionalDestaqueApi {
  id: number;
  displayName: string;
  professionalArea: string;
  city: string;
  state: string;
  description: string;
  minimumPrice: number;
}

export interface ProfissionalAluno {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  localizacao: string;
  valorHora: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionaisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obterProfissionais(): Observable<ProfissionalAluno[]> {
    return this.http
      .get<ProfissionalDestaqueApi[]>(
        `${this.apiUrl}/api/providers/featured`
      )
      .pipe(
        map(profissionais =>
          (profissionais ?? []).map(profissional => ({
            id: profissional.id,
            nome: profissional.displayName,
            especialidade: profissional.professionalArea,
            descricao: profissional.description,
            localizacao: [
              profissional.city,
              profissional.state
            ]
              .filter(valor => valor?.trim())
              .join(' - '),
            valorHora: profissional.minimumPrice
          }))
        )
      );
  }
}
