import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import ResourceCard from '@/components/ResourceCard'
import Link from 'next/link'
import { Resource } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: resource } = await supabase
    .from('resources')
    .select('*, resource_categories(*)')
    .eq('id', id)
    .single()

  if (!resource) notFound()

  const { data: related } = await supabase
    .from('resources')
    .select('*, resource_categories(*)')
    .eq('category_id', resource.category_id)
    .neq('id', id)
    .limit(3)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/resources" className="hover:text-blue-600 transition">Ресурси</Link>
        <span>/</span>
        <span className="text-gray-600">{resource.title}</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4 mb-5">
              {resource.resource_categories?.icon && (
                <span className="text-4xl">{resource.resource_categories.icon}</span>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {resource.resource_categories && (
                    <Badge variant="blue">{resource.resource_categories.name}</Badge>
                  )}
                  {resource.is_verified && (
                    <Badge variant="green">✓ Перевірено</Badge>
                  )}
                  {resource.city && (
                    <Badge variant="gray">📍 {resource.city}</Badge>
                  )}
                </div>
              </div>
            </div>

            {resource.description && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-2">Опис</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">{resource.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Контакти</h3>
            <div className="space-y-3 text-sm">
              {resource.contact_phone && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-xs text-gray-400">Телефон</p>
                    <a href={`tel:${resource.contact_phone}`} className="text-blue-600 hover:underline font-medium">
                      {resource.contact_phone}
                    </a>
                  </div>
                </div>
              )}
              {resource.contact_email && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <a href={`mailto:${resource.contact_email}`} className="text-blue-600 hover:underline">
                      {resource.contact_email}
                    </a>
                  </div>
                </div>
              )}
              {resource.address && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-gray-400">Адреса</p>
                    <p className="text-gray-700">{resource.address}</p>
                    {resource.city && <p className="text-gray-500">{resource.city}{resource.region && `, ${resource.region}`}</p>}
                  </div>
                </div>
              )}
              {resource.website_url && (
                <a
                  href={resource.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition mt-2"
                >
                  <span>🌐</span> Перейти на сайт
                </a>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400">
            Додано {formatDate(resource.created_at)}
          </div>
        </div>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 mb-4">Схожі ресурси</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(related as Resource[]).map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}
