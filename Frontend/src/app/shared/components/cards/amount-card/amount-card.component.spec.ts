import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountCardComponent } from './amount-card.component';

describe('AmountCardComponent', () => {
  let component: AmountCardComponent;
  let fixture: ComponentFixture<AmountCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmountCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AmountCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
