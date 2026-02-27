import type { Todo, InsertTodo } from '@workspace/database'

/**
 * Todo Repository interface
 *
 * Defines the abstract interface for Todo data access
 * Follows the Dependency Inversion Principle: the application layer defines the interface, the infrastructure layer implements it
 */
export interface TodoRepository {
  /**
   * Find all todos
   */
  findAll(): Promise<Todo[]>

  /**
   * Find a todo by ID
   */
  findById(id: string): Promise<Todo | null>

  /**
   * Create a new todo
   */
  create(data: Omit<InsertTodo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo>

  /**
   * Update a todo
   */
  update(
    id: string,
    data: Partial<Omit<InsertTodo, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Todo | null>

  /**
   * Delete a todo
   */
  delete(id: string): Promise<boolean>
}

/**
 * Repository injection token
 */
export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY')
