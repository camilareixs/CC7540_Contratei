import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAluno } from './cadastro-aluno';

describe('CadastroAluno', () => {
  let component: CadastroAluno;
  let fixture: ComponentFixture<CadastroAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroAluno],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroAluno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
