import type { Todo, InsertTodo } from '@workspace/database'

/**
 * Todo Repository interface
 *
 * Abstract interface for Todo data access
 * Follows Dependency Inversion Principle: interface defined in application layer, implemented in infrastructure layer
 */
export interface TodoRepository {
  /**
   * Find all todos
   */
  findAll(): Promise<Todo[]>

  /**
   * Find todo by ID
   */
  findById(id: string): Promise<Todo | null>

  /**
   * Create new todo
   */
  create(data: Omit<InsertTodo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo>

  /**
   * Update todo
   */
  update(
    id: string,
    data: Partial<Omit<InsertTodo, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Todo | null>

  /**
   * Delete todo
   */
  delete(id: string): Promise<boolean>
}

/**
 * Repository injection token
 */
export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY')
