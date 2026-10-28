
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ProviderService } from '../../services/provider.service';

@Component({
  selector: 'app-cadastro-profissional',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro-profissional.html',
  styleUrl: './cadastro-profissional.css'
})
export class CadastroProfissionalComponent {
  private readonly providerService = inject(ProviderService);

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';

  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;

  onSubmit(form: NgForm): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensagemErro =
        'Preencha corretamente todos os campos obrigatórios.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.mensagemErro =
        'As senhas informadas não são iguais.';
      return;
    }

    this.carregando = true;

    this.providerService.register({
      name: this.nome.trim(),
      email: this.email.trim(),
      password: this.senha,
      displayName: this.nome.trim()
    })
    .pipe(finalize(() => this.carregando = false))
    .subscribe({
      next: (response) => {
        this.mensagemSucesso =
          `Conta profissional criada com sucesso! Bem-vindo(a), ${response.displayName}.`;

        form.resetForm();
      },
      error: (error) => {
        this.mensagemErro =
          error?.error?.message ??
          'Não foi possível criar sua conta profissional. Tente novamente.';
      }
    });
  }
}
