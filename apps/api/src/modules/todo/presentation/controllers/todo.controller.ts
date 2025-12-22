import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { TodoService } from '@/modules/todo/application/services/todo.service'
import { CreateTodoDto } from '@/modules/todo/presentation/dtos/create-todo.dto'
import { TodoResponseDto } from '@/modules/todo/presentation/dtos/todo-response.dto'
import { UpdateTodoDto } from '@/modules/todo/presentation/dtos/update-todo.dto'

import type { Todo } from '@workspace/database'

/**
 * Todo Controller
 *
 * Handles HTTP requests for todos
 */
@ApiTags('todos')
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * Get all todos
   */
  @Get()
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({
    status: 200,
    description: 'Returns todos list',
    type: [TodoResponseDto],
  })
  async findAll(): Promise<Todo[]> {
    return this.todoService.findAll()
  }

  /**
   * Get todo by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get todo by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns todo',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
  })
  async findById(@Param('id') id: string): Promise<Todo> {
    return this.todoService.findById(id)
  }

  /**
   * Create new todo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo created',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation failed',
  })
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto)
  }

  /**
   * Update todo
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update todo' })
  @ApiResponse({
    status: 200,
    description: 'Todo updated',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation failed',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.update(id, updateTodoDto)
  }

  /**
   * Delete todo
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete todo' })
  @ApiResponse({
    status: 204,
    description: 'Todo deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.todoService.delete(id)
  }
}
