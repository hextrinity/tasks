import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TasksService } from './tasks.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Task } from '../models/task.interface';
import { TaskCategory } from '../models/task-category.enum';


describe('TasksService', () => {

    let tasksService: TasksService;

    const mockTasks: Task[] = [
    { id: '1', name: 'Task A', description: 'Task A', dueDate: null, orderId: 2, categoryId: TaskCategory.UrgentImportant } as Task,
    { id: '2', name: 'Task B', description: 'Task B', dueDate: null, orderId: 1, categoryId: TaskCategory.UrgentImportant } as Task
    ];

    const mockSnapshotChanges = mockTasks.map(task => ({
        payload: {
            doc: {
            id: task.id,
            data: () => task
            }
        }
    }));

    const collectionSpy = jasmine.createSpyObj('AngularFirestoreCollection', [
        'snapshotChanges'
        ]);

    collectionSpy.snapshotChanges.and.returnValue(
        new BehaviorSubject(mockSnapshotChanges)
    );

    const firestoreSpy = jasmine.createSpyObj('AngularFirestore', ['collection']);

    firestoreSpy.collection.and.returnValue({
        doc: () => ({
            collection: () => collectionSpy
        })
    });

    beforeEach(() => {
        TestBed.configureTestingModule({           
            providers: [
                TasksService, 
                { provide: AngularFirestore, useValue: firestoreSpy }
            ]
        });
        tasksService = TestBed.inject(TasksService);
    });

    it('should return tasks by categiry sorted by orderId', (done) => {

        const categoryId = TaskCategory.UrgentImportant;
        const subCategoryName = 'tasks';

        const tasks$ = tasksService.getTasksByCategory(categoryId, subCategoryName);

        tasks$.subscribe(tasks => {

            if (tasks.length > 0) {
                expect(tasks[0].orderId).toBe(1);
                expect(tasks[1].orderId).toBe(2);

                done();
            }
        });        
    })

    it('should add a task and return it with generated id', (done) => {

        const categoryId = TaskCategory.UrgentImportant;

        const newTask: Task = {
            name: 'New Task',
            description: 'Test task',
            dueDate: null,
            orderId: 1,
            categoryId: categoryId
        } as Task;

        const mockDocRef = { id: 'generated-id-123' };

        const addSpy = jasmine.createSpy('add').and.returnValue(Promise.resolve(mockDocRef));

        const collectionSpy = jasmine.createSpy('collection').and.returnValue({
            add: addSpy
        });

        const categoriesCollectionSpy = {
            doc: jasmine.createSpy().and.returnValue({
                collection: collectionSpy
            })
        };

        tasksService['categoriesCollection'] = categoriesCollectionSpy as any;

        tasksService.addTask(categoryId, newTask).subscribe((result) => {

            expect(addSpy).toHaveBeenCalledWith(newTask);

            expect(result).toEqual({
                id: 'generated-id-123',
                ...newTask
            });

            done();
        });

    });

    it('should update a task if it exists', (done) => {

        const task: Task = {
            id: '1',
            name: 'Updated Task',
            description: 'Updated',
            dueDate: null,
            orderId: 1,
            categoryId: TaskCategory.UrgentImportant
        } as Task;

        const mockDocSnapshot = {
            exists: true
        };

        const getSpy = jasmine.createSpy('get').and.returnValue(
            new BehaviorSubject(mockDocSnapshot)
        );

        const updateSpy = jasmine.createSpy('update')
            .and.returnValue(Promise.resolve());

        const docSpy = jasmine.createSpy('doc').and.returnValue({
            get: getSpy,
            update: updateSpy
        });

        const collectionSpy = jasmine.createSpy('collection').and.returnValue({
            doc: docSpy
        });

        const categoriesCollectionSpy = {
            doc: jasmine.createSpy().and.returnValue({
            collection: collectionSpy
            })
        };

        tasksService['categoriesCollection'] = categoriesCollectionSpy as any;

        tasksService.updateTask(task).subscribe(() => {

            expect(getSpy).toHaveBeenCalled();

            expect(updateSpy).toHaveBeenCalledWith({
                name: 'Updated Task',
                description: 'Updated',
                dueDate: null,
                orderId: 1
            });

            done();
        });

    });

    it('should throw error if task does not exist', (done) => {

        const task: Task = {
            id: '1',
            name: 'Task',
            description: '',
            dueDate: null,
            orderId: 1,
            categoryId: TaskCategory.UrgentImportant
        } as Task;

        const mockDocSnapshot = {
            exists: false
        };

        const getSpy = jasmine.createSpy('get').and.returnValue(
            new BehaviorSubject(mockDocSnapshot)
        );

        const updateSpy = jasmine.createSpy('update');

        const docSpy = jasmine.createSpy('doc').and.returnValue({
            get: getSpy,
            update: updateSpy
        });

        const collectionSpy = jasmine.createSpy('collection').and.returnValue({
            doc: docSpy
        });

        const categoriesCollectionSpy = {
            doc: jasmine.createSpy().and.returnValue({
            collection: collectionSpy
            })
        };

        tasksService['categoriesCollection'] = categoriesCollectionSpy as any;

        tasksService.updateTask(task).subscribe({
            next: () => fail('Expected error, but got success'),
            error: (err) => {
                expect(err).toBeTruthy();
                expect(updateSpy).not.toHaveBeenCalled();
                done();
            }
        });

    });

    it('should delete task permanently from deletedTasks collection', (done) => {

        const categoryId = TaskCategory.UrgentImportant;
        const taskId = '123';

        const deleteSpy = jasmine.createSpy('delete')
            .and.returnValue(Promise.resolve());

        const docSpy = jasmine.createSpy('doc').and.returnValue({
            delete: deleteSpy
        });

        const collectionSpy = jasmine.createSpy('collection').and.returnValue({
            doc: docSpy
        });

        const categoriesCollectionSpy = {
            doc: jasmine.createSpy().and.returnValue({
            collection: collectionSpy
            })
        };

        tasksService['categoriesCollection'] = categoriesCollectionSpy as any;

        tasksService.deleteTaskForever(categoryId, taskId).subscribe(() => {

            expect(categoriesCollectionSpy.doc).toHaveBeenCalledWith(categoryId);

            expect(collectionSpy).toHaveBeenCalledWith('deletedTasks');

            expect(docSpy).toHaveBeenCalledWith(taskId);

            expect(deleteSpy).toHaveBeenCalled();

            done();
        });

    });

    it('should delete tasks from old category and add them to new category', (done) => {

        const tasks: Task[] = [
            { id: '1', categoryId: TaskCategory.UrgentImportant, orderId: 1 } as Task,
            { id: '2', categoryId: TaskCategory.UrgentImportant, orderId: 2 } as Task
        ];

        const deleteSpy = jasmine.createSpy('delete').and.returnValue(Promise.resolve());
        const setSpy = jasmine.createSpy('set').and.returnValue(Promise.resolve());

        const docSpy = jasmine.createSpy('doc').and.returnValue({
            delete: deleteSpy,
            set: setSpy
        });

        const collectionSpy = jasmine.createSpy('collection').and.returnValue({
            doc: docSpy
        });

        const categoriesCollectionSpy = {
            doc: jasmine.createSpy().and.returnValue({
            collection: collectionSpy
            })
        };

        tasksService['categoriesCollection'] = categoriesCollectionSpy as any;

        tasksService.updateTaskCategory(TaskCategory.UrgentImportant, TaskCategory.UrgentNotImportant, tasks).subscribe(() => {

            expect(deleteSpy).toHaveBeenCalledTimes(2);
            expect(setSpy).toHaveBeenCalledTimes(2);

            expect(tasks[0].categoryId).toBe(TaskCategory.UrgentNotImportant);
            expect(tasks[1].categoryId).toBe(TaskCategory.UrgentNotImportant);

            done();

        });

    });

    it('should delete tasks from old category and add them to new category', (done) => {

        const oldCategoryId = TaskCategory.UrgentImportant;
        const newCategoryId = TaskCategory.UrgentNotImportant;

        const tasks: Task[] = [
            { id: '1', categoryId: oldCategoryId, orderId: 1 } as Task,
            { id: '2', categoryId: oldCategoryId, orderId: 2 } as Task
        ];

        const deleteSpy = jasmine.createSpy('delete')
            .and.returnValue(Promise.resolve());

        const setSpy = jasmine.createSpy('set')
            .and.returnValue(Promise.resolve());

        const docSpy = jasmine.createSpy('doc').and.callFake((id: string) => ({
            delete: deleteSpy,
            set: setSpy
        }));

        const collectionSpy = jasmine.createSpy('collection')
            .and.returnValue({
            doc: docSpy
            });

        const categoriesCollectionSpy = {
            doc: jasmine.createSpy().and.returnValue({
            collection: collectionSpy
            })
        };

        tasksService['categoriesCollection'] = categoriesCollectionSpy as any;

        tasksService.updateTaskCategory(oldCategoryId, newCategoryId, tasks)
            .subscribe(() => {
            
            expect(deleteSpy).toHaveBeenCalledTimes(tasks.length);
            
            expect(setSpy).toHaveBeenCalledTimes(tasks.length);
            
            expect(tasks[0].categoryId).toBe(newCategoryId);
            expect(tasks[1].categoryId).toBe(newCategoryId);

            done();
            });

    });
}) 