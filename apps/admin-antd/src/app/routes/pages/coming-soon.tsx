import { Flex, Result } from 'antd'

export function ComingSoonPage() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: '100%' }}>
      <Result icon="info" title="Coming Soon" subTitle="This feature is under development." />
    </Flex>
  )
}
