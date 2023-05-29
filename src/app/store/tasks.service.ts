import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from './task.interface';

@Injectable({
  providedIn: 'root',
})

export class TasksService {

  private categoriesCollection!: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore) {
    this.categoriesCollection = this.firestore.collection<any>('categories');
  }


  getTasksByCategory(categoryId: string): Observable<Task[]> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    return tasksCollection.snapshotChanges().pipe(
      map((actions: DocumentChangeAction<Task>[]) =>
        actions.map((a: DocumentChangeAction<Task>) => {
          const data = a.payload.doc.data() as Task;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  addTask(categoryId: string, task: Task): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const { id, ...taskWithoutId } = task;
    return from(tasksCollection.doc(String(id)).set(taskWithoutId));
  }

  updateTask(categoryId: string, task: Task): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const { id, ...taskWithoutId } = task;
    return from(tasksCollection.doc(String(id)).update(taskWithoutId));
  }

  deleteTask(categoryId: string, taskId: string): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    return from(tasksCollection.doc(taskId).delete());
  }

}
