import { Button, Flex, Result } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import type { NavigateFunction } from 'react-router'

export function NotFoundPage() {
  const navigate: NavigateFunction = useNavigate()
  const { t } = useTranslation('common')

  const handleNavigate = () => {
    void navigate('/dashboard')
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Result
        status="404"
        title="404"
        subTitle={t('error.404')}
        extra={(
          <Button type="primary" onClick={handleNavigate}>
            {t('error.backHome')}
          </Button>
        )}
      />
    </Flex>
  )
}
