
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro-aluno.html',
  styleUrl: './cadastro-aluno.css'
})
export class CadastroAlunoComponent {
  private readonly authService = inject(AuthService);

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
      this.mensagemErro = 'As senhas informadas não são iguais.';
      return;
    }

    this.carregando = true;

    this.authService.register({
      name: this.nome.trim(),
      email: this.email.trim(),
      password: this.senha
    })
    .pipe(finalize(() => this.carregando = false))
    .subscribe({
      next: (response) => {
        this.mensagemSucesso =
          response.message || 'Cadastro realizado com sucesso!';

        this.nome = '';
        this.email = '';
        this.senha = '';
        this.confirmarSenha = '';
        form.resetForm();
      },
      error: (error) => {
        this.mensagemErro =
          error?.error?.message ??
          'Não foi possível realizar o cadastro. Tente novamente.';
      }
    });
  }
}
