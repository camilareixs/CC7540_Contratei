import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunoHome } from './aluno-home';

describe('AlunoHome', () => {
  let component: AlunoHome;
  let fixture: ComponentFixture<AlunoHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlunoHome],
    }).compileComponents();

    fixture = TestBed.createComponent(AlunoHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
