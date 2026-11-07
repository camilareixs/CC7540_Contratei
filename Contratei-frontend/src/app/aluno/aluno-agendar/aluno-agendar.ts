import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppointmentsApiService } from '../../services/appointments-api.service';

import { AgendamentoPagamentoService } from '../services/agendamento-pagamento.service';
import {
  ProfissionalDashboardService,
  PerfilProfissional,
  PerfilComplementarApi,
  ServicoProfissionalApi,
  DisponibilidadeApi
} from '../../services/profissional-dashboard.service';

interface ProfissionalAgendamento {
  id: number;
  nome: string;
  especialidade: string;
  localizacao: string;
  valorHora: number;
  foto: string;
}

interface HorarioAgendamento {
  id: number;
  startsAt: string;
  endsAt: string;
  inicio: string;
}

@Component({
  selector: 'app-aluno-agendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aluno-agendar.html',
  styleUrl: './aluno-agendar.css'
})
export class AlunoAgendarComponent implements OnInit {
  profissional?: ProfissionalAgendamento;
  servicos: ServicoProfissionalApi[] = [];
  servicoSelecionado?: ServicoProfissionalApi;

  profissionalId = 0;
  servicoId: number | null = null;

  dataSelecionada = '';
  horarioSelecionado: HorarioAgendamento | null = null;
  observacoes = '';

  confirmado = false;
  carregando = true;
  carregandoHorarios = false;
  erro = '';
  salvandoAgendamento = false;

  hoje = this.obterDataLocal();
  todosHorarios: DisponibilidadeApi[] = [];
  horariosDisponiveis: HorarioAgendamento[] = [];
  datasDisponiveis: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agendamentoPagamento: AgendamentoPagamentoService,
    private dashboardService: ProfissionalDashboardService,
    private appointmentsApi: AppointmentsApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.erro = 'O identificador do profissional é inválido.';
        this.carregando = false;
        this.cdr.detectChanges();
        return;
      }

      this.profissionalId = id;

      this.route.queryParamMap.subscribe(queryParams => {
        const valorServico = queryParams.get('servicoId');
        const idServico = Number(valorServico);

        this.servicoId =
          valorServico !== null &&
          Number.isInteger(idServico) &&
          idServico > 0
            ? idServico
            : null;

        this.carregarDados();
      });
    });
  }

  private carregarDados(): void {
    this.carregando = true;
    this.erro = '';
    this.profissional = undefined;
    this.servicoSelecionado = undefined;
    this.servicos = [];
    this.todosHorarios = [];
    this.horariosDisponiveis = [];
    this.horarioSelecionado = null;
    this.cdr.detectChanges();

    forkJoin({
      dados: this.dashboardService.getPerfil(this.profissionalId),
      perfil: this.dashboardService.getPerfilComplementar(this.profissionalId),
      servicos: this.dashboardService.getServicos(this.profissionalId),
      horarios: this.dashboardService.getTodosHorarios(this.profissionalId)
    }).subscribe({
      next: ({ dados, perfil, servicos, horarios }) => {
        const servicosAtivos = (servicos ?? [])
          .filter(s => s.active && s.providerId === this.profissionalId);

        const servico = servicosAtivos.find(
          s => s.serviceId === this.servicoId
        );

        if (!dados.active) {
          this.erro = 'Este profissional não está disponível.';
          this.carregando = false;
          this.cdr.detectChanges();
          return;
        }

        if (!servico) {
          this.erro = this.servicoId
            ? 'O serviço selecionado não existe, não está ativo ou não pertence a este profissional. Volte ao perfil e escolha outro serviço.'
            : 'Nenhum serviço foi selecionado. Volte ao perfil do profissional e escolha um serviço.';
          this.carregando = false;
          this.cdr.detectChanges();
          return;
        }

        this.servicos = servicosAtivos;
        this.servicoSelecionado = servico;

        this.profissional = this.mapearProfissional(dados, perfil, servico);

        this.todosHorarios = (horarios ?? [])
          .filter(h => h.status === 'available')
          .filter(h => new Date(h.startsAt).getTime() > Date.now());

        this.datasDisponiveis = [
          ...new Set(
            this.todosHorarios.map(h => this.dataLocal(h.startsAt))
          )
        ].sort();

        this.carregando = false;
        this.atualizarHorariosDisponiveis();
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Erro ao carregar dados do agendamento:', error);

        this.erro = error.status === 404
          ? 'O profissional ou os dados do perfil não foram encontrados.'
          : 'Não foi possível carregar os dados do agendamento. Tente novamente.';

        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  dataDisponivel(data: string): boolean {
    return this.datasDisponiveis.includes(data);
  }

  private mapearProfissional(
    dados: PerfilProfissional,
    perfil: PerfilComplementarApi,
    servico: ServicoProfissionalApi
  ): ProfissionalAgendamento {
    return {
      id: this.profissionalId,
      nome: dados.displayName,
      especialidade: perfil.professionalAreaName,
      localizacao: `${perfil.city} - ${perfil.state}`,
      valorHora: servico.price,
      foto: ''
    };
  }

  aoAlterarData(data: string): void {
    this.dataSelecionada = data;
    this.horarioSelecionado = null;
    this.erro = '';
    this.atualizarHorariosDisponiveis();
  }

  private atualizarHorariosDisponiveis(): void {
    this.horarioSelecionado = null;

    if (!this.dataSelecionada) {
      this.horariosDisponiveis = [];
      return;
    }

    this.carregandoHorarios = true;

    this.horariosDisponiveis = this.todosHorarios
      .filter(h => this.dataLocal(h.startsAt) === this.dataSelecionada)
      .map(h => ({
        id: h.id,
        startsAt: h.startsAt,
        endsAt: h.endsAt,
        inicio: new Date(h.startsAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
      .sort((a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );

    this.carregandoHorarios = false;
    this.cdr.detectChanges();
  }

  selecionarHorario(horario: HorarioAgendamento): void {
    this.horarioSelecionado = horario;
    this.erro = '';
    this.cdr.detectChanges();
  }
  
  confirmarAgendamento(): void {
    this.erro = '';

    if (!this.profissional || !this.servicoSelecionado) {
      this.erro = 'Não foi possível carregar o profissional e o serviço.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.dataSelecionada || !this.horarioSelecionado) {
      this.erro = 'Selecione uma data e um horário disponível.';
      this.cdr.detectChanges();
      return;
    }

    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      this.erro = 'Sua sessão não foi encontrada. Entre novamente na sua conta.';
      this.cdr.detectChanges();
      return;
    }

    if (userRole !== 'student') {
      this.erro = 'Somente uma conta de aluno pode realizar agendamentos.';
      this.cdr.detectChanges();
      return;
    }

    this.salvandoAgendamento = true;
    this.cdr.detectChanges();

    this.appointmentsApi.criar({
      customerId: Number(userId),
      providerServiceId: this.servicoSelecionado.id,
      slotId: this.horarioSelecionado.id
    }).subscribe({
      next: (resposta) => {
        this.agendamentoPagamento.criarAgendamento({
          profissionalId: resposta.providerId,
          profissionalNome: resposta.providerName,
          especialidade: this.profissional!.especialidade,
          foto: '',
          servicoId: this.servicoSelecionado!.serviceId,
          servicoNome: resposta.serviceName,
          providerServiceId: resposta.providerServiceId,
          slotId: resposta.slotId,
          valor: resposta.price,
          data: this.dataLocal(resposta.startsAt),
          horario: new Date(resposta.startsAt).toLocaleTimeString(
            'pt-BR',
            { hour: '2-digit', minute: '2-digit' }
          ),
          duracaoMinutos: this.servicoSelecionado!.durationMinutes,
          endereco: this.profissional!.localizacao,
          observacoes: this.observacoes || '',
          status: 'Pendente de pagamento',
          criadoEm: resposta.createdAt
        });

        this.salvandoAgendamento = false;
        this.cdr.detectChanges();

        this.router.navigate(['/aluno/pagamento']);
      },
      error: (error) => {
        console.error('Erro ao criar agendamento:', error);

        this.salvandoAgendamento = false;

        if (error.status === 409) {
          this.erro =
            'Este horário acabou de ser reservado. Escolha outro horário disponível.';
        } else if (error.status === 400) {
          this.erro =
            error.error?.message ||
            'Não foi possível realizar o agendamento. Verifique os dados e tente novamente.';
        } else if (error.status === 401 || error.status === 403) {
          this.erro = 'Sua sessão expirou ou você não tem permissão. Entre novamente.';
        } else {
          this.erro =
            'Não foi possível concluir o agendamento. Tente novamente.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  agendarOutroHorario(): void {
    this.confirmado = false;
    this.dataSelecionada = '';
    this.horarioSelecionado = null;
    this.observacoes = '';
    this.erro = '';
    this.atualizarHorariosDisponiveis();
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private obterDataLocal(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  private dataLocal(valor: string): string {
    const data = new Date(valor);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}