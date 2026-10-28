import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoAgendar } from './aluno-agendar';

describe('AlunoAgendar', () => {
  let component: AlunoAgendar;
  let fixture: ComponentFixture<AlunoAgendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoAgendar],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoAgendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
