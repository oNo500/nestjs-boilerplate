import { Module } from '@nestjs/common'

import { TODO_REPOSITORY } from '@/modules/todo/application/ports/todo.repository.port'
import { TodoService } from '@/modules/todo/application/services/todo.service'
import { TodoRepositoryImpl } from '@/modules/todo/infrastructure/repositories/todo.repository'
import { TodoController } from '@/modules/todo/presentation/controllers/todo.controller'

/**
 * Todo Module
 *
 * Provides complete implementation of todo functionality
 */
@Module({
  controllers: [TodoController],
  providers: [
    TodoService, // Business logic service
    {
      provide: TODO_REPOSITORY, // Repository interface token
      useClass: TodoRepositoryImpl, // Uses Drizzle implementation
    },
  ],
})
export class TodoModule {}
