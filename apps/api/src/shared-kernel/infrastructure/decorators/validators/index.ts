import { applyDecorators } from '@nestjs/common'
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { ValidationOptions } from 'class-validator'

export function IsEmailField(options?: ValidationOptions) {
  return applyDecorators(
    IsEmail({}, { ...options, context: { code: ErrorCode.INVALID_EMAIL } }),
  )
}

export function IsStringField(options?: ValidationOptions) {
  return applyDecorators(
    IsString({ ...options, context: { code: ErrorCode.INVALID_FORMAT } }),
  )
}

export function IsIntField(options?: ValidationOptions) {
  return applyDecorators(
    IsInt({ ...options, context: { code: ErrorCode.INVALID_FORMAT } }),
  )
}

export function IsNotEmptyField(options?: ValidationOptions) {
  return applyDecorators(
    IsNotEmpty({ ...options, context: { code: ErrorCode.REQUIRED_FIELD } }),
  )
}

export function IsUUIDField(version?: '3' | '4' | '5' | 'all', options?: ValidationOptions) {
  return applyDecorators(
    IsUUID(version, { ...options, context: { code: ErrorCode.INVALID_UUID } }),
  )
}

export function MinLengthField(min: number, options?: ValidationOptions) {
  return applyDecorators(
    MinLength(min, { ...options, context: { code: ErrorCode.INVALID_LENGTH } }),
  )
}

export function MaxLengthField(max: number, options?: ValidationOptions) {
  return applyDecorators(
    MaxLength(max, { ...options, context: { code: ErrorCode.INVALID_LENGTH } }),
  )
}

export function MinField(min: number, options?: ValidationOptions) {
  return applyDecorators(
    Min(min, { ...options, context: { code: ErrorCode.OUT_OF_RANGE } }),
  )
}

export function MaxField(max: number, options?: ValidationOptions) {
  return applyDecorators(
    Max(max, { ...options, context: { code: ErrorCode.OUT_OF_RANGE } }),
  )
}

export function MatchesField(pattern: RegExp, options?: ValidationOptions) {
  return applyDecorators(
    Matches(pattern, { ...options, context: { code: ErrorCode.INVALID_FORMAT } }),
  )
}

export function IsInField(values: unknown[], options?: ValidationOptions) {
  return applyDecorators(
    IsIn(values, { ...options, context: { code: ErrorCode.INVALID_FORMAT } }),
  )
}

export function IsBooleanField(options?: ValidationOptions) {
  return applyDecorators(
    IsBoolean({ ...options, context: { code: ErrorCode.INVALID_FORMAT } }),
  )
}
