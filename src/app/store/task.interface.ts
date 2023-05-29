export interface Task {
  id?: string;
  name: string;
  description: string;
  dueDate: string;
  categoryId: string;
}

export interface Category {
  id: string;
  value: string;
}
