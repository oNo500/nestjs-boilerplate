import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { TODO_REPOSITORY } from '@/modules/todo/application/ports/todo.repository.port'

import type { TodoRepository } from '@/modules/todo/application/ports/todo.repository.port'
import type { CreateTodoDto } from '@/modules/todo/presentation/dtos/create-todo.dto'
import type { UpdateTodoDto } from '@/modules/todo/presentation/dtos/update-todo.dto'
import type { Todo } from '@workspace/database'

/**
 * Todo Service
 *
 * Handles business logic for todos
 * For simple CRUD operations, mainly delegates to Repository
 */
@Injectable()
export class TodoService {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepository,
  ) {}

  /**
   * Get all todos
   */
  async findAll(): Promise<Todo[]> {
    return this.todoRepository.findAll()
  }

  /**
   * Get todo by ID
   *
   * @throws NotFoundException if todo not found
   */
  async findById(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id)

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }

    return todo
  }

  /**
   * Create new todo
   */
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoRepository.create(createTodoDto)
  }

  /**
   * Update todo
   *
   * @throws NotFoundException if todo not found
   */
  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todoRepository.update(id, updateTodoDto)

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }

    return todo
  }

  /**
   * Delete todo
   *
   * @throws NotFoundException if todo not found
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.todoRepository.delete(id)

    if (!deleted) {
      throw new NotFoundException(`Todo with ID ${id} not found`)
    }
  }
}
