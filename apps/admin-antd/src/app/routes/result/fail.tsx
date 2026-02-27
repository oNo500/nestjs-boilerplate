import { PageContainer } from '@ant-design/pro-components'
import { Button, Card, Result, theme, Typography } from 'antd'
import { XCircle } from 'lucide-react'

const { Paragraph, Text } = Typography

interface ErrorItem {
  key: string
  label: string
  description: string
}

const errorList: ErrorItem[] = [
  {
    key: '1',
    label: 'Your account has been frozen',
    description: 'Contact hzq@example.com for assistance',
  },
  {
    key: '2',
    label: 'Your account is not yet eligible to apply',
    description: 'Go to apply for eligibility >',
  },
  {
    key: '3',
    label: 'The application includes another person\'s account',
    description: 'Please verify the account information in your application',
  },
]

export function ResultFailPage() {
  const { token } = theme.useToken()

  return (
    <PageContainer header={{ title: 'Failure', breadcrumb: {} }}>
      <Card variant="borderless">
        <Result
          status="error"
          title="Submission Failed"
          subTitle="Please review and correct the following issues before resubmitting."
          extra={(
            <>
              <Button type="primary">Go Back and Edit</Button>
              <Button>Cancel</Button>
            </>
          )}
        >
          <div style={{ marginBottom: 16 }}>
            <Paragraph>
              <Text strong style={{ fontSize: 16 }}>
                Your submission contains the following errors:
              </Text>
            </Paragraph>
            {errorList.map((item) => (
              <Paragraph key={item.key}>
                <XCircle
                  size={14}
                  style={{
                    color: token.colorError,
                    marginRight: 8,
                    verticalAlign: 'middle',
                  }}
                />
                <Text>{item.label}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {item.description}
                </Text>
              </Paragraph>
            ))}
          </div>
        </Result>
      </Card>
    </PageContainer>
  )
}
