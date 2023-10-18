import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class DialogService {
  dialogRef!: MatDialogRef<any>;

  constructor(private dialog: MatDialog) { }

  openDialog(component: Type<any>, data: any): MatDialogRef<any> {
    return this.dialogRef = this.dialog.open(component, {
      width: '400px',
      data: data
    });
  }
}
