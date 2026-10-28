
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  MeusAtendimentosService,
  AtendimentoProfissionalApi
} from '../../services/meus-atendimentos.service';

type AbaAtendimento = 'proximos' | 'historico';

interface Atendimento {
  id: string;
  aluno: string;
  servico: string;
  data: Date | null;
  dataTexto: string;
  horario: string;
  status: string;
  statusClasse: string;
  preco: number;
}

@Component({
  selector: 'app-meus-atendimentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meus-atendimentos.html',
  styleUrl: './meus-atendimentos.css'
})
export class MeusAtendimentosComponent implements OnInit {
  private readonly pagamentoService =
    inject(MeusAtendimentosService);

  private readonly cdr = inject(ChangeDetectorRef);

  abaAtual: AbaAtendimento = 'proximos';

  atendimentos: Atendimento[] = [];

  carregando = false;
  erro = '';

  ngOnInit(): void {
    this.carregarAtendimentos();
  }

  carregarAtendimentos(): void {
    const providerId = Number(
      sessionStorage.getItem('providerId')
    );

    if (!Number.isInteger(providerId) || providerId <= 0) {
      this.atendimentos = [];
      this.erro =
        'Não foi possível identificar seu perfil profissional. Faça login novamente.';
      this.carregando = false;
      this.cdr.detectChanges();
      return;
    }

    this.carregando = true;
    this.erro = '';

    this.pagamentoService.obterTodos(providerId).subscribe({
      next: (registros: AtendimentoProfissionalApi[]) => {
        this.atendimentos = (registros ?? []).map(item =>
          this.mapearAtendimento(item)
        );

        this.ordenarAtendimentos();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Erro ao carregar atendimentos do profissional:',
          error
        );

        this.atendimentos = [];
        this.carregando = false;
        this.erro =
          'Não foi possível carregar seus atendimentos. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  atualizarLista(): void {
    this.carregarAtendimentos();
  }

  selecionarAba(aba: AbaAtendimento): void {
    this.abaAtual = aba;
    this.cdr.detectChanges();
  }

  private mapearAtendimento(
    item: AtendimentoProfissionalApi
  ): Atendimento {
    const data = this.converterData(item.startsAt);
    const fim = this.converterData(item.endsAt);
    const status = this.normalizarStatus(item.status);

    return {
      id: String(item.appointmentId),
      aluno: item.customerName?.trim() || 'Aluno não informado',
      servico: item.serviceName?.trim() || 'Serviço não informado',
      data,
      dataTexto: data
        ? data.toLocaleDateString('pt-BR')
        : 'Data não informada',
      horario: data && fim
        ? `${this.formatarHora(data)} – ${this.formatarHora(fim)}`
        : '--:--',
      status,
      statusClasse: this.classeStatus(status),
      preco: item.price ?? 0
    };
  }

  private converterData(valor: unknown): Date | null {
    if (!valor) {
      return null;
    }

    const data = valor instanceof Date
      ? valor
      : new Date(String(valor));

    return Number.isNaN(data.getTime()) ? null : data;
  }

  private formatarHora(data: Date): string {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private normalizarStatus(statusOriginal: string): string {
    const valor = (statusOriginal ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (
      valor.includes('conclu') ||
      valor.includes('completed') ||
      valor.includes('finished')
    ) {
      return 'Concluído';
    }

    if (
      valor.includes('cancel') ||
      valor.includes('recus') ||
      valor.includes('falhou') ||
      valor.includes('failed') ||
      valor.includes('rejected')
    ) {
      return valor.includes('recus') ||
        valor.includes('failed') ||
        valor.includes('rejected') ||
        valor.includes('falhou')
        ? 'Pagamento recusado'
        : 'Cancelado';
    }

    if (
      valor.includes('confirm') ||
      valor.includes('approved') ||
      valor.includes('aprov')
    ) {
      return 'Confirmado';
    }

    return 'Pendente de pagamento';
  }

  private classeStatus(status: string): string {
    switch (status) {
      case 'Confirmado':
        return 'confirmado';

      case 'Concluído':
        return 'concluido';

      case 'Cancelado':
      case 'Pagamento recusado':
        return 'cancelado';

      default:
        return 'pendente';
    }
  }

  private ordenarAtendimentos(): void {
    this.atendimentos.sort((a, b) => {
      if (!a.data && !b.data) {
        return 0;
      }

      if (!a.data) {
        return 1;
      }

      if (!b.data) {
        return -1;
      }

      return a.data.getTime() - b.data.getTime();
    });
  }

  
  get proximosAtendimentos(): Atendimento[] {
    const agora = Date.now();

    return this.atendimentos.filter(atendimento => {
      if (!atendimento.data || atendimento.data.getTime() < agora) {
        return false;
      }

      return (
        atendimento.status === 'Confirmado' ||
        atendimento.status === 'Pendente de pagamento'
      );
    });
  }

  get historicoAtendimentos(): Atendimento[] {
    const agora = Date.now();

    return this.atendimentos.filter(atendimento => {
      if (
        atendimento.status === 'Concluído' ||
        atendimento.status === 'Cancelado' ||
        atendimento.status === 'Pagamento recusado'
      ) {
        return true;
      }

      return (
        atendimento.status === 'Confirmado' &&
        atendimento.data !== null &&
        atendimento.data.getTime() < agora
      );
    });
  }

  get atendimentosExibidos(): Atendimento[] {
    return this.abaAtual === 'proximos'
      ? this.proximosAtendimentos
      : this.historicoAtendimentos;
  }

  get totalConfirmados(): number {
    return this.proximosAtendimentos.length;
  }
}
