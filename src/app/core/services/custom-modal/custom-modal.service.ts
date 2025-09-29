import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from '@shared/modals/confirm-modal/confirm-modal.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  btnCancel?: string;
  btnConfirm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomModalService {
  constructor(private dialog: MatDialog) {}

  openConfirmDialog(data: ConfirmDialogData) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '50dvw',
      data: {
        title: data.title,
        message: data.message,
        btnCancel: data.btnCancel,
        btnConfirm: data.btnConfirm,
      },
    });

    return dialogRef.afterClosed();
  }
}
