import { Component, ViewChild } from '@angular/core';
import { GeneratePdfService } from '@core/services/generate-pdf/generate-pdf.service';
import { BillReportComponent } from '@shared/components/reports/bill-report/bill-report.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [BillReportComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  @ViewChild('billReport') billReportRef!: BillReportComponent;

  constructor(
    private generatePdfService: GeneratePdfService
  ) { }

  exportPdf() {
    this.generatePdfService.fromElement(this.billReportRef.exportNativeElementRef(), 'bill-report.pdf');
  }
}
