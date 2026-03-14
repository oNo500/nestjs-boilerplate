import { Button, Flex, Result } from 'antd'
import { useNavigate } from 'react-router'

import type { NavigateFunction } from 'react-router'

export function Error500Page() {
  const navigate: NavigateFunction = useNavigate()

  const handleNavigate = () => {
    void navigate('/dashboard')
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100%' }}>
      <Result
        status="500"
        title="500"
        subTitle="Sorry, an error occurred on the server"
        extra={(
          <Button type="primary" onClick={handleNavigate}>
            Back to Home
          </Button>
        )}
      />
    </Flex>
  )
}
