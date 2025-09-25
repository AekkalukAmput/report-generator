import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillReportComponent } from './bill-report.component';

describe('BillReportComponent', () => {
  let component: BillReportComponent;
  let fixture: ComponentFixture<BillReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
