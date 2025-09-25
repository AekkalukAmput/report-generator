import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

type Paper = 'A3' | 'A4';
interface PaperSizeNum { width: number; }

@Component({
  selector: 'custom-paper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-paper.component.html',
  styleUrl: './custom-paper.component.scss'
})
export class CustomPaperComponent {
  @Input('size') size: Paper = 'A4';
  @ViewChild('elRef') elRef!: ElementRef;
  pageWidth = '210mm';   // หรือ '794px' (A4 @96dpi)
  pageHeight = '297mm';   // หรือ '1123px'
  pageInset = '0mm';    // ขอบใน

  get paperSize(): PaperSizeNum {
    switch (this.size) {
      case 'A3':
        return { width: 1123 };
      case 'A4':
      default:
        return { width: 794 };
    }
  }

  get paperStyle() {
    return {
      width: `${this.paperSize.width}px`,
      height: 'auto',
    };
  }

  exportNativeElementRef() {
    return this.elRef.nativeElement;
  }
}
