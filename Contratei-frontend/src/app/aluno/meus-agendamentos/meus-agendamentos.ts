
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AgendamentoPendente } from '../services/agendamento-pagamento.service';
import {
  AgendamentoAlunoApi,
  MeusAgendamentosService
} from '../../services/meus-agendamentos.service';

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meus-agendamentos.html',
  styleUrl: './meus-agendamentos.css'
})
export class MeusAgendamentosComponent implements OnInit {
  private readonly api = inject(MeusAgendamentosService);
  private readonly cdr = inject(ChangeDetectorRef);

  agendamentos: AgendamentoPendente[] = [];
  filtro: 'todos' | 'proximos' | 'historico' = 'todos';

  carregando = false;
  erro = '';

  get totalConfirmados(): number {
    return this.agendamentos.filter(
      agendamento => agendamento.status === 'Confirmado'
    ).length;
  }

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  carregarAgendamentos(): void {
    const customerId = Number(sessionStorage.getItem('userId'));

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      this.erro = 'Não foi possível identificar o aluno. Entre novamente na sua conta.';
      this.cdr.detectChanges();
      return;
    }

    this.carregando = true;
    this.erro = '';

    this.api.obterTodos(customerId)
      .pipe(finalize(() => {
        this.carregando = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: resposta => {
          this.agendamentos = (resposta ?? [])
            .map(item => this.converterAgendamento(item))
            .sort((a, b) =>
              this.dataHora(b).localeCompare(this.dataHora(a))
            );

          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Erro ao carregar agendamentos:', error);
          this.erro = 'Não foi possível carregar seus agendamentos. Tente novamente.';
          this.cdr.detectChanges();
        }
      });
  }
  
  private converterAgendamento(
    item: AgendamentoAlunoApi
  ): AgendamentoPendente {
    const inicio = new Date(item.startsAt);
    const fim = new Date(item.endsAt);

    const duracaoMinutos = Math.round(
      (fim.getTime() - inicio.getTime()) / 60000
    );

    const data = [
      inicio.getFullYear(),
      String(inicio.getMonth() + 1).padStart(2, '0'),
      String(inicio.getDate()).padStart(2, '0')
    ].join('-');

    const horario = inicio.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return {
      profissionalId: item.providerId,
      profissionalNome: item.providerName || 'Profissional',
      especialidade: item.serviceName || 'Serviço',
      foto: '',
      servicoId: item.providerServiceId,
      servicoNome: '',
      providerServiceId: item.providerServiceId,
      slotId: item.slotId,
      valor: Number(item.price ?? 0),
      data,
      horario,
      duracaoMinutos: duracaoMinutos,
      endereco: item.providerAddress || 'Endereço não informado',
      observacoes: '',
      status: this.normalizarStatus(item.status),
      criadoEm: item.createdAt
    };
  }

  private normalizarStatus(status: string): AgendamentoPendente['status'] {
    const valor = (status ?? '').toLowerCase();

    if (valor === 'confirmed' || valor === 'confirmado') {
      return 'Confirmado';
    }

    if (
      valor === 'payment_rejected' ||
      valor === 'payment_failed' ||
      valor === 'pagamento recusado'
    ) {
      return 'Pagamento recusado';
    }

    return 'Pendente de pagamento';
  }

  get agendamentosFiltrados(): AgendamentoPendente[] {
    if (this.filtro === 'proximos') {
      return this.proximos;
    }

    if (this.filtro === 'historico') {
      return this.historico;
    }

    return this.agendamentos;
  }

  get proximos(): AgendamentoPendente[] {
    return this.agendamentos.filter(agendamento =>
      this.ehFuturo(agendamento) &&
      agendamento.status !== 'Pagamento recusado'
    ).sort((a, b) =>
      this.dataHora(a).localeCompare(this.dataHora(b))
    );
  }

  get historico(): AgendamentoPendente[] {
    return this.agendamentos.filter(agendamento =>
      !this.ehFuturo(agendamento) ||
      agendamento.status === 'Pagamento recusado'
    ).sort((a, b) =>
      this.dataHora(b).localeCompare(this.dataHora(a))
    );
  }

  selecionarFiltro(filtro: 'todos' | 'proximos' | 'historico'): void {
    this.filtro = filtro;
  }

  ehFuturo(agendamento: AgendamentoPendente): boolean {
    return this.dataHora(agendamento) >= this.dataHoraAtual();
  }

  private dataHora(agendamento: AgendamentoPendente): string {
    return `${agendamento.data}T${agendamento.horario || '00:00'}`;
  }

  private dataHoraAtual(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  }

  
  formatarData(data: string): string {
    if (!data) {
      return 'Data não informada';
    }

    const partes = data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  classeStatus(status: string): string {
    switch (status) {
      case 'Confirmado':
        return 'status-confirmado';
      case 'Pagamento recusado':
        return 'status-recusado';
      default:
        return 'status-pendente';
    }
  }

  get tituloVazio(): string {
    if (this.filtro === 'proximos') {
      return 'Nenhuma próxima aula';
    }

    if (this.filtro === 'historico') {
      return 'Seu histórico está vazio';
    }

    return 'Você ainda não tem agendamentos';
  }

  get descricaoVazia(): string {
    if (this.filtro === 'proximos') {
      return 'Quando você contratar uma aula, ela aparecerá aqui.';
    }

    if (this.filtro === 'historico') {
      return 'Suas aulas anteriores e os pagamentos recusados aparecerão aqui.';
    }

    return 'Encontre um profissional e agende sua primeira aula.';
  }
}
