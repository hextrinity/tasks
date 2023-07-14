
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from 'src/app/store/task.interface';

@Component({
    selector: 'app-add-edit-task-modal',
    templateUrl: './add-edit-task-modal.component.html',
    styleUrls: ['./add-edit-task-modal.component.scss'],
  })

  export class AddEditTaskModalComponent implements OnInit {
    formGroup!: FormGroup;
    isEditMode!: boolean;

    constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      private dialogRef: MatDialogRef<AddEditTaskModalComponent>,
      private formBuilder: FormBuilder){
    }

    ngOnInit() {
      this.isEditMode = !!this.data.name; // Check if data.name is present (edit mode)
      this.initializeForm(this.data);
    }

    private initializeForm(data: any): void {
      this.formGroup = this.formBuilder.group({
        name: [data ? data.name : '', Validators.required],
        description: [data ? data.description : '', Validators.required],
        dueDate: [data ? data.dueDate : null, Validators.required],
        categoryId: [data? data.categoryId : null],
        orderId: [data ? data.orderId : null],
      });
    }

    saveForm(): void {
      if (this.formGroup.valid) {
        const formValue = this.formGroup.value;
        const task: Task = {
          ...formValue,
          dueDate: formValue.dueDate ? formValue.dueDate.getTime() : null, // Convert Date to timestamp
        };

        this.dialogRef.close({ action: 'save', formValue: task });
      }
    }

    cancel(): void {
      this.dialogRef.close({ action: 'cancel', formValue: null });
    }

  }
