import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import {
  ProfissionaisService,
  ProfissionalAluno
} from '../../services/profissionais.service';

@Component({
  selector: 'app-aluno-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aluno-buscar.html',
  styleUrl: './aluno-buscar.css'
})
export class AlunoBuscarComponent implements OnInit {
  private readonly profissionaisService = inject(ProfissionaisService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  termoBusca = '';
  especialidadeSelecionada = '';
  localizacaoSelecionada = '';
  precoMaximo = 200;
  ordenacao = 'relevancia';

  carregando = true;
  erro = '';

  readonly precoMinimo = 0;
  readonly precoLimite = 500;

  profissionais: ProfissionalAluno[] = [];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.termoBusca = params.get('q') ?? '';
      this.cdr.detectChanges();
    });

    this.carregarProfissionais();
  }

  carregarProfissionais(): void {
    this.carregando = true;
    this.erro = '';
    this.cdr.detectChanges();

    this.profissionaisService.obterProfissionais().subscribe({
      next: profissionais => {
        this.profissionais = profissionais ?? [];
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

  get especialidades(): string[] {
    return [
      ...new Set(
        this.profissionais
          .map(p => p.especialidade)
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  get localizacoes(): string[] {
    return [
      ...new Set(
        this.profissionais
          .map(p => p.localizacao)
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  get profissionaisFiltrados(): ProfissionalAluno[] {
    const termo = this.normalizar(this.termoBusca);

    let resultados = this.profissionais.filter(profissional => {
      const correspondeTexto =
        !termo ||
        this.normalizar(profissional.nome).includes(termo) ||
        this.normalizar(profissional.especialidade).includes(termo);

      const correspondeEspecialidade =
        !this.especialidadeSelecionada ||
        profissional.especialidade === this.especialidadeSelecionada;

      const correspondeLocalizacao =
        !this.localizacaoSelecionada ||
        profissional.localizacao === this.localizacaoSelecionada;

      const correspondePreco =
        profissional.valorHora !== null &&
        profissional.valorHora <= this.precoMaximo;

      return (
        correspondeTexto &&
        correspondeEspecialidade &&
        correspondeLocalizacao &&
        correspondePreco
      );
    });

    if (this.ordenacao === 'menor-preco') {
      resultados = [...resultados].sort(
        (a, b) => (a.valorHora ?? 0) - (b.valorHora ?? 0)
      );
    } else if (this.ordenacao === 'maior-preco') {
      resultados = [...resultados].sort(
        (a, b) => (b.valorHora ?? 0) - (a.valorHora ?? 0)
      );
    } else {
      resultados = [...resultados].sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      );
    }

    return resultados;
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.especialidadeSelecionada = '';
    this.localizacaoSelecionada = '';
    this.precoMaximo = this.precoLimite;
    this.ordenacao = 'relevancia';

    this.cdr.detectChanges();
  }

  private normalizar(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}