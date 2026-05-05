import { getInitials, cn } from '@/lib/utils'
import Image from 'next/image'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6',  text: 'text-xs' },
  sm: { container: 'w-8 h-8',  text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
}

export default function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  className?: string
}) {
  const { container, text } = sizes[size]
  return (
    <div className={cn('relative rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0', container, className)}>
      {src ? (
        <Image src={src} alt={name ?? 'Avatar'} fill className="object-cover" />
      ) : (
        <span className={cn('font-semibold text-blue-600', text)}>
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}
