import './styles/index.css'
import '@/config/i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/app'
import { AppProvider } from './app/provider'

if (import.meta.env.DEV) {
  const { worker } = await import('@/testing/msw/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
