import { RequireRole } from '@/components/require-role'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role="ADMIN">{children}</RequireRole>
}
