import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      title: string; 
      message: string; 
      btnCancel?: string; 
      btnConfirm?: string
    }
  ) {}

  onCancelClick(): void {
    this.dialogRef.close(false); // Close with 'false' for cancel
  }

  onConfirmClick(): void {
    this.dialogRef.close(true); // Close with 'true' for confirm
  }
}
