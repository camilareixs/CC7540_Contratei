
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  ProfissionalDashboardService,
  PerfilProfissional,
  ServicoProfissionalApi,
  DisponibilidadeApi,
  CriarHorarioRequest,
  ServicoCatalogoApi,
  AssociarServicoRequest,
  CriarServicoRequest,
  AreaProfissionalApi,
  PerfilComplementarApi,
  SalvarPerfilComplementarRequest
} from '../../services/profissional-dashboard.service';

interface ServicoProfissional {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  modalidade: string;
  duracaoMinutos: number;
}

interface HorarioAgenda {
  id: number;
  dia: string;
  data: string;
  horario: string;
  status: string;
  statusTexto: string;
  podeBloquear: boolean;
}

@Component({
  selector: 'app-profissional-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profissional-home.html',
  styleUrl: './profissional-home.css'
})
export class ProfissionalHomeComponent implements OnInit {
  private readonly dashboardService =
    inject(ProfissionalDashboardService);

  private readonly cdr = inject(ChangeDetectorRef);

  private providerId = 0;

  carregando = true;
  erro = '';
  erroServicos = '';

  profissional = {
    id: 0,
    nome: 'Profissional',
    especialidade: 'Não informada',
    apresentacao: 'Nenhuma apresentação cadastrada.',
    email: 'Não informado',
    telefone: 'Não informado',
    cidade: 'Não informada',
    estado: '',
    foto: '',
    disponivel: false
  };

  servicos: ServicoProfissional[] = [];

  disponibilidade: {
    dia: string;
    horario: string;
  }[] = [];

  // Gerenciamento da agenda
  horariosAgenda: HorarioAgenda[] = [];

  carregandoAgenda = false;
  salvandoHorario = false;
  bloqueandoHorarioId: number | null = null;

  mostrarFormularioHorario = false;
  erroAgenda = '';
  mensagemAgenda = '';

  dataHoraInicio = '';
  dataHoraFim = '';

  nomeServico = '';
  descricaoServico = '';

  catalogoServicos: ServicoCatalogoApi[] = [];

  mostrarFormularioServico = false;
  carregandoCatalogo = false;
  salvandoServico = false;

  serviceIdSelecionado: number | null = null;
  precoServico: number | null = null;
  duracaoServico = 60;

  erroCadastroServico = '';
  mensagemCadastroServico = '';

  // Perfil complementar
  areasProfissionais: AreaProfissionalApi[] = [];
  perfilComplementar: PerfilComplementarApi | null = null;

  mostrarFormularioPerfil = false;
  carregandoPerfilComplementar = false;
  salvandoPerfilComplementar = false;

  erroPerfilComplementar = '';
  mensagemPerfilComplementar = '';

  novoTopico = '';

  formularioPerfil: SalvarPerfilComplementarRequest = {
    phone: '',
    postalCode: '',
    street: '',
    streetNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
    professionalAreaId: 0,
    description: '',
    experienceYears: 0,
    topics: []
  };

  ngOnInit(): void {
    const providerId = Number(
      sessionStorage.getItem('providerId')
    );

    if (!Number.isInteger(providerId) || providerId <= 0) {
      this.erro =
        'Não foi possível identificar seu perfil profissional. Faça login novamente.';
      this.carregando = false;
      this.cdr.detectChanges();
      return;
    }

    this.providerId = providerId;

    this.carregarPerfil(providerId);
    this.carregarServicos(providerId);
    this.carregarDisponibilidade(providerId);
    this.carregarAgenda(providerId);
    this.carregarCatalogoServicos();
    this.carregarAreasProfissionais();
    this.carregarPerfilComplementar(providerId);
  }

  private carregarPerfil(providerId: number): void {
    this.dashboardService.getPerfil(providerId).subscribe({
      next: (perfil: PerfilProfissional) => {
        this.profissional = {
          ...this.profissional,
          id: perfil.id,
          nome: perfil.displayName,
          apresentacao:
            perfil.description?.trim() ||
            'Nenhuma apresentação cadastrada.',
          disponivel: perfil.active
        };

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);

        this.erro =
          'Não foi possível carregar seu perfil. Tente novamente.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private carregarServicos(providerId: number): void {
    this.dashboardService.getServicos(providerId).subscribe({
      next: (dados: ServicoProfissionalApi[]) => {
        this.servicos = dados
          .filter(servico => servico.active)
          .map(servico => ({
            id: servico.id,
            nome: servico.serviceName,
            descricao:
              servico.serviceDescription?.trim() ||
              'Sem descrição cadastrada.',
            preco: servico.price,
            modalidade: `${servico.durationMinutes} minutos`,
            duracaoMinutos: servico.durationMinutes
          }));

        this.erroServicos = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar serviços:', error);

        this.erroServicos =
          'Não foi possível carregar seus serviços.';
        this.cdr.detectChanges();
      }
    });
  }
  
  private carregarCatalogoServicos(): void {
    this.carregandoCatalogo = true;

    this.dashboardService.getCatalogoServicos().subscribe({
      next: (servicos) => {
        this.catalogoServicos = servicos.filter(
          servico => servico.active
        );

        this.carregandoCatalogo = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar catálogo de serviços:', error);

        this.catalogoServicos = [];
        this.carregandoCatalogo = false;
        this.erroCadastroServico =
          'Não foi possível carregar o catálogo de serviços.';

        this.cdr.detectChanges();
      }
    });
  }

  abrirFormularioServico(): void {
    this.erroCadastroServico = '';
    this.mensagemCadastroServico = '';
    this.mostrarFormularioServico = true;
    this.cdr.detectChanges();
  }

  cancelarFormularioServico(): void {
    this.mostrarFormularioServico = false;
    this.nomeServico = '';
    this.descricaoServico = '';
    this.serviceIdSelecionado = null;
    this.precoServico = null;
    this.duracaoServico = 60;
    this.erroCadastroServico = '';
    this.cdr.detectChanges();
  }

  salvarServico(): void {
    this.erroCadastroServico = '';
    this.mensagemCadastroServico = '';

    const nome = this.nomeServico.trim();
    const descricao = this.descricaoServico.trim();

    if (this.providerIdInvalido()) {
      this.erroCadastroServico =
        'Não foi possível identificar seu perfil profissional. Faça login novamente.';
      return;
    }

    if (!nome) {
      this.erroCadastroServico = 'Informe o nome do serviço.';
      return;
    }

    if (
      this.precoServico === null ||
      !Number.isFinite(this.precoServico) ||
      this.precoServico < 0
    ) {
      this.erroCadastroServico =
        'Informe um preço válido, igual ou maior que zero.';
      return;
    }

    if (
      !Number.isInteger(this.duracaoServico) ||
      this.duracaoServico <= 0
    ) {
      this.erroCadastroServico =
        'A duração deve ser um número inteiro de minutos maior que zero.';
      return;
    }

    const novoServico: CriarServicoRequest = {
      name: nome,
      description: descricao
    };

    this.salvandoServico = true;

    // Primeiro: cria o serviço no catálogo.
    this.dashboardService.criarServico(novoServico).subscribe({
      next: (servicoCriado: ServicoCatalogoApi) => {
        const associacao: AssociarServicoRequest = {
          serviceId: servicoCriado.id,
          price: this.precoServico!,
          durationMinutes: this.duracaoServico
        };

        // Segundo: associa o serviço ao profissional.
        this.dashboardService
          .associarServico(this.profissional.id, associacao)
          .subscribe({
            next: () => {
              this.salvandoServico = false;
              this.mostrarFormularioServico = false;

              this.nomeServico = '';
              this.descricaoServico = '';
              this.precoServico = null;
              this.duracaoServico = 60;
              this.serviceIdSelecionado = null;

              this.mensagemCadastroServico =
                'Serviço cadastrado e associado ao seu perfil com sucesso.';

              this.carregarServicos(this.profissional.id);
              this.carregarCatalogoServicos();

              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error(
                'O serviço foi criado, mas a associação falhou:',
                error
              );

              this.salvandoServico = false;

              this.erroCadastroServico =
                'O serviço foi criado no catálogo, mas não foi possível associá-lo ao seu perfil. ' +
                'Não cadastre o mesmo serviço novamente. Verifique a associação antes de tentar outra vez.';

              this.carregarCatalogoServicos();
              this.cdr.detectChanges();
            }
          });
      },
      error: (error) => {
        console.error('Erro ao criar serviço:', error);

        this.salvandoServico = false;
        this.erroCadastroServico =
          error?.error?.message ||
          'Não foi possível criar o serviço. Verifique os dados e tente novamente.';

        this.cdr.detectChanges();
      }
    });
  }

  private providerIdInvalido(): boolean {
    return !Number.isInteger(this.profissional.id) ||
      this.profissional.id <= 0;
  }

  private carregarDisponibilidade(providerId: number): void {
    this.dashboardService
      .getDisponibilidade(providerId)
      .subscribe({
        next: (horarios: DisponibilidadeApi[]) => {
          const formatadorDia = new Intl.DateTimeFormat(
            'pt-BR',
            { weekday: 'long' }
          );

          const formatadorData = new Intl.DateTimeFormat(
            'pt-BR',
            { day: '2-digit', month: '2-digit' }
          );

          const formatadorHora = new Intl.DateTimeFormat(
            'pt-BR',
            { hour: '2-digit', minute: '2-digit' }
          );

          this.disponibilidade = horarios
            .filter(item => item.status === 'available')
            .sort(
              (a, b) =>
                new Date(a.startsAt).getTime() -
                new Date(b.startsAt).getTime()
            )
            .map(item => {
              const inicio = new Date(item.startsAt);
              const fim = new Date(item.endsAt);

              const dia = formatadorDia.format(inicio);
              const diaFormatado =
                dia.charAt(0).toUpperCase() + dia.slice(1);

              return {
                dia: `${diaFormatado} (${formatadorData.format(inicio)})`,
                horario:
                  `${formatadorHora.format(inicio)} – ` +
                  `${formatadorHora.format(fim)}`
              };
            });

          this.cdr.detectChanges();
        },
        error: error => {
          console.error(
            'Erro ao carregar disponibilidade:',
            error
          );

          this.disponibilidade = [];
          this.cdr.detectChanges();
        }
      });
  }

  carregarAgenda(providerId: number = this.providerId): void {
    if (providerId <= 0) {
      return;
    }

    this.carregandoAgenda = true;
    this.erroAgenda = '';

    this.dashboardService.getTodosHorarios(providerId).subscribe({
      next: (horarios: DisponibilidadeApi[]) => {
        const agora = Date.now();

        const formatadorDia = new Intl.DateTimeFormat(
          'pt-BR',
          { weekday: 'long' }
        );

        const formatadorData = new Intl.DateTimeFormat(
          'pt-BR',
          { day: '2-digit', month: '2-digit', year: 'numeric' }
        );

        const formatadorHora = new Intl.DateTimeFormat(
          'pt-BR',
          { hour: '2-digit', minute: '2-digit' }
        );

        this.horariosAgenda = horarios
          .sort(
            (a, b) =>
              new Date(a.startsAt).getTime() -
              new Date(b.startsAt).getTime()
          )
          .map(item => {
            const inicio = new Date(item.startsAt);
            const fim = new Date(item.endsAt);

            const dia = formatadorDia.format(inicio);
            const diaFormatado =
              dia.charAt(0).toUpperCase() + dia.slice(1);

            return {
              id: item.id,
              dia: diaFormatado,
              data: formatadorData.format(inicio),
              horario:
                `${formatadorHora.format(inicio)} – ` +
                `${formatadorHora.format(fim)}`,
              status: item.status,
              statusTexto: this.traduzirStatus(item.status),
              podeBloquear:
                item.status === 'available' &&
                inicio.getTime() > agora
            };
          });

        this.carregandoAgenda = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Erro ao carregar agenda:', error);

        this.erroAgenda =
          'Não foi possível carregar sua agenda. Tente novamente.';
        this.carregandoAgenda = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormularioHorario(): void {
    this.erroAgenda = '';
    this.mensagemAgenda = '';
    this.mostrarFormularioHorario = true;
    this.cdr.detectChanges();
  }

  cancelarFormularioHorario(): void {
    this.mostrarFormularioHorario = false;
    this.dataHoraInicio = '';
    this.dataHoraFim = '';
    this.erroAgenda = '';
    this.cdr.detectChanges();
  }

  salvarHorario(): void {
    this.erroAgenda = '';
    this.mensagemAgenda = '';

    if (!this.dataHoraInicio || !this.dataHoraFim) {
      this.erroAgenda =
        'Informe a data, a hora de início e a hora de término.';
      return;
    }

    // datetime-local representa o horário local do navegador.
    const inicio = new Date(this.dataHoraInicio);
    const fim = new Date(this.dataHoraFim);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime())
    ) {
      this.erroAgenda = 'Informe datas e horários válidos.';
      return;
    }

    if (inicio.getTime() <= Date.now()) {
      this.erroAgenda =
        'O horário de início precisa estar no futuro.';
      return;
    }

    if (fim.getTime() <= inicio.getTime()) {
      this.erroAgenda =
        'O horário de término precisa ser posterior ao início.';
      return;
    }

    const request: CriarHorarioRequest = {
      startsAt: inicio.toISOString(),
      endsAt: fim.toISOString()
    };

    this.salvandoHorario = true;

    this.dashboardService
      .criarHorario(this.providerId, request)
      .subscribe({
        next: () => {
          this.salvandoHorario = false;
          this.mostrarFormularioHorario = false;
          this.dataHoraInicio = '';
          this.dataHoraFim = '';
          this.mensagemAgenda = 'Horário cadastrado com sucesso.';

          this.carregarAgenda();
          this.carregarDisponibilidade(this.providerId);
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Erro ao cadastrar horário:', error);

          this.salvandoHorario = false;
          this.erroAgenda = this.obterMensagemErro(
            error,
            'Não foi possível cadastrar o horário. Verifique se ele não conflita com outro horário.'
          );

          this.cdr.detectChanges();
        }
      });
  }

  bloquearHorario(horario: HorarioAgenda): void {
    if (!horario.podeBloquear) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja bloquear o horário de ${horario.data}, das ${horario.horario}?`
    );

    if (!confirmar) {
      return;
    }

    this.erroAgenda = '';
    this.mensagemAgenda = '';
    this.bloqueandoHorarioId = horario.id;

    this.dashboardService
      .bloquearHorario(horario.id)
      .subscribe({
        next: () => {
          this.bloqueandoHorarioId = null;
          this.mensagemAgenda = 'Horário bloqueado com sucesso.';

          this.carregarAgenda();
          this.carregarDisponibilidade(this.providerId);
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Erro ao bloquear horário:', error);

          this.bloqueandoHorarioId = null;
          this.erroAgenda = this.obterMensagemErro(
            error,
            'Não foi possível bloquear esse horário. Ele pode já estar ocupado ou bloqueado.'
          );

          this.cdr.detectChanges();
        }
      });
  }

  private traduzirStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'available':
        return 'Disponível';
      case 'booked':
        return 'Ocupado';
      case 'blocked':
        return 'Bloqueado';
      default:
        return status;
    }
  }

  private obterMensagemErro(
    error: any,
    mensagemPadrao: string
  ): string {
    return (
      error?.error?.message ||
      error?.error?.title ||
      mensagemPadrao
    );
  }

  get localizacao(): string {
    return [this.profissional.cidade, this.profissional.estado]
      .filter(Boolean)
      .join(' - ');
  }

  formatarPreco(preco: number | null): string {
    if (preco === null || preco <= 0) {
      return 'A combinar';
    }

    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  private carregarAreasProfissionais(): void {
    this.dashboardService.getAreasProfissionais().subscribe({
      next: areas => {
        this.areasProfissionais = areas;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Erro ao carregar áreas profissionais:', error);
        this.erroPerfilComplementar =
          'Não foi possível carregar as áreas profissionais.';
        this.cdr.detectChanges();
      }
    });
  }

  private carregarPerfilComplementar(providerId: number): void {
    this.carregandoPerfilComplementar = true;

    this.dashboardService.getPerfilComplementar(providerId).subscribe({
      next: perfil => {
        this.perfilComplementar = perfil;

        this.formularioPerfil = {
          phone: perfil.phone ?? '',
          postalCode: perfil.postalCode ?? '',
          street: perfil.street ?? '',
          streetNumber: perfil.streetNumber ?? '',
          neighborhood: perfil.neighborhood ?? '',
          city: perfil.city ?? '',
          state: perfil.state ?? '',
          country: perfil.country ?? 'Brasil',
          professionalAreaId: perfil.professionalAreaId,
          description: perfil.description ?? '',
          experienceYears: perfil.experienceYears ?? 0,
          topics: [...(perfil.topics ?? [])]
        };

        this.atualizarResumoPerfil(perfil);

        this.carregandoPerfilComplementar = false;
        this.cdr.detectChanges();
      },
      error: error => {
        // 404 significa que o perfil complementar ainda não foi criado.
        if (error.status === 404) {
          this.perfilComplementar = null;
          this.carregandoPerfilComplementar = false;
          this.cdr.detectChanges();
          return;
        }

        console.error('Erro ao carregar perfil complementar:', error);

        this.erroPerfilComplementar =
          'Não foi possível carregar os dados complementares do perfil.';
        this.carregandoPerfilComplementar = false;
        this.cdr.detectChanges();
      }
    });
  }

  private atualizarResumoPerfil(perfil: PerfilComplementarApi): void {
    this.profissional = {
      ...this.profissional,
      telefone: perfil.phone,
      cidade: perfil.city,
      estado: perfil.state,
      especialidade: perfil.professionalAreaName,
      apresentacao: perfil.description
    };
  }

  editarPerfil(): void {
    this.erroPerfilComplementar = '';
    this.mensagemPerfilComplementar = '';

    // Se os dados já existem, usa-os como ponto de partida.
    if (this.perfilComplementar) {
      const perfil = this.perfilComplementar;

      this.formularioPerfil = {
        phone: perfil.phone ?? '',
        postalCode: perfil.postalCode ?? '',
        street: perfil.street ?? '',
        streetNumber: perfil.streetNumber ?? '',
        neighborhood: perfil.neighborhood ?? '',
        city: perfil.city ?? '',
        state: perfil.state ?? '',
        country: perfil.country ?? 'Brasil',
        professionalAreaId: perfil.professionalAreaId,
        description: perfil.description ?? '',
        experienceYears: perfil.experienceYears ?? 0,
        topics: [...(perfil.topics ?? [])]
      };
    }

    this.mostrarFormularioPerfil = true;
    this.cdr.detectChanges();
  }

  cancelarEdicaoPerfil(): void {
    this.mostrarFormularioPerfil = false;
    this.erroPerfilComplementar = '';
    this.mensagemPerfilComplementar = '';

    if (this.perfilComplementar) {
      this.atualizarResumoPerfil(this.perfilComplementar);
    }

    this.cdr.detectChanges();
  }

  adicionarTopicoLocal(): void {
    const nome = this.novoTopico.trim();

    if (!nome) {
      return;
    }

    if (nome.length > 100) {
      this.erroPerfilComplementar =
        'Cada tópico pode ter no máximo 100 caracteres.';
      return;
    }

    const jaExiste = this.formularioPerfil.topics.some(
      topico => topico.toLocaleLowerCase('pt-BR') ===
        nome.toLocaleLowerCase('pt-BR')
    );

    if (jaExiste) {
      this.erroPerfilComplementar = 'Esse tópico já foi adicionado.';
      return;
    }

    if (this.formularioPerfil.topics.length >= 100) {
      this.erroPerfilComplementar = 'Você pode adicionar no máximo 100 tópicos.';
      return;
    }

    this.formularioPerfil.topics = [
      ...this.formularioPerfil.topics,
      nome
    ];

    this.novoTopico = '';
    this.erroPerfilComplementar = '';
    this.cdr.detectChanges();
  }

  removerTopicoLocal(indice: number): void {
    this.formularioPerfil.topics =
      this.formularioPerfil.topics.filter((_, i) => i !== indice);

    this.cdr.detectChanges();
  }

  salvarPerfilComplementar(): void {
    this.erroPerfilComplementar = '';
    this.mensagemPerfilComplementar = '';

    if (this.providerId <= 0) {
      this.erroPerfilComplementar =
        'Não foi possível identificar seu perfil profissional. Faça login novamente.';
      return;
    }

    const request: SalvarPerfilComplementarRequest = {
      ...this.formularioPerfil,
      phone: this.formularioPerfil.phone.trim(),
      postalCode: this.formularioPerfil.postalCode.trim(),
      street: this.formularioPerfil.street.trim(),
      streetNumber: this.formularioPerfil.streetNumber.trim(),
      neighborhood: this.formularioPerfil.neighborhood.trim(),
      city: this.formularioPerfil.city.trim(),
      state: this.formularioPerfil.state.trim(),
      country: this.formularioPerfil.country.trim(),
      description: this.formularioPerfil.description.trim(),
      topics: this.formularioPerfil.topics
        .map(topico => topico.trim())
        .filter(Boolean)
    };

    if (
      !request.phone ||
      !request.postalCode ||
      !request.street ||
      !request.streetNumber ||
      !request.neighborhood ||
      !request.city ||
      !request.state ||
      !request.country ||
      !request.description
    ) {
      this.erroPerfilComplementar =
        'Preencha todos os campos obrigatórios.';
      return;
    }

    if (request.professionalAreaId <= 0) {
      this.erroPerfilComplementar = 'Selecione sua área profissional.';
      return;
    }

    if (
      !Number.isInteger(request.experienceYears) ||
      request.experienceYears < 0 ||
      request.experienceYears > 80
    ) {
      this.erroPerfilComplementar =
        'Informe uma experiência entre 0 e 80 anos.';
      return;
    }

    this.salvandoPerfilComplementar = true;

    this.dashboardService
      .salvarPerfilComplementar(this.providerId, request)
      .subscribe({
        next: resposta => {
          this.perfilComplementar = resposta.profile;
          this.atualizarResumoPerfil(resposta.profile);

          this.mostrarFormularioPerfil = false;
          this.salvandoPerfilComplementar = false;
          this.mensagemPerfilComplementar =
            resposta.message || 'Perfil profissional salvo com sucesso.';

          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Erro ao salvar perfil complementar:', error);

          this.erroPerfilComplementar =
            error?.error?.message ||
            'Não foi possível salvar o perfil profissional. Verifique os dados e tente novamente.';

          this.salvandoPerfilComplementar = false;
          this.cdr.detectChanges();
        }
      });
  }

  get perfilCompletoParaAtendimento(): boolean {
    const enderecoCadastrado = !!this.localizacao?.trim();

    const servicoCadastrado = this.servicos?.length > 0;

    const disponibilidadeCadastrada =
      this.disponibilidade?.length > 0;

    return (
      enderecoCadastrado &&
      servicoCadastrado &&
      disponibilidadeCadastrada
    );
  }

}
