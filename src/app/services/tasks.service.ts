import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, throwError, from, forkJoin } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { Task } from '../models/task.interface';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private categoriesCollection!: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore) {
    this.categoriesCollection = this.firestore.collection<any>('categories');
  }

  getTasksByCategory(categoryId: string, subCategoryName: string): BehaviorSubject<Task[]> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>(subCategoryName);
    const tasksSubject = new BehaviorSubject<Task[]>([]);

    tasksCollection.snapshotChanges().pipe(
      map((actions: DocumentChangeAction<Task>[]) =>
        actions.map((a: DocumentChangeAction<Task>) => {
          const data = a.payload.doc.data() as Task;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      map((tasks: Task[]) => tasks.sort((a, b) => a.orderId - b.orderId))
    ).subscribe((tasks) => {
      tasksSubject.next(tasks);
    });

    return tasksSubject;
  }

  addTask(categoryId: string, task: Task): Observable<Task> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const { ...taskWithoutId } = task;

    return from(tasksCollection.add(taskWithoutId)).pipe(
      map(docRef => {
        const addedTask: Task = { id: docRef.id, ...taskWithoutId };
        return addedTask;
      }),
      catchError(error => {
        return throwError(() => new Error(error))
      })
    );
  }

  updateTask(task: Task): Observable<void> {
    const { categoryId, id, ...taskWithoutId } = task;
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const taskDoc = tasksCollection.doc(id);

    return taskDoc.get().pipe(
      switchMap((doc) => {
        if (doc.exists) {
          return from(taskDoc.update(taskWithoutId));
        } else {
          return throwError(() => new Error(`Task with ID ${id} does not exist.`))
        }
      })
    );
  }

  deleteTaskForever(categoryId: string, taskId: string): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('deletedTasks');
    return from(tasksCollection.doc(taskId).delete());
  }


  deleteTask(categoryId: string, taskId: string): Observable<void> {
    const tasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('tasks');
    const deletedTasksCollection = this.categoriesCollection.doc(categoryId).collection<Task>('deletedTasks');

    return tasksCollection.doc(taskId).valueChanges().pipe(
      take(1),
      switchMap((task: Task | undefined) => {
        if (task) {
          return from(deletedTasksCollection.doc(taskId).set(task)).pipe(
            switchMap(() => from(tasksCollection.doc(taskId).delete()))
          );
        } else {
          return throwError(() => new Error(`Task with ID ${taskId} does not exist.`))
        }
      })
    );
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

    return forkJoin([...deleteTasks$, ...updateTasks$]);
  }

}
