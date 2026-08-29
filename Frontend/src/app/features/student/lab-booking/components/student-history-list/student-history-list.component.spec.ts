import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentHistoryListComponent } from './student-history-list.component';

describe('StudentHistoryListComponent', () => {
  let component: StudentHistoryListComponent;
  let fixture: ComponentFixture<StudentHistoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentHistoryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentHistoryListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
