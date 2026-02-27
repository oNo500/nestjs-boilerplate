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
import { TodoListResponseDto, TodoResponseDto } from '@/modules/todo/presentation/dtos/todo-response.dto'
import { UpdateTodoDto } from '@/modules/todo/presentation/dtos/update-todo.dto'
import { UseEnvelope } from '@/shared-kernel/infrastructure/decorators/use-envelope.decorator'

import type { Todo } from '@workspace/database'

@ApiTags('todos')
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @UseEnvelope()
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({ status: 200, description: 'Returns the list of todos', type: TodoListResponseDto })
  async findAll(): Promise<TodoListResponseDto> {
    const todos = await this.todoService.findAll()
    return { object: 'list', data: todos }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID' })
  @ApiResponse({ status: 200, description: 'Returns the todo', type: TodoResponseDto })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async findById(@Param('id') id: string): Promise<Todo> {
    return this.todoService.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'Todo created successfully', type: TodoResponseDto })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiResponse({ status: 200, description: 'Todo updated successfully', type: TodoResponseDto })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todoService.update(id, updateTodoDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiResponse({ status: 204, description: 'Todo deleted successfully' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.todoService.delete(id)
  }
}
