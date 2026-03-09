'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AvatarUpload } from '@/features/settings/components/avatar-upload'
import { DeleteAccountDialog } from '@/features/settings/components/delete-account-dialog'
import { $api } from '@/lib/api'

// ─── Card 1: Profile ────────────────────────────────────────────────────────

const profileSchema = z.object({
  displayName: z.string().max(50, 'Maximum 50 characters').optional(),
  bio: z.string().max(500, 'Maximum 500 characters').optional(),
  website: z.url('Must be a valid URL').optional().or(z.literal('')),
})

type ProfileValues = z.infer<typeof profileSchema>

function ProfileCard() {
  const { data: profile } = $api.useQuery('get', '/api/profile')
  const updateProfile = $api.useMutation('patch', '/api/profile')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', bio: '', website: '' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName ?? '',
        bio: profile.bio ?? '',
        website: '',
      })
    }
  }, [profile, reset])

  async function onSubmit(values: ProfileValues) {
    await updateProfile.mutateAsync({
      body: {
        displayName: values.displayName ?? null,
        bio: values.bio ?? null,
      } as Parameters<typeof updateProfile.mutateAsync>[0]['body'],
    })
    toast.success('Profile saved')
    reset(values)
  }

  const avatarUrl = profile?.avatarUrl ?? null
  const displayName = profile?.displayName ?? ''

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your public profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldLegend variant="label">Avatar</FieldLegend>
            <div className="flex items-center gap-4">
              <AvatarUpload currentAvatarUrl={avatarUrl} fallbackText={displayName || 'U'} />
              <FieldDescription>
                Click the avatar to upload a new photo. Supports JPG, PNG, WebP up to 10MB.
              </FieldDescription>
            </div>
          </FieldSet>

          <div className="mt-6">
            <FieldGroup>
              <Field data-invalid={!!errors.displayName}>
                <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
                <Input
                  id="displayName"
                  placeholder="Your display name"
                  aria-invalid={!!errors.displayName}
                  {...register('displayName')}
                />
                <FieldDescription>Shown to other users. Max 50 characters.</FieldDescription>
                <FieldError errors={errors.displayName ? [errors.displayName] : []} />
              </Field>

              <Field data-invalid={!!errors.bio}>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself"
                  aria-invalid={!!errors.bio}
                  {...register('bio')}
                />
                <FieldDescription>A brief description about yourself. Max 500 characters.</FieldDescription>
                <FieldError errors={errors.bio ? [errors.bio] : []} />
              </Field>

              <Field data-invalid={!!errors.website}>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  aria-invalid={!!errors.website}
                  {...register('website')}
                />
                <FieldDescription>Your personal or professional website.</FieldDescription>
                <FieldError errors={errors.website ? [errors.website] : []} />
              </Field>
            </FieldGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

// ─── Card 2: Account Preferences ────────────────────────────────────────────

const accountSchema = z.object({
  timezone: z.string(),
  language: z.string(),
})

type AccountValues = z.infer<typeof accountSchema>

const TIMEZONES = [
  'UTC',
  'UTC+8 (Asia/Shanghai)',
  'UTC+9 (Asia/Tokyo)',
  'UTC-5 (America/New_York)',
  'UTC-8 (America/Los_Angeles)',
  'UTC+1 (Europe/London)',
  'UTC+2 (Europe/Paris)',
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'ja', label: '日本語' },
]

function AccountPreferencesCard() {
  const { handleSubmit, control, formState: { isDirty, isSubmitting } } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { timezone: 'UTC', language: 'en' },
  })

  function onSubmit(_values: AccountValues) {
    toast.success('Preferences saved')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>Customize your regional and language settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <Controller
                control={control}
                name="timezone"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>Used for displaying dates and times in your local timezone.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="language">Language</FieldLabel>
              <Controller
                control={control}
                name="language"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>The language used throughout the interface.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            Save preferences
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

// ─── Card 3: Notifications ───────────────────────────────────────────────────

const notificationsSchema = z.object({
  emailSecurityAlerts: z.boolean(),
  emailProductUpdates: z.boolean(),
  emailWeeklyDigest: z.boolean(),
})

type NotificationsValues = z.infer<typeof notificationsSchema>

const NOTIFICATION_FIELDS: {
  name: keyof NotificationsValues
  title: string
  description: string
}[] = [
  {
    name: 'emailSecurityAlerts',
    title: 'Security alerts',
    description: 'Receive emails about new sign-ins and security events.',
  },
  {
    name: 'emailProductUpdates',
    title: 'Product updates',
    description: 'Get notified about new features and improvements.',
  },
  {
    name: 'emailWeeklyDigest',
    title: 'Weekly digest',
    description: 'A weekly summary of your activity and highlights.',
  },
]

function NotificationsCard() {
  const { handleSubmit, control, formState: { isDirty, isSubmitting } } = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailSecurityAlerts: true,
      emailProductUpdates: false,
      emailWeeklyDigest: false,
    },
  })

  function onSubmit(_values: NotificationsValues) {
    toast.success('Notification preferences saved')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what emails you want to receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {NOTIFICATION_FIELDS.map(({ name, title, description }) => (
              <Field key={name} orientation="horizontal">
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id={name}
                    />
                  )}
                />
                <FieldContent>
                  <FieldTitle>
                    <label htmlFor={name} className="cursor-pointer">
                      {title}
                    </label>
                  </FieldTitle>
                  <FieldDescription>{description}</FieldDescription>
                </FieldContent>
              </Field>
            ))}
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            Save notifications
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

// ─── Card 4: Danger Zone ─────────────────────────────────────────────────────

function DangerZoneCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible and destructive actions. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page Entry ──────────────────────────────────────────────────────────────

export function GeneralSettingsForm() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pt-0">
      <ProfileCard />
      <AccountPreferencesCard />
      <NotificationsCard />
      <DangerZoneCard />
    </div>
  )
}
