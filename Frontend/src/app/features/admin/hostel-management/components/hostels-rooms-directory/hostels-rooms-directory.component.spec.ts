import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostelsRoomsDirectoryComponent } from './hostels-rooms-directory.component';

describe('HostelsRoomsDirectoryComponent', () => {
  let component: HostelsRoomsDirectoryComponent;
  let fixture: ComponentFixture<HostelsRoomsDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostelsRoomsDirectoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostelsRoomsDirectoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
