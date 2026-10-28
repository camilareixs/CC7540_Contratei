
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { ProfissionalDashboardService } from '../../services/profissional-dashboard.service';

@Component({
  selector: 'app-profissional-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './profissional-layout.html',
  styleUrl: './profissional-layout.css'
})
export class ProfissionalLayoutComponent implements OnInit {
  private readonly dashboardService =
    inject(ProfissionalDashboardService);

  private readonly cdr = inject(ChangeDetectorRef);

  nomeProfissional = 'Profissional';

  ngOnInit(): void {
    const providerId = Number(
      sessionStorage.getItem('providerId')
    );

    if (!Number.isInteger(providerId) || providerId <= 0) {
      return;
    }

    this.dashboardService.getPerfil(providerId).subscribe({
      next: perfil => {
        this.nomeProfissional =
          perfil.displayName?.trim() || 'Profissional';

        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Erro ao carregar nome do profissional:',
          error
        );

        this.cdr.detectChanges();
      }
    });
  }
}
