/**
 * Global notification instance
 *
 * Standard approach for using antd message outside the AntdApp context:
 * Obtain the instance via App.useApp() and register it in this module for use by non-React code.
 *
 * Usage:
 * 1. Render <NotificationRegistrar /> inside AppProvider
 * 2. Import { notification } from '@/lib/notification' in any module
 */

import type { MessageInstance } from 'antd/es/message/interface'

let messageInstance: MessageInstance | null = null

export const notification = {
  error: (content: string) => messageInstance?.error(content),
  success: (content: string) => messageInstance?.success(content),
  warning: (content: string) => messageInstance?.warning(content),
}

export function registerMessageInstance(instance: MessageInstance) {
  messageInstance = instance
}
