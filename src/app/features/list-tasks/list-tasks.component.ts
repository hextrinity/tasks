import { Component, OnInit } from '@angular/core';
import { TaskCategory } from 'src/app/store/task-category.enum';
import { Task } from 'src/app/store/task.interface';
import { TasksService } from 'src/app/store/tasks.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss'],
})
export class ListTasksComponent implements OnInit {
  taskCategories = Object.values(TaskCategory);
  tasksByCategory: { [key: string]: Task[] } = {};
  connectedDropLists: string[][] = [];

  constructor(private taskService: TasksService) {}

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

    console.log("previousContainer", previousContainer);
    console.log("container", container);

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

      console.log("container.data after transfer", container.data); // Add this line

      // Update the category of the task
      task.categoryId = category.toString(); // Assign the correct category ID here

      // Call the updateTaskCategory method to transfer the task and update the order
      this.taskService.updateTaskCategory(category.toString(), container.data).subscribe(
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
}
