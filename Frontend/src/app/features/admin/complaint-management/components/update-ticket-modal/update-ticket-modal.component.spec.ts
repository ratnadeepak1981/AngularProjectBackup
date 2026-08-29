import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTicketModalComponent } from './update-ticket-modal.component';

describe('UpdateTicketModalComponent', () => {
  let component: UpdateTicketModalComponent;
  let fixture: ComponentFixture<UpdateTicketModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTicketModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateTicketModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
