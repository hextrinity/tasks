import { TaskCategory } from "./task-category.enum";

export interface Task {
  id?: string;
  name: string;
  description: string;
  dueDate: Date | null;
  categoryId: TaskCategory | string;
  orderId: number;
}
