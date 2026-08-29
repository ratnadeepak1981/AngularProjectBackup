import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillLedgerListComponent } from './bill-ledger-list.component';

describe('BillLedgerListComponent', () => {
  let component: BillLedgerListComponent;
  let fixture: ComponentFixture<BillLedgerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillLedgerListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BillLedgerListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
