import { Button, Flex, Result } from 'antd'
import { useNavigate } from 'react-router'

import type { NavigateFunction } from 'react-router'

export function NotFoundPage() {
  const navigate: NavigateFunction = useNavigate()

  const handleNavigate = () => {
    void navigate('/dashboard')
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist"
        extra={(
          <Button type="primary" onClick={handleNavigate}>
            Back to Home
          </Button>
        )}
      />
    </Flex>
  )
}
