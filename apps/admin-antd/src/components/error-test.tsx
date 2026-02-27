import { Button, Space, Card, Typography } from 'antd'
import { useState } from 'react'

const { Title, Paragraph } = Typography

/**
 * Error boundary test component
 *
 * Used to verify that ErrorBoundary works correctly
 * For use in development environment only
 */
export function ErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('This is a test error for verifying ErrorBoundary functionality')
  }

  return (
    <Card>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>ErrorBoundary Test</Title>
          <Paragraph>
            Click the button below to trigger an error and verify that ErrorBoundary correctly catches and displays a friendly error UI.
          </Paragraph>
        </div>

        <Button danger type="primary" onClick={() => setShouldThrow(true)} size="large">
          Trigger Error
        </Button>

        <Paragraph type="secondary">Note: After triggering the error, you need to refresh the page to recover.</Paragraph>
      </Space>
    </Card>
  )
}
