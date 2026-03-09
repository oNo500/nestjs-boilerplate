import fs from 'node:fs'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { UPLOAD_DIR } from '@/modules/upload/constants/multer.config'

import type { Env } from '@/app/config/env.schema'
import type { UploadResponseDto } from '@/modules/upload/presentation/dtos/upload-response.dto'
import type { OnModuleInit } from '@nestjs/common'

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  onModuleInit() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
  }

  buildResponse(file: Express.Multer.File): UploadResponseDto {
    const apiBaseUrl = this.configService.get('API_BASE_URL', { infer: true })
    const fileUrl = `${apiBaseUrl}/uploads/${file.filename}`

    return {
      fileUrl,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }
  }
}
