import { Module, Global } from '@nestjs/common'

import { DomainEventPublisher } from './domain-event-publisher'

/**
 * Domain events module
 *
 * Global module that provides DomainEventPublisher to all modules.
 */
@Global() // @global-approved: 框架级事件总线，所有发布领域事件的 context 都依赖
@Module({
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class DomainEventsModule {}
