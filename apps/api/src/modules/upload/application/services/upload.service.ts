import fs from 'node:fs'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { UPLOAD_DIR } from '@/modules/upload/upload.constants'

import type { Env } from '@/app/config/env.schema'
import type { OnModuleInit } from '@nestjs/common'

export interface UploadResult {
  fileUrl: string
  originalName: string
  size: number
  mimeType: string
}

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  onModuleInit() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
  }

  buildResult(file: Express.Multer.File): UploadResult {
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
