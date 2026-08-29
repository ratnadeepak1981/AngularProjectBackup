import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSelectorsComponent } from './booking-selectors.component';

describe('BookingSelectorsComponent', () => {
  let component: BookingSelectorsComponent;
  let fixture: ComponentFixture<BookingSelectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSelectorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingSelectorsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
