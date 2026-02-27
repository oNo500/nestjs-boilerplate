import { SetMetadata } from '@nestjs/common'

/**
 * Marks an endpoint as requiring envelope-wrapped responses.
 *
 * Design rationale:
 * - Google API Design Guide: single resources returned directly; collections use a lightweight envelope
 * - https://cloud.google.com/apis/design/design_patterns
 *
 * Use cases:
 * - Collection resources (lists, arrays)
 * - Responses that include pagination metadata
 * - Responses that include additional metadata
 *
 * @example
 * // Single resource - no decorator, return directly
 * @Get(':id')
 * async getUser(@Param('id') id: string) {
 *   return { id, email: '...' };  // return object directly
 * }
 *
 * @example
 * // Collection resource - use decorator
 * @Get()
 * @UseEnvelope()  // &lt;- mark as requiring envelope
 * async getUsers() {
 *   return {
 *     object: 'list',
 *     data: [...],
 *     hasMore: true
 *   };
 * }
 */
export const USE_ENVELOPE_KEY = 'use_envelope'

export const UseEnvelope = () => SetMetadata(USE_ENVELOPE_KEY, true)
