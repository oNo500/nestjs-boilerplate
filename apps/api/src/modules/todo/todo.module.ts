import { Module } from '@nestjs/common'

import { TODO_REPOSITORY } from '@/modules/todo/application/ports/todo.repository.port'
import { TodoService } from '@/modules/todo/application/services/todo.service'
import { TodoRepositoryImpl } from '@/modules/todo/infrastructure/repositories/todo.repository'
import { TodoController } from '@/modules/todo/presentation/controllers/todo.controller'

/**
 * Todo module
 *
 * Provides the complete implementation of Todo functionality
 */
@Module({
  controllers: [TodoController],
  providers: [
    TodoService, // business logic service
    {
      provide: TODO_REPOSITORY, // Repository interface token
      useClass: TodoRepositoryImpl, // Drizzle implementation
    },
  ],
})
export class TodoModule {}
