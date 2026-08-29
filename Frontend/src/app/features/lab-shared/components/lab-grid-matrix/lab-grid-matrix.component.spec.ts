import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabGridMatrixComponent } from './lab-grid-matrix.component';

describe('LabGridMatrixComponent', () => {
  let component: LabGridMatrixComponent;
  let fixture: ComponentFixture<LabGridMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabGridMatrixComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabGridMatrixComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
