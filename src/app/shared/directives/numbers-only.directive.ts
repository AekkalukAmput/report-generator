import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[numbersOnly]',
  standalone: true,
})
export class NumbersOnlyDirective {
  @Input() allowDecimals: boolean = false;
  @Input() allowNegative: boolean = false;
  @Input() decimalPlaces: number = 2;

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];

    if (allowedKeys.includes(event.key)) {
      return; // Allow navigation and editing keys
    }

    if (this.allowDecimals && event.key === '.') {
      if (this.el.nativeElement.value.includes('.')) {
        event.preventDefault(); // Only one decimal point allowed
      }
      return;
    }

    if (this.allowNegative && event.key === '-') {
      if (this.el.nativeElement.value.length > 0) {
        event.preventDefault(); // Negative sign only at the beginning
      }
      return;
    }

    if (this.el.nativeElement.value.includes('.') && this.el.nativeElement.value.split('.')[1]?.length >= this.decimalPlaces && event.key !== 'Backspace') {
      event.preventDefault();
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault(); // Prevent non-numeric characters
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    const numericRegex = this.allowDecimals
      ? this.allowNegative
        ? /^-?\d*\.?\d*$/
        : /^\d*\.?\d*$/
      : this.allowNegative
      ? /^-?\d*$/
      : /^\d*$/;

    if (!numericRegex.test(pastedText)) {
      event.preventDefault(); // Prevent pasting non-numeric content
    }
  }
}
