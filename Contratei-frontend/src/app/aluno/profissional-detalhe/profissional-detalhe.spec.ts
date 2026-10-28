import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfissionalDetalhe } from './profissional-detalhe';

describe('ProfissionalDetalhe', () => {
  let component: ProfissionalDetalhe;
  let fixture: ComponentFixture<ProfissionalDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfissionalDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfissionalDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
