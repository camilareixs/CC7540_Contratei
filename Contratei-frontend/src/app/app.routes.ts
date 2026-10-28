import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio';
import { CadastroAlunoComponent } from './cadastro/cadastro-aluno/cadastro-aluno';
import { CadastroProfissionalComponent } from './cadastro/cadastro-profissional/cadastro-profissional';
import { LoginComponent } from './autenticacao/login/login';
import { AlunoLayoutComponent } from './aluno/aluno-layout/aluno-layout';
import { AlunoAgendarComponent } from './aluno/aluno-agendar/aluno-agendar';
import { AlunoBuscarComponent } from './aluno/aluno-buscar/aluno-buscar';
import { AlunoHomeComponent } from './aluno/aluno-home/aluno-home';
import { AlunoPagamentoComponent } from './aluno/aluno-pagamento/aluno-pagamento';
import { MeusAgendamentosComponent } from './aluno/meus-agendamentos/meus-agendamentos';
import { ProfissionalDetalheComponent } from './aluno/profissional-detalhe/profissional-detalhe';
import { ProfissionalLayoutComponent } from './profissional/profissional-layout/profissional-layout';
import { MeusAtendimentosComponent } from './profissional/meus-atendimentos/meus-atendimentos';
import { ProfissionalHomeComponent } from './profissional/profissional-home/profissional-home';
import { AgendamentoPagamentoService } from './aluno/services/agendamento-pagamento.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'cadastro/aluno',
    component: CadastroAlunoComponent
  },
  {
    path: 'cadastro/profissional',
    component: CadastroProfissionalComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },  
  {
    path: 'aluno',
    component: AlunoLayoutComponent,
    children: [
        {
        path: '',
        component: AlunoHomeComponent
        },
        {
        path: 'buscar',
        title: 'Buscar profissionais | CONTRATEI',
        component: AlunoBuscarComponent
        },
        {
        path: 'profissional/:id',
        title: 'Perfil do profissional | CONTRATEI',
        component: ProfissionalDetalheComponent
        },
        {
        path: 'agendar/:id',
        title: 'Agendar aula | CONTRATEI',
        component: AlunoAgendarComponent
        },
        {
        path: 'pagamento',
        title: 'Pagamento | CONTRATEI',
        component: AlunoPagamentoComponent
        },
        {
        path: 'meus-agendamentos',
        title: 'Meus agendamentos | CONTRATEI',
        component: MeusAgendamentosComponent
        }
    ]
  },
  {
    path: 'profissional',
    component: ProfissionalLayoutComponent,
    children: [
        {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
        },
        {
        path: 'home',
        component: ProfissionalHomeComponent
        },
        {
        path: 'meus-atendimentos',
        component: MeusAtendimentosComponent
        }
    ]
    },
  {
    path: '**',
    redirectTo: 'login'
  }
];
