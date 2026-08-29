import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeeTypeModalComponent } from './create-fee-type-modal.component';

describe('CreateFeeTypeModalComponent', () => {
  let component: CreateFeeTypeModalComponent;
  let fixture: ComponentFixture<CreateFeeTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFeeTypeModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFeeTypeModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
