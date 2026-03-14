import { Button, Flex, Result } from 'antd'
import { useNavigate } from 'react-router'

import type { NavigateFunction } from 'react-router'

export function Error403Page() {
  const navigate: NavigateFunction = useNavigate()

  const handleNavigate = () => {
    void navigate('/dashboard')
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100%' }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you don't have permission to access this page"
        extra={(
          <Button type="primary" onClick={handleNavigate}>
            Back to Home
          </Button>
        )}
      />
    </Flex>
  )
}
