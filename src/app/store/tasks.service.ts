import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, throwError, of, from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

    // Check if the category document exists
    const categoryDoc = this.categoriesCollection.doc(categoryId);
    return categoryDoc.get().pipe(
      switchMap((doc: DocumentSnapshot<any>) => {
        if (doc.exists) {
          // Update the task document with the new category and order ID
          return from(taskDoc.update(taskWithoutId));
        } else {
          // Handle the case where the category document does not exist
          return throwError(`Category with ID ${categoryId} does not exist.`);
        }
      })
    );
  }

  deleteTask(categoryId: string, taskId: string): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    return from(tasksCollection.doc(taskId).delete());
  }

  updateTaskCategory(oldCategoryId: string, newCategoryId: string, tasks: Task[]): Observable<void[]> {
    const deleteTasks$ = tasks.map((task) => {
      const tasksCollection = this.categoriesCollection.doc(oldCategoryId).collection<Task>('tasks');
      return from(tasksCollection.doc(task.id).delete());
    });

    const updateTasks$ = tasks.map((task) => {
      task.categoryId = newCategoryId;
      const tasksCollection = this.categoriesCollection.doc(newCategoryId).collection<Task>('tasks');
      const taskDoc = tasksCollection.doc(task.id);

      return from(taskDoc.set(task, { merge: true }));
    });

    // Combine the observables into a single observable
    return forkJoin([...deleteTasks$, ...updateTasks$]);
  }

}
