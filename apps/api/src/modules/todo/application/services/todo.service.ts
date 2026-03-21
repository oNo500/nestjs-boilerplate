import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { TODO_REPOSITORY } from '@/modules/todo/application/ports/todo.repository.port'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { TodoRepository } from '@/modules/todo/application/ports/todo.repository.port'
import type { InsertTodo, Todo } from '@workspace/database'

type CreateTodoInput = Omit<InsertTodo, 'id' | 'createdAt' | 'updatedAt'>
type UpdateTodoInput = Partial<CreateTodoInput>

/**
 * TodoService — reference implementation for the simplest CRUD pattern.
 *
 * The service layer is intentionally kept here even for pass-through operations
 * to maintain a consistent architectural style across all modules.
 * In a real project, trivial resources like this could bypass the service layer
 * and have the controller call the repository port directly.
 *
 * Non-trivial application logic (e.g. NotFoundException mapping) belongs here,
 * not in the controller or repository.
 */
@Injectable()
export class TodoService {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepository,
  ) {}

  async findAll(): Promise<Todo[]> {
    return this.todoRepository.findAll()
  }

  async findById(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id)

    if (!todo) {
      throw new NotFoundException({ code: ErrorCode.TODO_NOT_FOUND, message: `Todo with ID ${id} not found` })
    }

    return todo
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    return this.todoRepository.create(input)
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    const todo = await this.todoRepository.update(id, input)

    if (!todo) {
      throw new NotFoundException({ code: ErrorCode.TODO_NOT_FOUND, message: `Todo with ID ${id} not found` })
    }

    return todo
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.todoRepository.delete(id)

    if (!deleted) {
      throw new NotFoundException({ code: ErrorCode.TODO_NOT_FOUND, message: `Todo with ID ${id} not found` })
    }
  }
}
