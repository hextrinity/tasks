import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditTaskModalComponent } from './add-edit-task-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

describe('AddEditTaskModalComponent', () => {
  let component: AddEditTaskModalComponent;
  let fixture: ComponentFixture<AddEditTaskModalComponent>;

  const mockData = {
    name: 'Test Task',
    description: 'Test Description',
    dueDate: new Date(),
    categoryId: 'urgentImportant',
    orderId: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditTaskModalComponent],
      imports: [ReactiveFormsModule, MaterialModule, BrowserAnimationsModule],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should set isEditMode to true when data has name', () => {
    expect(component.isEditMode).toBeTrue();
  });


  it('should initialize form with provided data', () => {
    expect(component.formGroup.value.name).toBe(mockData.name);
    expect(component.formGroup.value.description).toBe(mockData.description);
    expect(component.formGroup.value.categoryId).toBe(mockData.categoryId);
  });


  it('should close dialog with transformed task on save', () => {

    const date = new Date();
    component.formGroup.setValue({
      name: 'New Task',
      description: 'Desc',
      dueDate: date,
      categoryId: 'urgentImportant',
      orderId: 1
    });

    component.saveForm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      action: 'save',
      formValue: jasmine.objectContaining({
        name: 'New Task',
        dueDate: date.getTime()
      })
    });
  });


  it('should close dialog with cancel action', () => {
    component.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      action: 'cancel',
      formValue: null
    });
  });

});