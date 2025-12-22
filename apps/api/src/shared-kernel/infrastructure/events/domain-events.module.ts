import { Module, Global } from '@nestjs/common'

import { DomainEventPublisher } from './domain-event-publisher'

/**
 * Domain events module
 *
 * Global module providing DomainEventPublisher to all modules
 */
@Global()
@Module({
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class DomainEventsModule {}
