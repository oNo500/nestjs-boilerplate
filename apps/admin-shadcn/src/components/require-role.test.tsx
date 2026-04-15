import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { UserProvider } from '@/components/user-provider'

import { RequireRole, ShowForRole } from './require-role'

import type { StoredUser } from '@/lib/token'

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
)

vi.mock('next/navigation', () => ({ notFound: notFoundMock }))

function renderWithUser(user: StoredUser | null, ui: React.ReactElement) {
  return render(<UserProvider user={user}>{ui}</UserProvider>)
}

describe('<RequireRole>', () => {
  it('renders children when user has the required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    renderWithUser(
      user,
      <RequireRole role="ADMIN">
        <div>secret</div>
      </RequireRole>,
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('calls notFound when user lacks the required role', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'USER' }
    notFoundMock.mockClear()
    expect(() =>
      renderWithUser(
        user,
        <RequireRole role="ADMIN">
          <div>secret</div>
        </RequireRole>,
      ),
    ).toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledOnce()
  })
})

describe('<ShowForRole>', () => {
  it('renders children when allowed', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN' }
    renderWithUser(
      user,
      <ShowForRole role="ADMIN">
        <button>Delete</button>
      </ShowForRole>,
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders nothing when not allowed', () => {
    const user: StoredUser = { id: 'u1', email: 'a@b.com', role: 'USER' }
    const { container } = renderWithUser(
      user,
      <ShowForRole role="ADMIN">
        <button>Delete</button>
      </ShowForRole>,
    )
    expect(container.querySelector('button')).toBeNull()
  })

  it('renders nothing when no user', () => {
    const { container } = renderWithUser(
      null,
      <ShowForRole role="USER">
        <span>Hi</span>
      </ShowForRole>,
    )
    expect(container.textContent).toBe('')
  })
})
