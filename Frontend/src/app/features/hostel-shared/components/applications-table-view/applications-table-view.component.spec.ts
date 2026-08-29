import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationsTableViewComponent } from './applications-table-view.component';

describe('ApplicationsTableViewComponent', () => {
  let component: ApplicationsTableViewComponent;
  let fixture: ComponentFixture<ApplicationsTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationsTableViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationsTableViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
