import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class GeneratePdfService {

  constructor() { }

  async fromElement(el: HTMLElement, filename = 'document.pdf') {
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;

    const canvas = await html2canvas(el, {
      scale: 2, // เพิ่มความคมชัด
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a4');

    // คำนวณให้ภาพพอดี A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const EPS = 0.01; // mm
    const pages = Math.max(1, Math.ceil((imgHeight - EPS) / pageHeight));

    for (let i = 0; i < pages; i++) {
      if (i > 0) pdf.addPage();
      // วาดรูปเดียวกัน เลื่อนแกน Y ขึ้นทีละ pageH
      pdf.addImage(imgData, 'PNG', 0, -i * pageHeight, imgWidth, imgHeight);
    }

    pdf.save(filename);
  }
}
