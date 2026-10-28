import { Injectable } from '@angular/core';

export type StatusAgendamento =
  | 'Pendente de pagamento'
  | 'Confirmado'
  | 'Pagamento recusado';

export type FormaPagamento = 'pix' | 'cartao';

export interface AgendamentoPendente {
  profissionalId: number;
  profissionalNome: string;
  especialidade: string;
  foto: string;

  servicoId: number;
  servicoNome: string;
  providerServiceId: number;
  slotId: number;

  valor: number;
  data: string;
  horario: string;
  duracaoMinutos?: number;
  endereco: string;
  observacoes: string;
  status: StatusAgendamento;
  formaPagamento?: FormaPagamento;
  criadoEm: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoPagamentoService {
  private readonly chaveAtual = 'contratei_agendamento_atual';
  private readonly chaveLista = 'contratei_agendamentos';

  criarAgendamento(agendamento: AgendamentoPendente): void {
    const lista = this.obterAgendamentos();

    lista.unshift(agendamento);

    sessionStorage.setItem(this.chaveLista, JSON.stringify(lista));
    sessionStorage.setItem(this.chaveAtual, JSON.stringify(agendamento));
  }

  obterAgendamento(): AgendamentoPendente | null {
    const dados = sessionStorage.getItem(this.chaveAtual);

    if (!dados) {
      return null;
    }

    try {
      return JSON.parse(dados) as AgendamentoPendente;
    } catch {
      return null;
    }
  }

  obterAgendamentos(): AgendamentoPendente[] {
    const dados = sessionStorage.getItem(this.chaveLista);

    if (!dados) {
      // Compatibilidade com dados criados antes da lista existir.
      const atual = this.obterAgendamento();
      return atual ? [atual] : [];
    }

    try {
      const lista = JSON.parse(dados);

      return Array.isArray(lista)
        ? lista as AgendamentoPendente[]
        : [];
    } catch {
      return [];
    }
  }

  atualizarAgendamento(
    atualizacao: Partial<AgendamentoPendente>
  ): AgendamentoPendente | null {
    const atual = this.obterAgendamento();

    if (!atual) {
      return null;
    }

    const atualizado = { ...atual, ...atualizacao };

    sessionStorage.setItem(
      this.chaveAtual,
      JSON.stringify(atualizado)
    );

    const lista = this.obterAgendamentos();
    const indice = lista.findIndex(
      item => item.criadoEm === atual.criadoEm
    );

    if (indice >= 0) {
      lista[indice] = atualizado;
    } else {
      lista.unshift(atualizado);
    }

    sessionStorage.setItem(this.chaveLista, JSON.stringify(lista));

    return atualizado;
  }

  limparAgendamento(): void {
    sessionStorage.removeItem(this.chaveAtual);
  }

  limparTodosAgendamentos(): void {
    sessionStorage.removeItem(this.chaveAtual);
    sessionStorage.removeItem(this.chaveLista);
  }
}