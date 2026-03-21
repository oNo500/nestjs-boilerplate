/**
 * Domain object fixtures for unit tests
 *
 * Provides standard domain object builders using factory methods or reconstitute,
 * avoiding test-specific constructors.
 */
import { Article } from '@/modules/article/domain/aggregates/article.aggregate'
import { Content } from '@/modules/article/domain/value-objects/content.vo'
import { Slug } from '@/modules/article/domain/value-objects/slug.vo'
import { Title } from '@/modules/article/domain/value-objects/title.vo'
import { AuthIdentity } from '@/modules/auth/domain/aggregates/auth-identity.aggregate'
import { AuthSession } from '@/modules/auth/domain/entities/auth-session.entity'
import { Order } from '@/modules/order/domain/aggregates/order.aggregate'
import { OrderStatus } from '@/modules/order/domain/enums/order-status.enum'
import { Money } from '@/modules/order/domain/value-objects/money.vo'
import { OrderItem } from '@/modules/order/domain/value-objects/order-item.vo'
// ============================================================
// Auth fixtures
// ============================================================

export const AuthFixtures = {
  emailIdentity(overrides?: { id?: string, userId?: string, email?: string, passwordHash?: string }): AuthIdentity {
    return AuthIdentity.createEmailIdentity(
      overrides?.id ?? 'identity-id-1',
      overrides?.userId ?? 'user-id-1',
      overrides?.email ?? 'test@example.com',
      overrides?.passwordHash ?? 'hashed-password',
    )
  },

  oauthIdentity(
    provider: 'google' | 'github',
    overrides?: { id?: string, userId?: string, accountId?: string },
  ): AuthIdentity {
    return AuthIdentity.createOAuthIdentity(
      overrides?.id ?? 'oauth-identity-id-1',
      overrides?.userId ?? 'user-id-1',
      provider,
      overrides?.accountId ?? 'oauth-account-123',
    )
  },

  /**
   * AuthIdentity with no password (e.g. OAuth user that has no email/password)
   * Uses reconstitute to bypass the factory method constraints.
   */
  identityWithNoPassword(overrides?: { id?: string, userId?: string }): AuthIdentity {
    const now = new Date()
    return AuthIdentity.reconstitute(
      overrides?.id ?? 'identity-id-no-pw',
      overrides?.userId ?? 'user-id-1',
      'email',
      'test@example.com',
      null, // no password
      null,
      null,
      null,
      null,
      null,
      now,
      now,
    )
  },

  session(overrides?: { id?: string, userId?: string, token?: string, expiresAt?: Date }): AuthSession {
    return AuthSession.create(
      overrides?.id ?? 'session-id-1',
      overrides?.userId ?? 'user-id-1',
      overrides?.token ?? 'refresh-token-abc',
      overrides?.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    )
  },

  expiredSession(overrides?: { id?: string, userId?: string }): AuthSession {
    return AuthSession.reconstitute(
      overrides?.id ?? 'session-id-expired',
      overrides?.userId ?? 'user-id-1',
      'refresh-token-expired',
      new Date(Date.now() - 1000), // already expired
      null,
      null,
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    )
  },
}

// ============================================================
// Order fixtures
// ============================================================

export const OrderFixtures = {
  singleItem(overrides?: { productId?: string, quantity?: number, unitPrice?: string }): OrderItem {
    return OrderItem.create(
      overrides?.productId ?? 'prod-001',
      overrides?.quantity ?? 2,
      overrides?.unitPrice ?? '99.99',
    )
  },

  pendingOrder(overrides?: { id?: string, userId?: string }): Order {
    const items = [OrderItem.create('prod-001', 2, '99.99')]
    const totalAmount = Money.create('199.98', 'CNY')
    return Order.create(
      overrides?.id ?? 'order-id-1',
      overrides?.userId ?? 'user-id-1',
      items,
      totalAmount,
    )
  },

  /**
   * Returns an Order in PAID status with domain events cleared.
   *
   * Side-effect: internally calls `order.pay()` which increments `version` and emits
   * `OrderPaidEvent`, then `clearDomainEvents()` discards those events so they don't
   * interfere with assertions about subsequent operations.
   *
   * Use this when you need a paid order as a *precondition* (e.g. to test shipOrder).
   * Use `reconstitutedOrder(OrderStatus.PAID)` when you need precise control over
   * `version` or need to verify that NO domain events were raised during setup.
   */
  paidOrder(overrides?: { id?: string, userId?: string }): Order {
    const order = OrderFixtures.pendingOrder(overrides)
    order.pay()
    order.clearDomainEvents()
    return order
  },

  reconstitutedOrder(
    status: OrderStatus = OrderStatus.PENDING_PAYMENT,
    overrides?: { id?: string, userId?: string, version?: number },
  ): Order {
    const items = [OrderItem.create('prod-001', 1, '50.00')]
    const totalAmount = Money.create('50.00', 'CNY')
    const now = new Date()
    return Order.reconstitute(
      overrides?.id ?? 'order-id-recon',
      overrides?.userId ?? 'user-id-1',
      status,
      items,
      totalAmount,
      overrides?.version ?? 0,
      now,
      now,
    )
  },
}

// ============================================================
// Article fixtures
// ============================================================

const ARTICLE_BODY = 'This is a test article content with enough characters to be valid and publishable.'

export const ArticleFixtures = {
  draft(overrides?: { id?: string, title?: string, content?: string }): Article {
    return Article.create(
      overrides?.id ?? 'article-id-1',
      Title.create(overrides?.title ?? 'Test Article'),
      Content.create(overrides?.content ?? ARTICLE_BODY),
      Slug.create('test-article'),
    )
  },

  published(overrides?: { id?: string }): Article {
    const article = ArticleFixtures.draft(overrides)
    article.publish()
    article.clearDomainEvents()
    return article
  },

  archived(overrides?: { id?: string }): Article {
    const article = ArticleFixtures.published(overrides)
    article.archive()
    article.clearDomainEvents()
    return article
  },
}

// ============================================================
// User fixtures
// ============================================================

export const UserFixtures = {
  user(overrides?: Partial<{ id: string, name: string, email: string, role: string }>) {
    return {
      id: overrides?.id ?? 'user-id-1',
      name: overrides?.name ?? 'Test User',
      displayName: null,
      email: overrides?.email ?? 'test@example.com',
      emailVerified: false,
      image: null,
      role: overrides?.role ?? 'USER',
      banned: false,
      banReason: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  },

  admin(overrides?: Partial<{ id: string, email: string }>) {
    return UserFixtures.user({ ...overrides, role: 'ADMIN' })
  },
}
