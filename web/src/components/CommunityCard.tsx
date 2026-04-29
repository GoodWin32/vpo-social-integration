import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Community } from '@/lib/types'
import { truncate } from '@/lib/utils'

export default function CommunityCard({
  community,
  memberCount = 0,
}: {
  community: Community
  memberCount?: number
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-28 bg-gradient-to-br from-blue-400 to-blue-600 relative">
        {community.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={community.image_url} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
            👥
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{community.name}</h3>
          {community.category && (
            <Badge variant="blue" className="shrink-0">{community.category}</Badge>
          )}
        </div>

        {community.description && (
          <p className="text-sm text-gray-500 leading-relaxed">
            {truncate(community.description, 90)}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-2">
          {community.city && (
            <span className="flex items-center gap-1">
              <span>📍</span>{community.city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span>👤</span>{memberCount} учасник{memberCount === 1 ? '' : memberCount < 5 ? 'и' : 'ів'}
          </span>
        </div>

        <Link
          href={`/communities/${community.id}`}
          className="mt-2 w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm py-2 rounded-lg transition"
        >
          Переглянути
        </Link>
      </div>
    </div>
  )
}
