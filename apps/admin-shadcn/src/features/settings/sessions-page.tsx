'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'
import { Badge } from '@workspace/ui/components/badge'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible'
import { Separator } from '@workspace/ui/components/separator'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  MonitorIcon,
  SmartphoneIcon,
  MapPinIcon,
  ChevronDownIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { $api } from '@/lib/api'

import type { components } from '@/types/openapi'

type SessionItem = components['schemas']['SessionItemDto']

function parseUserAgent(ua: string | null): { browser: string, os: string } {
  if (!ua) return { browser: 'Unknown', os: 'Unknown' }

  const BROWSER_PATTERNS: [RegExp, string][] = [
    [/Edg\//i, 'Edge'],
    [/Chrome/i, 'Chrome'],
    [/Firefox/i, 'Firefox'],
    [/Safari/i, 'Safari'],
    [/Opera|OPR/i, 'Opera'],
  ]
  const browser = BROWSER_PATTERNS.find(([re]) => re.test(ua))?.[1] ?? 'Unknown Browser'

  const OS_PATTERNS: [RegExp, string][] = [
    [/Windows/i, 'Windows'],
    [/Mac OS/i, 'macOS'],
    [/Linux/i, 'Linux'],
    [/Android/i, 'Android'],
    [/iPhone|iPad|iPod/i, 'iOS'],
  ]
  const os = OS_PATTERNS.find(([re]) => re.test(ua))?.[1] ?? 'Unknown OS'

  return { browser, os }
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const absDiff = Math.abs(diff)
  const isPast = diff > 0

  const mins = Math.floor(absDiff / 60_000)
  const hours = Math.floor(absDiff / 3_600_000)
  const days = Math.floor(absDiff / 86_400_000)

  let label: string
  if (mins < 1) label = 'just now'
  else if (mins < 60) label = `${mins}m`
  else if (hours < 24) label = `${hours}h`
  else label = `${days}d`

  if (label === 'just now') return label
  return isPast ? `${label} ago` : `in ${label}`
}

function SessionCard({
  session,
  onRevoke,
  isRevoking,
}: {
  session: SessionItem
  onRevoke: (id: string) => void
  isRevoking: boolean
}) {
  const [uaOpen, setUaOpen] = useState(false)
  const isMobile = session.userAgent?.toLowerCase().includes('mobile') ?? false
  const Icon = isMobile ? SmartphoneIcon : MonitorIcon
  const { browser, os } = parseUserAgent(session.userAgent ?? null)

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-muted p-2.5 shrink-0">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                {browser}
                {' '}
                on
                {os}
              </span>
              {session.isCurrent && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinIcon className="size-3 shrink-0" />
              <span>{session.ipAddress ?? 'Unknown IP'}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Signed in
              {' '}
              {formatRelativeTime(session.createdAt)}
              {' '}
              · Expires
              {' '}
              {formatRelativeTime(session.expiresAt)}
            </p>
          </div>
        </div>

        {!session.isCurrent && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
          >
            Revoke
          </Button>
        )}
      </div>

      {/* Current session: collapsible full UA string */}
      {session.isCurrent && session.userAgent && (
        <Collapsible open={uaOpen} onOpenChange={setUaOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDownIcon
              className={`size-3 transition-transform ${uaOpen ? 'rotate-180' : ''}`}
            />
            {uaOpen ? 'Hide' : 'Show'}
            {' '}
            user agent
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="mt-1.5 break-all rounded bg-muted px-2 py-1.5 text-xs text-muted-foreground font-mono">
              {session.userAgent}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export function SessionsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = $api.useQuery('get', '/api/auth/sessions')

  const revokeOne = $api.useMutation('post', '/api/auth/revoke-session', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['get', '/api/auth/sessions'] })
      toast.success('Session revoked')
    },
    onError: () => toast.error('Failed to revoke session'),
  })

  const revokeAll = $api.useMutation('post', '/api/auth/revoke-sessions', {
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['get', '/api/auth/sessions'] })
      toast.success(`Revoked ${res.revokedCount} session${res.revokedCount === 1 ? '' : 's'}`)
    },
    onError: () => toast.error('Failed to revoke sessions'),
  })

  const sessions = data?.sessions ?? []
  const currentSession = sessions.find((s) => s.isCurrent)
  const otherSessions = sessions.filter((s) => !s.isCurrent)
  const uniqueIps = new Set(sessions.map((s) => s.ipAddress).filter(Boolean)).size

  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Manage your active sessions across devices.
        </p>
      </div>

      {/* Stats badges */}
      {!isLoading && sessions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">
            {sessions.length}
            {' '}
            Session
            {sessions.length === 1 ? '' : 's'}
          </Badge>
          <Badge variant="outline">
            {uniqueIps}
            {' '}
            Device
            {uniqueIps === 1 ? '' : 's'}
          </Badge>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading sessions...'
                // eslint-disable-next-line unicorn/no-nested-ternary
                : sessions.length > 0
                  ? `${currentSession ? '1 active' : '0 active'} · ${otherSessions.length} other`
                  : 'No active sessions'}
            </CardDescription>
          </div>

          {otherSessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm" className="shrink-0" />
                }
              >
                Revoke other sessions
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign out
                    {' '}
                    {otherSessions.length}
                    {' '}
                    other device
                    {otherSessions.length === 1 ? '' : 's'}
                    .
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={() => revokeAll.mutate({})}
                  >
                    Revoke
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading
            ? (
                Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((key) => (
                  <Skeleton key={key} className="h-24 w-full" />
                ))
              )
            : (
                <>
                  {/* Current session pinned to top */}
                  {currentSession && (
                    <SessionCard
                      session={currentSession}
                      onRevoke={(id) => revokeOne.mutate({ body: { sessionId: id } })}
                      isRevoking={revokeOne.isPending}
                    />
                  )}

                  {/* Other sessions */}
                  {otherSessions.length > 0 && (
                    <>
                      <div className="flex items-center gap-3 py-1">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground shrink-0">Other sessions</span>
                        <Separator className="flex-1" />
                      </div>
                      {otherSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          onRevoke={(id) => revokeOne.mutate({ body: { sessionId: id } })}
                          isRevoking={revokeOne.isPending}
                        />
                      ))}
                    </>
                  )}

                  {sessions.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">No active sessions found.</p>
                  )}
                </>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
