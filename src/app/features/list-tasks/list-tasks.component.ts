import { Component, OnInit } from '@angular/core';
import { TaskCategory, TaskCategoryNames } from 'src/app/models/task-category.enum';
import { Task } from 'src/app/models/task.interface';
import { TasksService } from 'src/app/services/tasks.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DialogService } from 'src/app/services/dialog.service';
import { Subscription } from 'rxjs';
import { AddEditTaskModalComponent } from '../add-edit-task-modal/add-edit-task-modal.component';
import { ColorSchemeService } from '../../services/color-scheme.service';
@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  taskCategories = Object.values(TaskCategory);
  taskCategoryNames = TaskCategoryNames;
  tasksByCategory: { [key: string]: Task[] } = {};
  connectedDropLists: string[][] = [];
  dialogCloseSubs!: Subscription;
  tasksByCategorySubs!: Subscription;
  updateTaskSubs!: Subscription;

  constructor(
    private taskService: TasksService,
    private dialogService: DialogService,
    private colorSchemeService: ColorSchemeService
    ) {}

  ngOnInit(): void {
    this.fetchTasksByCategory(TaskCategory.NotUrgentImportant);
    this.fetchTasksByCategory(TaskCategory.NotUrgentNotImportant);
    this.fetchTasksByCategory(TaskCategory.UrgentImportant);
    this.fetchTasksByCategory(TaskCategory.UrgentNotImportant);

    this.connectedDropLists = this.taskCategories.map((category) =>
      this.taskCategories.filter((c) => c !== category)
    );
  }

  fetchTasksByCategory(category: TaskCategory): void {
    this.tasksByCategorySubs = this.taskService.getTasksByCategory(category)
    .subscribe((tasks) => {
      this.tasksByCategory[category] = tasks;
    });
  }

  getConnectedDropLists(category: TaskCategory): string[] {
    return this.connectedDropLists[this.taskCategories.indexOf(category)];
  }

  onDrop(event: CdkDragDrop<Task[]>, category: TaskCategory): void {
    const { previousContainer, container, item } = event;
    const task = item.data;

    if (previousContainer === container) {
      // Rearrange tasks within the same category
      moveItemInArray(container.data, event.previousIndex, event.currentIndex);

      // Update the order IDs of the tasks in the same category
      container.data.forEach((task, index) => {
        task.orderId = index + 1; // Adding 1 to start the order ID from 1
        this.updateTaskSubs = this.taskService.updateTask(task)
        .subscribe({
            next: (v) => console.log('Task order updated successfully'),
            error: (error) => console.error('Failed to update task order', error, task),
            complete: () => console.info('Complete')
        });
      });
    } else {
      // Move tasks between categories
      transferArrayItem(
        previousContainer.data,
        container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the category of the task
      task.categoryId = category.toString(); // Assign the correct category ID here

      // Call the updateTaskCategory method to transfer the task and update the order
      const oldCategoryId = previousContainer.id;
      const newCategoryId = container.id;

      this.taskService.updateTaskCategory(oldCategoryId, newCategoryId, container.data)
      .subscribe({
          next: (v) => console.log('Task category updated successfully'),
          error: (error) => console.error('Failed to update task category', error, task),
          complete: () => console.info('Complete')
      });
    }
  }

  getTileBackground(index: number): string {
    const currentScheme = this.colorSchemeService.getCurrentScheme().getValue();

    const colors = [currentScheme.color1, currentScheme.color2, currentScheme.color3, currentScheme.color4];
    return colors[index];
  }


  deleteTask(categoryId: string, taskId: string | null): void {
    if (!taskId) {
      return;
    }
    this.taskService.deleteTask(categoryId, taskId)
    .subscribe({
        next: (v) => console.log('Task deleted successfully'),
        error: (error) => console.error('Failed to delete task', error, taskId),
        complete: () => console.info('Complete')
    });
  }

  openDialog(categoryId: string, task?: Task): void {
    let data!: Task;

    if (task){ // edit operation
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      data = { ...task, dueDate };
    } else { // add operation
      data = {
        name: '',
        description: '',
        dueDate: null,
        categoryId: categoryId,
        orderId: this.tasksByCategory[categoryId].length + 1,
      };
    }

    const dialogRef = this.dialogService.openDialog(AddEditTaskModalComponent, data);
    this.dialogCloseSubs = dialogRef.afterClosed().subscribe((result: { action: string; formValue: Task }) => {
      if (result && result.action === 'save') {
          const formValue = result.formValue;
          // Handle the returned form value
          if (task) {
            let taskToUpdate = {...task, ...formValue};
            // Edit operation
            this.taskService.updateTask(taskToUpdate)
            .subscribe({
                next: (v) => console.log('Task updated successfully'),
                error: (error) => console.error('Failed to update task', error, taskToUpdate),
                complete: () => console.info('Complete')
            });
          } else {
            // Add operation
            this.taskService.addTask(categoryId, formValue)
            .subscribe({
                next: (addedTask) => this.tasksByCategory[categoryId].push(addedTask),
                error: (error) => console.error('Failed to add task', error, formValue),
                complete: () => console.info('Complete')
            });
          }
      }
    });
  }

  ngOnDestroy(){
    if (this.dialogCloseSubs) this.dialogCloseSubs.unsubscribe();
    if (this.tasksByCategorySubs) this.tasksByCategorySubs.unsubscribe();
    if (this.updateTaskSubs) this.updateTaskSubs.unsubscribe();
  }

}
