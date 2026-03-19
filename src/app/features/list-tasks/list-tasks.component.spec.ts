import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListTasksComponent } from './list-tasks.component';
import { TasksService } from 'src/app/services/tasks.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ColorSchemeService } from 'src/app/services/color-scheme.service';
import { BehaviorSubject, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from '../../material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskCategory } from 'src/app/models/task-category.enum';

describe('ListTasksComponent', () => {
  let component: ListTasksComponent;
  let fixture: ComponentFixture<ListTasksComponent>;

  const tasksServiceMock = {
    getTasks: jasmine.createSpy('getTasks').and.returnValue([]),

    getTasksByCategory: jasmine.createSpy('getTasksByCategory')
      .and.returnValue(new BehaviorSubject([])),

    updateTask: jasmine.createSpy('updateTask').and.returnValue(of(null)),

    updateTaskCategory: jasmine.createSpy('updateTaskCategory').and.returnValue(of([])),

    deleteTask: jasmine.createSpy('deleteTask').and.returnValue(of(null)),

    addTask: jasmine.createSpy('addTask').and.returnValue(of({}))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListTasksComponent],
      imports: [MatIconModule, MaterialModule],
      providers: [
        { provide: TasksService, useValue: tasksServiceMock },
        DialogService,
        ColorSchemeService
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ListTasksComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
    
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch tasks by category and store them in tasksByCategory', () => {

    const category = TaskCategory.UrgentImportant;

    const mockTasks = [
      { name: 'Task 1', description: '', dueDate: null, categoryId: category, orderId: 1 },
      { name: 'Task 2', description: '', dueDate: null, categoryId: category, orderId: 2 }
    ];

    tasksServiceMock.getTasksByCategory.and.returnValue(of(mockTasks));

    component.fetchTasksByCategory(category);

    expect(tasksServiceMock.getTasksByCategory)
      .toHaveBeenCalledWith(category, 'tasks');

    expect(component.tasksByCategory[category]).toEqual(mockTasks);

  });

  it('should transfer task and call updateTaskCategory when dropped in different container', () => {

    const updateCategorySpy = jasmine.createSpy().and.returnValue(of([]));
    tasksServiceMock.updateTaskCategory = updateCategorySpy;

    const prevTasks = [{ id: '1', categoryId: TaskCategory.UrgentImportant }] as any[];
    const newTasks = [] as any[];

    const event: any = {
      previousContainer: { 
        data: prevTasks, 
        id: TaskCategory.UrgentImportant 
      },
      container: { 
        data: newTasks, 
        id: TaskCategory.UrgentNotImportant 
      },
      previousIndex: 0,
      currentIndex: 0,
      item: { data: prevTasks[0] }
    };

    component.onDrop(event, TaskCategory.UrgentNotImportant);
    
    expect(updateCategorySpy).toHaveBeenCalledWith(
      TaskCategory.UrgentImportant,
      TaskCategory.UrgentNotImportant,
      newTasks
    );
    
    expect(newTasks.length).toBe(1);    
    expect(newTasks[0].categoryId).toBe(TaskCategory.UrgentNotImportant);
  });

  it('should add task when dialog returns save action (new task)', () => {

    const dialogMock = {
      afterClosed: () => of({
        action: 'save',
        formValue: { name: 'New Task' }
      })
    };

    spyOn(component['dialogService'], 'openDialog').and.returnValue(dialogMock as any);

    const addSpy = jasmine.createSpy().and.returnValue(of({
      id: '1',
      name: 'New Task',
      categoryId: TaskCategory.UrgentImportant
    }));

    tasksServiceMock.addTask = addSpy;

    component.tasksByCategory[TaskCategory.UrgentImportant] = [];

    component.openDialog(TaskCategory.UrgentImportant);

    expect(addSpy).toHaveBeenCalledWith(
      TaskCategory.UrgentImportant,
      jasmine.any(Object)
    );

    expect(component.tasksByCategory[TaskCategory.UrgentImportant].length).toBe(1);
  });

  it('should update task when dialog returns save action (existing task)', () => {

    const existingTask = {
      id: '1',
      name: 'Old Task',
      categoryId: TaskCategory.UrgentImportant
    } as any;

    const dialogMock = {
      afterClosed: () => of({
        action: 'save',
        formValue: { name: 'Updated Task' }
      })
    };

    spyOn(component['dialogService'], 'openDialog').and.returnValue(dialogMock as any);

    const updateSpy = jasmine.createSpy().and.returnValue(of(null));
    tasksServiceMock.updateTask = updateSpy;

    component.openDialog(TaskCategory.UrgentImportant, existingTask);

    expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Updated Task',
      categoryId: TaskCategory.UrgentImportant
    }));
  });

  it('should call deleteTask service when taskId is provided', () => {

    const deleteSpy = jasmine.createSpy().and.returnValue(of(null));
    tasksServiceMock.deleteTask = deleteSpy;

    component.deleteTask(TaskCategory.UrgentImportant, 'task1');

    expect(deleteSpy).toHaveBeenCalledWith(
      TaskCategory.UrgentImportant,
      'task1'
    );
  });

});