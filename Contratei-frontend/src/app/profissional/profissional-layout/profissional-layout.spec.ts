import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfissionalLayout } from './profissional-layout';

describe('ProfissionalLayout', () => {
  let component: ProfissionalLayout;
  let fixture: ComponentFixture<ProfissionalLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfissionalLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfissionalLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
