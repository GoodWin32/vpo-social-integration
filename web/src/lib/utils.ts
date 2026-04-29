export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'щойно'
  if (mins < 60) return `${mins} хв тому`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} год тому`
  const days = Math.floor(hours / 24)
  if (days < 7)  return `${days} дн тому`
  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '…'
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function profileCompletion(profile: {
  full_name?: string | null
  avatar_url?: string | null
  city?: string | null
  bio?: string | null
  phone?: string | null
  interests?: string[]
}): number {
  const fields = [
    profile.full_name,
    profile.avatar_url,
    profile.city,
    profile.bio,
    profile.phone,
    profile.interests?.length ? profile.interests : null,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}
