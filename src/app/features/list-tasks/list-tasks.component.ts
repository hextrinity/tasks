import { Component, OnInit } from '@angular/core';
import { TaskCategory } from 'src/app/store/task-category.enum';
import { Task } from 'src/app/store/task.interface';
import { TasksService } from 'src/app/store/tasks.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { forkJoin, switchMap } from 'rxjs';
@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  taskCategories = Object.values(TaskCategory);
  tasksByCategory: { [key: string]: Task[] } = {};

  constructor(private taskService: TasksService) {}

  ngOnInit(): void {
    this.fetchTasksByCategory(TaskCategory.NotUrgentImportant);
    this.fetchTasksByCategory(TaskCategory.NotUrgentNotImportant);
    this.fetchTasksByCategory(TaskCategory.UrgentImportant);
    this.fetchTasksByCategory(TaskCategory.UrgentNotImportant);
  }

  fetchTasksByCategory(category: TaskCategory): void {
    this.taskService.getTasksByCategory(category).subscribe((tasks) => {
      this.tasksByCategory[category] = tasks;
    });
  }

  getTaskCategories(): { key: string; value: string }[] {
    return Object.entries(this.taskCategories).map(([key, value]) => ({ key, value }));
  }

  getTileBackground(index: number): string {
    const tileColors = ['#B2DFDB', '#FFCCBC', '#BBDEFB', '#FFF9C4'];
    return tileColors[index % tileColors.length];
  }



  onDrop(event: CdkDragDrop<Task[]>, category: TaskCategory): void {
    const { previousContainer, container, item } = event;
    const task = item.data;

    console.log("previousContainer", previousContainer.id);
    console.log("container", container.id);

    if (previousContainer.id === container.id) {
      // Rearrange the tasks within the same category
      moveItemInArray(container.data, event.previousIndex, event.currentIndex);

      // Update the order IDs of the tasks in the same category
      container.data.forEach((task, index) => {
        task.orderId = index + 1; // Adding 1 to start the order ID from 1
        this.taskService.updateTask(task).subscribe(
          () => {
            console.log('Task order updated successfully');
          },
          (error) => {
            console.error('Failed to update task order', error);
          }
        );
      });
    } else {
      // Remove the task from the previous category
      previousContainer.data.splice(event.previousIndex, 1);

      // Update the order IDs of the tasks in the previous category
      previousContainer.data.forEach((task, index) => {
        task.orderId = index + 1; // Adding 1 to start the order ID from 1
        this.taskService.updateTask(task).subscribe(
          () => {
            console.log('Task order updated successfully');
          },
          (error) => {
            console.error('Failed to update task order', error);
          }
        );
      });

      // Add the task to the new category
      container.data.splice(event.currentIndex, 0, task);
      task.categoryId = category;
      task.orderId = event.currentIndex + 1; // Adding 1 to start the order ID from 1

      // Update the order IDs of the tasks in the new category
      container.data.forEach((task, index) => {
        task.orderId = index + 1; // Adding 1 to start the order ID from 1
        this.taskService.updateTask(task).subscribe(
          () => {
            console.log('Task order updated successfully');
          },
          (error) => {
            console.error('Failed to update task order', error);
          }
        );
      });

      // Update the category of the task
      this.taskService.updateTask(task).subscribe(
        () => {
          console.log('Task category updated successfully');
        },
        (error) => {
          console.error('Failed to update task category', error);
        }
      );
    }
  }










}
