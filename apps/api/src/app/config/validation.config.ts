import {
  ValidationPipe,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common'

/**
 * Global validation pipe config
 * - whitelist: Remove non-whitelisted properties
 * - forbidNonWhitelisted: Throw 422 for unknown properties
 * - transform: Auto-convert types (string → number)
 * - stopAtFirstError: false - Return all validation errors
 * - errorHttpStatusCode: 422 (Unprocessable Entity)
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    stopAtFirstError: false,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: (errors) => {
      return new UnprocessableEntityException(errors)
    },
  })
}
