import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiProblemDetails } from './api-error';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private events = new Subject<ApiProblemDetails>();
  events$ = this.events.asObservable();

  constructor(private snack: MatSnackBar) {}

  emit(error: ApiProblemDetails) {
    this.events.next(error);
  }

  showToast(m: string) {
    this.snack.open(m, 'ปิด', { duration: 4000 });
  }
}
