import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostelApplicationPageComponent } from './hostel-application-page.component';

describe('HostelApplicationPageComponent', () => {
  let component: HostelApplicationPageComponent;
  let fixture: ComponentFixture<HostelApplicationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostelApplicationPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostelApplicationPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
