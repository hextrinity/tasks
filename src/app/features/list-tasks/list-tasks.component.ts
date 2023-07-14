import { Component, OnInit } from '@angular/core';
import { TaskCategory } from 'src/app/store/task-category.enum';
import { Task } from 'src/app/store/task.interface';
import { TasksService } from 'src/app/store/tasks.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DialogService } from 'src/app/shared/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss'],
})
export class ListTasksComponent implements OnInit {
  taskCategories = Object.values(TaskCategory);
  tasksByCategory: { [key: string]: Task[] } = {};
  connectedDropLists: string[][] = [];
  subs!: Subscription;
  constructor(private taskService: TasksService, private dialogService: DialogService) {}

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
    this.taskService.getTasksByCategory(category).subscribe((tasks) => {
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
        this.taskService.updateTask(task).subscribe(
          () => {
            console.log('Task order updated successfully');
          },
          (error) => {
            console.error('Failed to update task order', error, task);
          }
        );
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
      this.taskService.updateTaskCategory(oldCategoryId, newCategoryId, container.data).subscribe(
        () => {
          console.log('Task category and order updated successfully');
        },
        (error) => {
          console.error('Failed to update task category and order', error, task);
        }
      );
    }
  }

  getTileBackground(index: number): string {
    const colors = ['lightblue', 'lightgreen', 'lightyellow', 'lightpink'];
    return colors[index % colors.length];
  }

  deleteTask(categoryId: string, taskId: string | null): void {
    if (!taskId) {
      return;
    }
    this.taskService.deleteTask(categoryId, taskId).subscribe(
      () => {
        console.log('Task deleted successfully');
      },
      (error) => {
        console.error('Failed to delete task', error, taskId);
      }
    );
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

    const dialogRef = this.dialogService.openDialog(data);
    this.subs = dialogRef.afterClosed().subscribe((result: { action: string; formValue: Task }) => {
      if (result && result.action === 'save') {
          const formValue = result.formValue;
          // Handle the returned form value
          if (task) {
            let taskToUpdate = {...task, ...formValue};
            // Edit operation
            this.taskService.updateTask(taskToUpdate).subscribe(
              () => {
                console.log('Task updated successfully');
              },
              (error) => {
                console.error('Failed to update task', error, taskToUpdate);
              }
            );
          } else {
            // Add operation
          this.taskService.addTask(categoryId, formValue).subscribe(
                (addedTask) => {
                  this.tasksByCategory[categoryId].push(addedTask);
                },
                (error) => {
                  console.error('Failed to add task', error, formValue);
                }
              );
          }
      }
    });
  }

  ngOnDestroy(){
    this.subs.unsubscribe();
  }

}
