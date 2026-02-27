export const OrderStatus = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
