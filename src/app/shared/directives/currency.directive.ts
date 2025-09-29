import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[currency]',
  standalone: true,
})
export class CurrencyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('blur', ['$event']) onBlur(event: Event) {
    let value: string = this.el.nativeElement.value;
    // Remove non-numeric characters (except decimal point)
    value = value.replace(/[^0-9.]/g, '');

    // Format with thousands separators
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    this.el.nativeElement.value = parts.join('.');
  }

  @HostListener('focus', ['$event']) onFocus(event: Event) {
    let value: string = this.el.nativeElement.value;
    // Remove formatting for editing
    value = value.replace(/,/g, '');
    this.el.nativeElement.value = value;
  }
}
