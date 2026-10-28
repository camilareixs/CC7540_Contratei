
import {
  Component,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type TipoConta = 'aluno' | 'profissional';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  tipoConta: TipoConta = 'aluno';
  email = '';
  senha = '';

  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;

  selecionarTipo(tipo: TipoConta): void {
    this.tipoConta = tipo;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  onSubmit(form: NgForm): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.mensagemErro = 'Informe seu e-mail e sua senha.';
      this.cdr.detectChanges();
      return;
    }

    this.carregando = true;
    this.cdr.detectChanges();

    this.authService.login({
      email: this.email.trim(),
      password: this.senha
    }).subscribe({
      next: (response) => {
        this.carregando = false;

        if (!response.user) {
          this.mensagemErro =
            response.message || 'Não foi possível entrar na sua conta.';
          this.cdr.detectChanges();
          return;
        }

        const tipoRecebido: TipoConta =
          response.user.role === 'student' ? 'aluno' : 'profissional';

        if (tipoRecebido !== this.tipoConta) {
          this.mensagemErro =
            `Esta conta é de ${tipoRecebido}. Selecione o tipo correto para entrar.`;
          this.cdr.detectChanges();
          return;
        }

        this.mensagemSucesso =
          `Olá, ${response.user.name}! Login realizado com sucesso.`;

        this.cdr.detectChanges();

        const rota = tipoRecebido === 'aluno'
          ? '/aluno'
          : '/profissional/home';

        sessionStorage.setItem('userId', String(response.user.id));
        sessionStorage.setItem('userRole', response.user.role);
        sessionStorage.setItem('userName', response.user.name);

        if (
          response.user.role === 'provider' &&
          response.user.providerId != null
        ) {
          sessionStorage.setItem(
            'providerId',
            String(response.user.providerId)
          );
        }
          
        // Dá tempo para a mensagem de sucesso ser exibida.
        setTimeout(() => {
          this.router.navigateByUrl(rota);
        }, 800);
      },
      error: (error) => {
        this.carregando = false;

        this.mensagemErro =
          error?.error?.message ??
          'Não foi possível conectar à API. Tente novamente.';

        this.cdr.detectChanges();
      }
    });
  }
}
