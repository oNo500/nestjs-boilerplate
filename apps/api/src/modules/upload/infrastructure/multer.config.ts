import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { HttpException, HttpStatus } from '@nestjs/common'
import { diskStorage } from 'multer'

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from '@/modules/upload/upload.constants'

import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

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
