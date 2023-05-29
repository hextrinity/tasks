import { Component, OnInit } from '@angular/core';
import { TaskCategory } from 'src/app/store/task-category.enum';
import { Task } from 'src/app/store/task.interface';


import { TasksService } from 'src/app/store/tasks.service';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  tasks!: Task[];
  categoryId!: TaskCategory;

  taskCategories: typeof TaskCategory = TaskCategory;
  tasksByCategory: { [key: string]: Task[] } = {
    notUrgentImportant: [],
    notUrgentNotImportant: [],
    urgentImportant: [],
    urgentNotImportant: []
  };



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

  getTaskCategories(): { key: string, value: string }[] {
    return Object.entries(this.taskCategories).map(([key, value]) => ({ key, value }));
  }
}
