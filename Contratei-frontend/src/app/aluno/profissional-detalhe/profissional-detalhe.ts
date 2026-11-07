import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  ProfissionalDashboardService,
  PerfilProfissional,
  PerfilComplementarApi,
  ServicoProfissionalApi,
  DisponibilidadeApi
} from '../../services/profissional-dashboard.service';

interface ProfissionalDetalhe {
  id: number;
  nome: string;
  especialidade: string;
  localizacao: string;
  descricao: string;
  experiencia: string;
  experienciaAnos: number;
  materias: string[];
  valorHora: number;
}

@Component({
  selector: 'app-profissional-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profissional-detalhe.html',
  styleUrl: './profissional-detalhe.css'
})
export class ProfissionalDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardService = inject(ProfissionalDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  profissional: ProfissionalDetalhe | null = null;
  horariosDisponiveis: DisponibilidadeApi[] = [];

  servicos: ServicoProfissionalApi[] = [];

  profissionalId = 0;
  servicoId: number | null = null;

  carregando = true;
  erro = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.profissional = null;
        this.carregando = false;
        this.erro = 'O identificador do profissional é inválido.';
        this.cdr.detectChanges();
        return;
      }

      this.carregarProfissional(id);
    });
  }

  private carregarProfissional(providerId: number): void {
    this.carregando = true;
    this.erro = '';
    this.profissional = null;
    this.horariosDisponiveis = [];
    this.cdr.detectChanges();

    forkJoin({
      dados: this.dashboardService.getPerfil(providerId),
      perfil: this.dashboardService.getPerfilComplementar(providerId),
      servicos: this.dashboardService.getServicos(providerId),
      horarios: this.dashboardService.getDisponibilidade(providerId)
    }).subscribe({
      next: ({ dados, perfil, servicos, horarios }) => {
        const servicosAtivos = (servicos ?? [])
          .filter(servico => servico.active)
          .sort((a, b) => a.price - b.price);

        this.servicos = servicosAtivos;

        const horariosFuturos = (horarios ?? [])
          .filter(horario =>
            horario.status === 'available' &&
            new Date(horario.startsAt).getTime() > Date.now()
          )
          .sort((a, b) =>
            new Date(a.startsAt).getTime() -
            new Date(b.startsAt).getTime()
          );

        if (
          !dados.active ||
          servicosAtivos.length === 0 ||
          horariosFuturos.length === 0
        ) {
          this.erro =
            'Este profissional não está disponível para agendamento no momento.';
          this.carregando = false;
          this.cdr.detectChanges();
          return;
        }

        this.profissional = this.mapearProfissional(
          dados,
          perfil,
          servicosAtivos,
          providerId
        );

        this.horariosDisponiveis = horariosFuturos.slice(0, 3);
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Erro ao carregar detalhes do profissional:',
          error
        );

        this.erro =
          error.status === 404
            ? 'O perfil deste profissional não foi encontrado.'
            : 'Não foi possível carregar os dados do profissional. Tente novamente.';

        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapearProfissional(
    dados: PerfilProfissional,
    perfil: PerfilComplementarApi,
    servicos: ServicoProfissionalApi[],
    providerId: number
  ): ProfissionalDetalhe {
    return {
      id: providerId,
      nome: dados.displayName,
      especialidade: perfil.professionalAreaName,
      localizacao: `${perfil.city} - ${perfil.state}`,
      descricao: perfil.description,
      experienciaAnos: perfil.experienceYears,
      experiencia: perfil.experienceYears === 1
        ? '1 ano de experiência'
        : `${perfil.experienceYears} anos de experiência`,
      materias: perfil.topics ?? [],
      valorHora: servicos[0].price
    };
  }

  formatarHorario(data: string): string {
    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  tentarNovamente(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isInteger(id) && id > 0) {
      this.carregarProfissional(id);
    }
  }
}