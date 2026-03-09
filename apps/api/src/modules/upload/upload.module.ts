import { Module } from '@nestjs/common'

import { UploadService } from '@/modules/upload/application/services/upload.service'
import { UploadController } from '@/modules/upload/presentation/controllers/upload.controller'

@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
