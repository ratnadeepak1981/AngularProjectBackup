import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveHoldTimerComponent } from './active-hold-timer.component';

describe('ActiveHoldTimerComponent', () => {
  let component: ActiveHoldTimerComponent;
  let fixture: ComponentFixture<ActiveHoldTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveHoldTimerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveHoldTimerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
