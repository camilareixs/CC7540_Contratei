import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoBuscar } from './aluno-buscar';

describe('AlunoBuscar', () => {
  let component: AlunoBuscar;
  let fixture: ComponentFixture<AlunoBuscar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoBuscar],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoBuscar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
