import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'

import { UploadService } from '@/modules/upload/application/services/upload.service'
import { multerConfig } from '@/modules/upload/infrastructure/multer.config'
import { UploadResponseDto } from '@/modules/upload/presentation/dtos/upload-response.dto'

@ApiTags('upload')
@Controller('upload')
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a single file (images and PDF, max 10MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File): UploadResponseDto {
    return this.uploadService.buildResult(file)
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  @ApiOperation({ summary: 'Upload up to 5 files (images and PDF, max 10MB each)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]): UploadResponseDto[] {
    return files.map((file) => this.uploadService.buildResult(file))
  }
}
