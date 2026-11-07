
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  ProfissionaisService,
  ProfissionalAluno
} from '../../services/profissionais.service';

@Component({
  selector: 'app-aluno-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './aluno-home.html',
  styleUrl: './aluno-home.css'
})
export class AlunoHomeComponent implements OnInit {
  private readonly profissionaisService = inject(ProfissionaisService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  termoBusca = '';
  profissionais: ProfissionalAluno[] = [];

  carregando = true;
  erro = '';

  ngOnInit(): void {
    this.carregarProfissionais();
  }

  carregarProfissionais(): void {
    this.carregando = true;
    this.erro = '';

    this.profissionaisService.obterProfissionais().subscribe({
      next: profissionais => {
        this.profissionais = profissionais;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Erro ao carregar profissionais:', error);

        this.profissionais = [];
        this.carregando = false;
        this.erro =
          'Não foi possível carregar os profissionais. Tente novamente.';

        this.cdr.detectChanges();
      }
    });
  }

  buscarProfissionais(): void {
    const termo = this.termoBusca.trim();

    this.router.navigate(['/aluno/buscar'], {
      queryParams: termo ? { q: termo } : {}
    });
  }

  formatarPreco(preco: number | null): string {
    if (preco === null || preco === undefined) {
      return 'Consulte os serviços';
    }

    if (preco === 0) {
      return 'Gratuito';
    }

    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
