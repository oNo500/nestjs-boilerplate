import { ApiProperty } from '@nestjs/swagger'

export class UploadResponseDto {
  @ApiProperty({ description: 'Public URL to access the uploaded file' })
  fileUrl!: string

  @ApiProperty({ description: 'Original file name as provided by the client' })
  originalName!: string

  @ApiProperty({ description: 'File size in bytes' })
  size!: number

  @ApiProperty({ description: 'MIME type of the uploaded file' })
  mimeType!: string
}
