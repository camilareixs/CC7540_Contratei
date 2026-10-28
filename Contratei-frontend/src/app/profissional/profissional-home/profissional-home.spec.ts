import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfissionalHome } from './profissional-home';

describe('ProfissionalHome', () => {
  let component: ProfissionalHome;
  let fixture: ComponentFixture<ProfissionalHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfissionalHome],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfissionalHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
