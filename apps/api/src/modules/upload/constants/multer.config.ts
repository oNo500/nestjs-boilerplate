import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { HttpException, HttpStatus } from '@nestjs/common'
import { diskStorage } from 'multer'

import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

export const UPLOAD_DIR = './uploads'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_MIME_TYPES = /^(image\/.+|application\/pdf)$/

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `${randomUUID()}${ext}`)
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new HttpException(
          `Unsupported file type: ${file.mimetype}. Allowed: images and PDF`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
        false,
      )
    }
  },
}
