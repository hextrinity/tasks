import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from './task.interface';
import { TaskCategory } from './task-category.enum';

@Injectable({
  providedIn: 'root',
})

export class TasksService {

  private categoriesCollection!: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore) {
    this.categoriesCollection = this.firestore.collection<any>('categories');
  }


  getTasksByCategory(categoryId: string): BehaviorSubject<Task[]> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const tasksSubject = new BehaviorSubject<Task[]>([]);

    tasksCollection.snapshotChanges().pipe(
      map((actions: DocumentChangeAction<Task>[]) =>
        actions.map((a: DocumentChangeAction<Task>) => {
          const data = a.payload.doc.data() as Task;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      map((tasks: Task[]) => tasks.sort((a, b) => a.orderId - b.orderId)) // Sort tasks by orderId
    ).subscribe((tasks) => {
      tasksSubject.next(tasks);
    });

    return tasksSubject;
  }

  addTask(categoryId: string, task: Task): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const { id, ...taskWithoutId } = task;
    return from(tasksCollection.doc(String(id)).set(taskWithoutId));
  }

  updateTask(task: Task): Observable<void> {
    const { categoryId, id, ...taskWithoutId } = task;
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const taskDoc = tasksCollection.doc(id);

    // Update the task document with the new category and order ID
    return from(taskDoc.update(taskWithoutId));
  }

  deleteTask(categoryId: string, taskId: string): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    return from(tasksCollection.doc(taskId).delete());
  }

  updateTaskCategory(categoryId: string, tasks: Task[]): Observable<void[]> {
    const updateTasks$ = tasks.map((task) => {
      task.categoryId = categoryId; // Update the categoryId of the task
      const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
      const taskDoc = tasksCollection.doc(task.id); // Use task.id instead of id

      return from(taskDoc.update(task));
    });

    // Combine the observables into a single observable
    return forkJoin(updateTasks$);
  }




}
