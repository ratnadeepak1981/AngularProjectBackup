import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRoomModalComponent } from './assign-room-modal.component';

describe('AssignRoomModalComponent', () => {
  let component: AssignRoomModalComponent;
  let fixture: ComponentFixture<AssignRoomModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRoomModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignRoomModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
