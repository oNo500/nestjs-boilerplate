import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { TODO_REPOSITORY } from '@/modules/todo/application/ports/todo.repository.port'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { TodoRepository } from '@/modules/todo/application/ports/todo.repository.port'
import type { CreateTodoDto } from '@/modules/todo/presentation/dtos/create-todo.dto'
import type { UpdateTodoDto } from '@/modules/todo/presentation/dtos/update-todo.dto'
import type { Todo } from '@workspace/database'

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

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoRepository.create(createTodoDto)
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todoRepository.update(id, updateTodoDto)

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
