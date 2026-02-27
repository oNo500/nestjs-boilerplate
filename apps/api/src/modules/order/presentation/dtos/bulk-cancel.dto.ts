import { IsArray, IsUUID } from 'class-validator'

export class BulkCancelDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[]
}
