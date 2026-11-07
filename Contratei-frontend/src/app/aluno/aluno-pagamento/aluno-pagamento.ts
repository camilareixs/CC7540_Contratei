import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AgendamentoPagamentoService,
  AgendamentoPendente,
  FormaPagamento
} from '../services/agendamento-pagamento.service';

@Component({
  selector: 'app-aluno-pagamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aluno-pagamento.html',
  styleUrl: './aluno-pagamento.css'
})
export class AlunoPagamentoComponent {
  agendamento: AgendamentoPendente | null = null;

  formaPagamento: FormaPagamento = 'pix';

  nomeCartao = '';
  numeroCartao = '';
  validadeCartao = '';
  cvvCartao = '';
  parcelas = '1';

  processando = false;
  resultado: 'aprovado' | 'recusado' | null = null;
  mensagemErro = '';

  constructor(
    private pagamentoService: AgendamentoPagamentoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.agendamento = this.pagamentoService.obterAgendamento();

    if (!this.agendamento) {
      this.router.navigate(['/aluno/buscar']);
    }
  }

  get valorFormatado(): string {
    return (this.agendamento?.valor ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
  
  get dataFormatada(): string {
    const data = this.agendamento?.data;

    if (!data) {
      return '';
    }

    // Data no formato yyyy-MM-dd ou ISO com horário.
    const correspondencia = data.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (correspondencia) {
      const [, ano, mes, dia] = correspondencia;
      return `${dia}/${mes}/${ano}`;
    }

    // Se já estiver no formato brasileiro, não altera.
    const dataBrasileira = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (dataBrasileira) {
      return data;
    }

    return data;
  }

  selecionarForma(forma: FormaPagamento): void {
    if (this.processando || this.resultado === 'aprovado') {
      return;
    }

    this.formaPagamento = forma;
    this.mensagemErro = '';
    this.resultado = null;
  }

  pagar(): void {
    this.mensagemErro = '';

    if (!this.agendamento) {
      this.mensagemErro = 'Não encontramos os dados do agendamento.';
      this.cdr.detectChanges();
      return;
    }

    if (this.processando || this.resultado === 'aprovado') {
      return;
    }

    if (this.formaPagamento === 'cartao' && !this.cartaoValido()) {
      this.mensagemErro = 'Confira os dados do cartão antes de continuar.';
      this.cdr.detectChanges();
      return;
    }

    this.processando = true;
    this.resultado = null;
    this.cdr.detectChanges();

    // Simulação de resposta de uma futura API de pagamento.
    // Nenhuma cobrança real é realizada.
    window.setTimeout(() => {
      const aprovado = Math.random() < 0.8;

      if (aprovado) {
        this.resultado = 'aprovado';

        this.pagamentoService.atualizarAgendamento({
          status: 'Confirmado',
          formaPagamento: this.formaPagamento
        });
      } else {
        this.resultado = 'recusado';

        this.pagamentoService.atualizarAgendamento({
          status: 'Pagamento recusado',
          formaPagamento: this.formaPagamento
        });
      }

      this.processando = false;

      // Força a atualização visual após a resposta simulada.
      this.cdr.detectChanges();
    }, 1200);
  }

  tentarNovamente(): void {
    this.resultado = null;
    this.mensagemErro = '';
    this.processando = false;

    // A nova tentativa volta o estado para pendente de pagamento.
    this.pagamentoService.atualizarAgendamento({
      status: 'Pendente de pagamento'
    });
  }

  cartaoValido(): boolean {
    const numero = this.numeroCartao.replace(/\s/g, '');
    const validade = this.validadeCartao.trim();
    const cvv = this.cvvCartao.trim();

    return (
      this.nomeCartao.trim().length >= 3 &&
      /^\d{13,19}$/.test(numero) &&
      /^\d{2}\/\d{2}$/.test(validade) &&
      /^\d{3,4}$/.test(cvv)
    );
  }

  finalizar(): void {
    this.router.navigate(['/aluno']);
  }

  voltarParaAgendamento(): void {
    if (this.agendamento) {
      this.router.navigate([
        '/aluno/profissional',
        this.agendamento.profissionalId
      ]);
      return;
    }

    this.router.navigate(['/aluno/buscar']);
  }
}