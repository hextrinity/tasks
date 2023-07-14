import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddEditTaskModalComponent } from '../features/add-edit-task-modal/add-edit-task-modal.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  dialogRef!: MatDialogRef<AddEditTaskModalComponent>;

  constructor(private dialog: MatDialog) { }

  openDialog(data: any): MatDialogRef<AddEditTaskModalComponent> {
    return this.dialogRef = this.dialog.open(AddEditTaskModalComponent, {
      width: '400px',
      data: data
    });
  }
}
