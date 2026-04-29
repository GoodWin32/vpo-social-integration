import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Resource } from '@/lib/types'
import { truncate } from '@/lib/utils'

export default function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {resource.resource_categories?.icon && (
            <span className="text-2xl shrink-0">{resource.resource_categories.icon}</span>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{resource.title}</h3>
            {resource.resource_categories && (
              <Badge variant="blue" className="mt-1">{resource.resource_categories.name}</Badge>
            )}
          </div>
        </div>
        {resource.is_verified && (
          <span title="Перевірено" className="text-green-500 text-lg shrink-0">✓</span>
        )}
      </div>

      {resource.description && (
        <p className="text-sm text-gray-500 leading-relaxed">{truncate(resource.description, 120)}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        {resource.city && (
          <span className="flex items-center gap-1"><span>📍</span>{resource.city}</span>
        )}
        {resource.contact_phone && (
          <span className="flex items-center gap-1"><span>📞</span>{resource.contact_phone}</span>
        )}
      </div>

      <Link
        href={`/resources/${resource.id}`}
        className="mt-auto w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm py-2 rounded-lg transition"
      >
        Детальніше
      </Link>
    </div>
  )
}
