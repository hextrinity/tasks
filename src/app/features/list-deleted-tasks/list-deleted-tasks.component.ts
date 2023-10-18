import { Component } from '@angular/core';
import { TaskCategory, TaskCategoryNames } from 'src/app/models/task-category.enum';
import { Task } from 'src/app/models/task.interface';
import { TasksService } from 'src/app/services/tasks.service';
import { ColorSchemeService } from '../../services/color-scheme.service';

@Component({
  selector: 'app-list-deleted-tasks',
  templateUrl: './list-deleted-tasks.component.html',
  styleUrls: ['./list-deleted-tasks.component.scss']
})
export class ListDeletedTasksComponent {
  taskCategories = Object.values(TaskCategory);
  taskCategoryNames = TaskCategoryNames;
  tasksByCategory: { [key: string]: Task[] } = {};
  connectedDropLists: string[][] = [];

  constructor(
    private taskService: TasksService,
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
      this.taskService.getDeletedTasksByCategory(category).subscribe((tasks) => {
        this.tasksByCategory[category] = tasks;
      });
    }

    getConnectedDropLists(category: TaskCategory): string[] {
      return this.connectedDropLists[this.taskCategories.indexOf(category)];
    }

    getTileBackground(index: number): string {
      const currentScheme = this.colorSchemeService.getCurrentScheme().getValue();
     // console.log('currentScheme', currentScheme);

      const colors = [currentScheme.color1, currentScheme.color2, currentScheme.color3, currentScheme.color4];
      return colors[index % colors.length];
    }

    deleteTaskForever(categoryId: string, taskId: string | null): void {
      if (!taskId) {
        return;
      }
      this.taskService.deleteTaskForever(categoryId, taskId).subscribe(
        () => {
          console.log('Task deleted successfully');
        },
        (error) => {
          console.error('Failed to delete task', error, taskId);
        }
      );
    }
}
