'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'
import PageHeader from '@/components/layout/PageHeader'
import { COMMUNITY_CATEGORIES, UKRAINE_REGIONS } from '@/lib/types'

const categoryOptions = COMMUNITY_CATEGORIES.map(c => ({ value: c, label: c }))
const regionOptions   = UKRAINE_REGIONS.map(r => ({ value: r, label: r }))

type Form = {
  name: string
  description: string
  city: string
  region: string
  category: string
  rules: string
  image_url: string | null
}

export default function EditCommunityPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [form, setForm] = useState<Form>({
    name: '', description: '', city: '', region: '',
    category: '', rules: '', image_url: null,
  })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load existing community data
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: community } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single()

      if (!community) { router.push('/communities'); return }
      if (community.created_by !== user.id) { router.push(`/communities/${id}`); return }

      setForm({
        name:        community.name ?? '',
        description: community.description ?? '',
        city:        community.city ?? '',
        region:      community.region ?? '',
        category:    community.category ?? '',
        rules:       community.rules ?? '',
        image_url:   community.image_url ?? null,
      })
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function setField(field: keyof Form, value: string | null) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim())        errs.name = 'Назва обов\'язкова'
    if (!form.description.trim()) errs.description = 'Опис обов\'язковий'
    if (!form.category)           errs.category = 'Оберіть категорію'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const { error } = await supabase
      .from('communities')
      .update({
        name:        form.name.trim(),
        description: form.description.trim(),
        city:        form.city || null,
        region:      form.region || null,
        category:    form.category || null,
        rules:       form.rules || null,
        image_url:   form.image_url || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setErrors({ submit: error.message })
      setSaving(false)
      return
    }

    router.push(`/communities/${id}`)
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('communities').delete().eq('id', id)
    router.push('/communities')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-gray-400">
        Завантаження...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Редагувати спільноту"
        description="Змініть інформацію про вашу спільноту"
      />

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <Input
          label="Назва спільноти"
          required
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          error={errors.name}
          placeholder="Наприклад: Переселенці Львова"
        />

        <Textarea
          label="Опис"
          required
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          error={errors.description}
          rows={4}
          placeholder="Розкажіть про мету та діяльність спільноти..."
        />

        <Select
          label="Категорія"
          required
          value={form.category}
          onChange={e => setField('category', e.target.value)}
          options={categoryOptions}
          placeholder="Оберіть категорію"
          error={errors.category}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Місто"
            value={form.city}
            onChange={e => setField('city', e.target.value)}
            placeholder="Київ"
          />
          <Select
            label="Регіон"
            value={form.region}
            onChange={e => setField('region', e.target.value)}
            options={regionOptions}
            placeholder="Оберіть регіон"
          />
        </div>

        <FileUpload
          bucket="images"
          folder="communities"
          currentUrl={form.image_url}
          onUpload={url => setField('image_url', url)}
          label="Обкладинка спільноти"
          hint="До 10 МБ · JPEG, PNG, WebP, GIF"
        />

        <Textarea
          label="Правила спільноти"
          value={form.rules}
          onChange={e => setField('rules', e.target.value)}
          rows={3}
          placeholder="Опишіть правила поведінки в спільноті..."
        />

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Скасувати
          </Button>
          <Button type="submit" loading={saving} className="flex-1" size="lg">
            Зберегти зміни
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 border border-red-100">
        <h3 className="font-semibold text-red-600 mb-1">Небезпечна зона</h3>
        <p className="text-sm text-gray-500 mb-4">
          Видалення спільноти є незворотнім. Всі учасники, дописи та пов&apos;язані події будуть видалені.
        </p>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Видалити спільноту
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600">
              Ви впевнені? Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Скасувати
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                Так, видалити
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
