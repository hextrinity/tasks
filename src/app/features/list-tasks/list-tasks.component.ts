import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/store/task.interface';


import { TasksService } from 'src/app/store/tasks.service';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {
  tasks!: Task[];

  categoryId!: string

  constructor(private taskService: TasksService) {}

  ngOnInit(): void {

    this.categoryId = 'notUrgentImportant';

    this.taskService.getTasksByCategory(this.categoryId).subscribe((tasks) => {
      this.tasks = tasks;
    });
  }
}
