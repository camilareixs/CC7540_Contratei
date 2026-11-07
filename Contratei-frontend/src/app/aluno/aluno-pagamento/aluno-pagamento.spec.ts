import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoPagamento } from './aluno-pagamento';

describe('AlunoPagamento', () => {
  let component: AlunoPagamento;
  let fixture: ComponentFixture<AlunoPagamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoPagamento],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoPagamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
