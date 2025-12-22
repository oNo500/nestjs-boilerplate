import { SetMetadata } from '@nestjs/common'

/**
 * Mark endpoint to use envelope wrapping for responses
 *
 * Spec reference:
 * - Google API Design Guide: Single resources return directly, collections use lightweight envelopes
 * - https://cloud.google.com/apis/design/design_patterns
 *
 * Use cases:
 * - Collection resources (lists, arrays)
 * - Responses requiring pagination metadata
 * - Responses requiring additional metadata
 *
 * @example
 * // Single resource - no decorator, return directly
 * @Get(':id')
 * async getUser(@Param('id') id: string) {
 *   return { id, email: '...' };  // Direct return
 * }
 *
 * @example
 * // Collection resource - use decorator
 * @Get()
 * @UseEnvelope()  // ← Mark as needing envelope
 * async getUsers() {
 *   return {
 *     object: 'list',
 *     data: [...],
 *     has_more: true
 *   };
 * }
 */
export const USE_ENVELOPE_KEY = 'use_envelope'

export const UseEnvelope = () => SetMetadata(USE_ENVELOPE_KEY, true)
