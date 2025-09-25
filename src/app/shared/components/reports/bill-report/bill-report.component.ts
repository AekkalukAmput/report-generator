import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DateConverterService } from '@core/services/date-converter/date-converter.service';
import { CustomPaperComponent } from '@shared/components/custom-paper/custom-paper.component';
import dayjs from 'dayjs';

@Component({
  selector: 'app-bill-report',
  standalone: true,
  imports: [CustomPaperComponent, CommonModule],
  templateUrl: './bill-report.component.html',
  styleUrl: './bill-report.component.scss'
})
export class BillReportComponent {
  @ViewChild('billReport') billReportRef!: CustomPaperComponent;

  productList = [
    { description: 'Product 1', quantity: 2, unitPrice: 10.00 },
    { description: 'Product 2', quantity: 1, unitPrice: 30.00 },
    { description: 'Product 3', quantity: 5, unitPrice: 5.00 },
  ];
  discount: number = 0.10; // 10%
  vat: number = 0.07; // 7%

  constructor(
    private dateConverter: DateConverterService
  ) { }

  exportNativeElementRef() {
    return this.billReportRef.exportNativeElementRef();
  }

  get genInvoiceNo() {
    const now = dayjs();
    return `INV-${now.format('YYYYMMDDHHmmss')}`;
  }

  formatDate(date: Date | string) {
    return this.dateConverter.formatDateBB(date);
  }

  get subTotal() {
    return this.productList.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }
  get discountAmount() {
    return this.subTotal * this.discount;
  }
  get vatAmount() {
    return (this.subTotal - this.discountAmount) * this.vat;
  }
  get total() {
    return this.subTotal - this.discountAmount + this.vatAmount;
  }
}
