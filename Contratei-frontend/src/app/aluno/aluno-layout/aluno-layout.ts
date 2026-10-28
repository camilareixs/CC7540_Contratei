
import { Component, OnInit } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-aluno-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './aluno-layout.html',
  styleUrl: './aluno-layout.css'
})
export class AlunoLayoutComponent implements OnInit {
  nomeAluno = 'Aluno';

  ngOnInit(): void {
    const nomeSalvo = sessionStorage.getItem('userName');

    if (nomeSalvo?.trim()) {
      this.nomeAluno = nomeSalvo.trim();
    }
  }
}
