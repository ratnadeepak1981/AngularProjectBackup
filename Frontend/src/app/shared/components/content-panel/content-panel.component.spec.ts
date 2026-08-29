import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPanelComponent } from './content-panel.component';

describe('ContentPanelComponent', () => {
  let component: ContentPanelComponent;
  let fixture: ComponentFixture<ContentPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
